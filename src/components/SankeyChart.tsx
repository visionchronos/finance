"use client";

import { useMemo, useEffect, useState, useRef } from "react";
import { sankey, sankeyLinkHorizontal } from "d3-sankey";
import { formatCurrency } from "@/lib/utils";
import { getCategoryColor } from "@/lib/colors";
import { useRouter } from "next/navigation";

type NodeData = { id: string; name: string; type: 'income' | 'account' | 'expense' };
type LinkData = { source: string; target: string; value: number };

type SankeyProps = {
  data: {
    nodes: NodeData[];
    links: LinkData[];
  };
};

export function SankeyChart({ data }: SankeyProps) {
  const router = useRouter();
  const [dimensions, setDimensions] = useState({ width: 0, height: 400 });
  const [reducedMotion, setReducedMotion] = useState(false);
  
  // Interactivity state
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);
  const [hoveredLinkId, setHoveredLinkId] = useState<number | null>(null);
  const [tooltip, setTooltip] = useState<{ visible: boolean, x: number, y: number, content: React.ReactNode }>({ visible: false, x: 0, y: 0, content: null });
  
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mql = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mql.matches);

    const observer = new ResizeObserver((entries) => {
      if (entries[0]) {
        setDimensions({
          width: entries[0].contentRect.width,
          height: 400,
        });
      }
    });

    if (containerRef.current) observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  const graph = useMemo(() => {
    if (dimensions.width === 0 || data.nodes.length === 0 || data.links.length === 0) return null;

    const nodes = data.nodes.map(d => ({ ...d }));
    const links = data.links.map(d => ({ ...d }));

    const sankeyGenerator = sankey<NodeData, LinkData>()
      .nodeId((d: any) => d.id)
      .nodeWidth(16)
      .nodePadding(20)
      .extent([[20, 20], [dimensions.width - 20, dimensions.height - 20]]);

    return sankeyGenerator({ nodes: nodes as any, links: links as any });
  }, [data, dimensions]);

  if (data.nodes.length === 0 || data.links.length === 0) {
    return (
      <div className="bg-white dark:bg-[#02040a]/50 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-white/10 flex items-center justify-center h-[400px]">
        <p className="text-gray-500 dark:text-gray-400">Not enough data to generate money flow this month.</p>
      </div>
    );
  }

  if (!graph) {
    return <div ref={containerRef} className="h-[400px] w-full relative" />;
  }

  const maxFlow = Math.max(...graph.links.map((l: any) => l.value));

  const handleMouseMove = (e: React.MouseEvent, content: React.ReactNode) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    setTooltip({
      visible: true,
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
      content
    });
  };

  const hideTooltip = () => setTooltip(prev => ({ ...prev, visible: false }));

  const handleNodeClick = (node: any) => {
    // If it's a category node (income/expense), filter by it
    const parts = node.id.split('_');
    if (parts.length > 1 && parts[1]) {
      router.push(`?category=${parts[1]}#recent-transactions`);
    }
  };

  return (
    <div className="bg-white dark:bg-[#02040a]/50 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-white/10">
      <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-white mb-4">Money Flow</h3>
      <div ref={containerRef} className="w-full h-[400px] overflow-hidden relative cursor-crosshair">
        <svg width={dimensions.width} height={dimensions.height}>
          <defs>
            {graph.links.map((link: any, i: number) => {
              const sourceColor = getCategoryColor(link.source.name);
              const targetColor = getCategoryColor(link.target.name);
              return (
                <linearGradient key={`link-gradient-${i}`} id={`link-gradient-${i}`} gradientUnits="userSpaceOnUse" x1={link.source.x1} x2={link.target.x0}>
                  <stop offset="0%" stopColor={sourceColor} stopOpacity={1} />
                  <stop offset="100%" stopColor={targetColor} stopOpacity={1} />
                </linearGradient>
              );
            })}
          </defs>

          {/* Links */}
          <g>
            {graph.links.map((link: any, i: number) => {
              const d = sankeyLinkHorizontal()(link);
              if (!d) return null;
              
              // Calculate dynamic opacity based on hover state
              const isConnectedToHoveredNode = hoveredNodeId === null || link.source.id === hoveredNodeId || link.target.id === hoveredNodeId;
              const isHoveredLink = hoveredLinkId === i;
              const opacity = (hoveredLinkId !== null && !isHoveredLink) || !isConnectedToHoveredNode ? 0.1 : 0.4;
              
              // Dynamic duration based on value (max flow = 2s, min flow = 6s)
              const duration = reducedMotion ? 0 : 6 - (link.value / maxFlow) * 4;

              return (
                <g 
                  key={`link-group-${i}`}
                  onMouseEnter={() => setHoveredLinkId(i)}
                  onMouseLeave={() => setHoveredLinkId(null)}
                  onMouseMove={(e) => handleMouseMove(e, (
                    <div className="text-sm">
                      <div className="font-semibold text-gray-900 dark:text-white mb-1">{formatCurrency(link.value)}</div>
                      <div className="text-gray-600 dark:text-gray-400 flex items-center gap-1">
                        <span style={{ color: getCategoryColor(link.source.name) }}>{link.source.name}</span>
                        <span>→</span>
                        <span style={{ color: getCategoryColor(link.target.name) }}>{link.target.name}</span>
                      </div>
                    </div>
                  ))}
                  onMouseOut={hideTooltip}
                >
                  <path
                    id={`path-${i}`}
                    d={d}
                    fill="none"
                    stroke={`url(#link-gradient-${i})`}
                    strokeWidth={Math.max(2, link.width)}
                    style={{ strokeOpacity: opacity, transition: 'stroke-opacity 0.3s ease' }}
                    className="hover:stroke-opacity-75 cursor-pointer"
                  />
                  
                  {/* Animated dots scale speed with flow value */}
                  {!reducedMotion && isConnectedToHoveredNode && (
                    <>
                      <circle r={link.width > 10 ? 3 : 2} fill="#fff" opacity={0.8}>
                        <animateMotion dur={`${duration}s`} repeatCount="indefinite">
                          <mpath href={`#path-${i}`} />
                        </animateMotion>
                      </circle>
                      {link.width > 20 && (
                        <circle r={2} fill="#fff" opacity={0.6}>
                          <animateMotion dur={`${duration * 1.2}s`} repeatCount="indefinite" begin="0.5s">
                            <mpath href={`#path-${i}`} />
                          </animateMotion>
                        </circle>
                      )}
                    </>
                  )}
                </g>
              );
            })}
          </g>

          {/* Nodes */}
          <g>
            {graph.nodes.map((node: any, i: number) => {
              const isDimmed = hoveredNodeId !== null && hoveredNodeId !== node.id && hoveredLinkId === null;
              
              return (
                <g 
                  key={`node-${i}`}
                  onMouseEnter={() => setHoveredNodeId(node.id)}
                  onMouseLeave={() => setHoveredNodeId(null)}
                  onClick={() => handleNodeClick(node)}
                  onMouseMove={(e) => handleMouseMove(e, (
                    <div className="text-sm">
                      <div className="font-semibold text-gray-900 dark:text-white mb-1">{node.name}</div>
                      <div className="text-gray-600 dark:text-gray-400">Total: {formatCurrency(node.value)}</div>
                      {node.type !== 'account' && <div className="text-indigo-500 text-xs mt-1">Click to filter transactions</div>}
                    </div>
                  ))}
                  onMouseOut={hideTooltip}
                  style={{ opacity: isDimmed ? 0.3 : 1, transition: 'opacity 0.3s ease' }}
                  className="cursor-pointer"
                >
                  <rect
                    x={node.x0}
                    y={node.y0}
                    width={node.x1 - node.x0}
                    height={Math.max(2, node.y1 - node.y0)}
                    fill={getCategoryColor(node.name)}
                    rx={2}
                    className="hover:brightness-110 transition-all shadow-sm"
                  />
                  
                  <text
                    x={node.x0 < dimensions.width / 2 ? node.x1 + 8 : node.x0 - 8}
                    y={(node.y1 + node.y0) / 2}
                    dy="0.35em"
                    textAnchor={node.x0 < dimensions.width / 2 ? "start" : "end"}
                    className="text-xs font-semibold fill-gray-800 dark:fill-gray-200 pointer-events-none"
                  >
                    {node.name}
                  </text>
                </g>
              );
            })}
          </g>
        </svg>

        {/* HTML Tooltip Overlay */}
        {tooltip.visible && (
          <div 
            className="absolute z-50 bg-white/95 dark:bg-[#02040a]/95 backdrop-blur shadow-lg border border-gray-200 dark:border-white/10 rounded-lg p-3 pointer-events-none transform -translate-x-1/2 -translate-y-[120%]"
            style={{ left: tooltip.x, top: tooltip.y }}
          >
            {tooltip.content}
          </div>
        )}
      </div>
    </div>
  );
}
