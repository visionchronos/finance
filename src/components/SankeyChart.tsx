/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useMemo, useEffect, useState, useRef, useCallback } from "react";
import { sankey, sankeyLinkHorizontal } from "d3-sankey";
import { formatCurrency } from "@/lib/utils";
import { getSankeyNodeColor } from "@/lib/colors";
import { motion, AnimatePresence } from "framer-motion";

// ─── Types ──────────────────────────────────────────────────────────────────────

type NodeData = {
  id: string;
  name: string;
  type: "income" | "account" | "expense";
};

type LinkData = {
  source: string;
  target: string;
  value: number;
};

type SankeyProps = {
  data: {
    nodes: NodeData[];
    links: LinkData[];
  };
};

// ─── Constants ──────────────────────────────────────────────────────────────────

const SVG_HEIGHT = 420;
const NODE_WIDTH = 2; // Thin tick mark
const NODE_PADDING = 36;
const LABEL_GAP = 14; 

// Stroke-width scaling
const MAX_STROKE = 22;
const MIN_STROKE = 1.5;

// ─── Component ──────────────────────────────────────────────────────────────────

export function SankeyChart({ data }: SankeyProps) {
  const [dimensions, setDimensions] = useState({ width: 0, height: SVG_HEIGHT });
  const [reducedMotion, setReducedMotion] = useState(false);
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);
  const [hoveredLinkIdx, setHoveredLinkIdx] = useState<number | null>(null);
  const [tooltip, setTooltip] = useState<{
    visible: boolean;
    x: number;
    y: number;
    source: string;
    target: string;
    value: number;
  }>({ visible: false, x: 0, y: 0, source: "", target: "", value: 0 });

  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mql = window.matchMedia("(prefers-reduced-motion: reduce)");
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setReducedMotion(mql.matches);

    const observer = new ResizeObserver((entries) => {
      if (entries[0]) {
        setDimensions({
          width: entries[0].contentRect.width,
          height: SVG_HEIGHT,
        });
      }
    });

    if (containerRef.current) observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  const graph = useMemo(() => {
    if (
      dimensions.width === 0 ||
      data.nodes.length === 0 ||
      data.links.length === 0
    )
      return null;

    const nodes = data.nodes.map((d) => ({ ...d }));
    const links = data.links.map((d) => ({ ...d }));

    const generator = sankey<NodeData, LinkData>()
      .nodeId((d: any) => d.id)
      .nodeWidth(NODE_WIDTH)
      .nodePadding(NODE_PADDING)
      .extent([
        [1, 32],
        [dimensions.width - 1, dimensions.height - 32],
      ]);

    return generator({ nodes: nodes as any, links: links as any });
  }, [data, dimensions]);

  const showLinkTooltip = useCallback(
    (e: React.MouseEvent, sourceName: string, targetName: string, value: number) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      setTooltip({
        visible: true,
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
        source: sourceName,
        target: targetName,
        value,
      });
    },
    []
  );

  const hideTooltip = useCallback(
    () => setTooltip((prev) => ({ ...prev, visible: false })),
    []
  );

  if (data.nodes.length === 0 || data.links.length === 0) {
    return (
      <div className="bg-[#05050A] rounded-3xl border border-white/[0.06] p-8 flex items-center justify-center h-[480px]">
        <p className="text-gray-500 text-sm">
          Not enough data to generate money flow this month.
        </p>
      </div>
    );
  }

  if (!graph) {
    return (
      <div className="bg-[#05050A] rounded-3xl border border-white/[0.06] p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-5 h-px bg-[#00FFA3]" />
          <span className="text-[11px] uppercase tracking-[0.3em] text-gray-500">
            Money Flow
          </span>
        </div>
        <div ref={containerRef} className="w-full" style={{ height: SVG_HEIGHT }} />
      </div>
    );
  }

  const connectedLinkIndices = new Set<number>();
  const connectedNodeIds = new Set<string>();

  if (hoveredNodeId !== null) {
    connectedNodeIds.add(hoveredNodeId);
    graph.links.forEach((link: any, i: number) => {
      if (link.source.id === hoveredNodeId || link.target.id === hoveredNodeId) {
        connectedLinkIndices.add(i);
        connectedNodeIds.add(link.source.id);
        connectedNodeIds.add(link.target.id);
      }
    });
  }
  if (hoveredLinkIdx !== null) {
    const hl: any = graph.links[hoveredLinkIdx];
    if (hl) {
      connectedLinkIndices.add(hoveredLinkIdx);
      connectedNodeIds.add(hl.source.id);
      connectedNodeIds.add(hl.target.id);
    }
  }

  const isHovering = hoveredNodeId !== null || hoveredLinkIdx !== null;

  const sqrtValues = graph.links.map((l: any) => Math.sqrt(l.value));
  const minSqrt = Math.min(...sqrtValues);
  const maxSqrt = Math.max(...sqrtValues);
  const sqrtRange = maxSqrt - minSqrt || 1;

  function getStrokeWidth(value: number): number {
    const norm = (Math.sqrt(value) - minSqrt) / sqrtRange;
    return MIN_STROKE + norm * (MAX_STROKE - MIN_STROKE);
  }

  const maxFlow = Math.max(...graph.links.map((l: any) => l.value));
  const linkPathGen = sankeyLinkHorizontal();

  return (
    <div className="bg-[#05050A] rounded-3xl border border-white/[0.06] p-8 relative overflow-hidden group shadow-2xl">
      {/* ── Background Polish ──────────────────────────────────────────── */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3/4 h-3/4 bg-[#00FFA3]/5 blur-[120px] rounded-full pointer-events-none opacity-50 group-hover:opacity-100 transition-opacity duration-1000" />
      
      {/* Subtle Grid overlay */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-[0.03]" 
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 0h40v40H0V0zm1 1h38v38H1V1z' fill='%23ffffff' fill-opacity='1' fill-rule='evenodd'/%3E%3C/svg%3E")`,
          backgroundSize: '24px 24px'
        }}
      />

      {/* ── Eyebrow label ──────────────────────────────────────────────── */}
      <div className="flex items-center gap-3 mb-8 relative z-10">
        <div className="w-5 h-px bg-[#00FFA3]" />
        <span className="text-[11px] uppercase tracking-[0.3em] text-gray-400 font-semibold drop-shadow-sm">
          Money Flow
        </span>
      </div>

      <div
        ref={containerRef}
        className="w-full overflow-visible relative z-10"
        style={{ height: SVG_HEIGHT }}
      >
        <svg
          width={dimensions.width}
          height={dimensions.height}
          className="overflow-visible absolute inset-0"
        >
          <defs>
            <filter id="flow-glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur in="SourceGraphic" stdDeviation="6" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* ── LAYER 1: Flow lines ────────────────── */}
          <g>
            {graph.links.map((link: any, i: number) => {
              const d = linkPathGen(link);
              if (!d) return null;

              const sourceNode: any = link.source;
              const targetNode: any = link.target;
              const sourceColor = getSankeyNodeColor(sourceNode.name, sourceNode.type ?? "expense");
              const sw = getStrokeWidth(link.value);

              const isConnected = connectedLinkIndices.has(i);
              let strokeOpacity = 0.25;
              if (isHovering) {
                strokeOpacity = isConnected ? 0.95 : 0.05;
              }

              const useGlow = isHovering && isConnected;
              const duration = 7 - (link.value / maxFlow) * 5;

              return (
                <g
                  key={`link-${i}`}
                  onMouseEnter={() => setHoveredLinkIdx(i)}
                  onMouseLeave={() => setHoveredLinkIdx(null)}
                  onMouseMove={(e) =>
                    showLinkTooltip(e, sourceNode.name, targetNode.name, link.value)
                  }
                  onMouseOut={hideTooltip}
                  className="cursor-pointer"
                >
                  <motion.path
                    id={`flow-path-${i}`}
                    d={d}
                    fill="none"
                    stroke={sourceColor}
                    strokeWidth={sw}
                    strokeLinecap="round"
                    filter={useGlow ? "url(#flow-glow)" : undefined}
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{ pathLength: 1, opacity: strokeOpacity }}
                    transition={{ 
                      pathLength: { duration: 1.5, ease: [0.22, 1, 0.36, 1], delay: i * 0.05 },
                      opacity: { duration: 0.3 }
                    }}
                  />

                  {!reducedMotion && (
                    <circle
                      r={Math.min(2.5, sw * 0.2)}
                      fill="#fff"
                      style={{
                         opacity: isHovering && !isConnected ? 0 : 0.5,
                         transition: "opacity 0.25s ease",
                      }}
                    >
                      <animateMotion dur={`${duration}s`} repeatCount="indefinite">
                        <mpath href={`#flow-path-${i}`} />
                      </animateMotion>
                    </circle>
                  )}
                </g>
              );
            })}
          </g>

          {/* ── LAYER 2: Node tick marks ──────────── */}
          <g>
            {graph.nodes.map((node: any, i: number) => {
              const nodeColor = getSankeyNodeColor(node.name, node.type);
              const nodeH = Math.max(4, node.y1! - node.y0!);
              const midX = (node.x0! + node.x1!) / 2;

              const isConnected = !isHovering || connectedNodeIds.has(node.id);
              const nodeOpacity = isConnected ? 1 : 0.2;

              return (
                <motion.line
                  initial={{ opacity: 0, scaleY: 0 }}
                  animate={{ opacity: nodeOpacity, scaleY: 1 }}
                  transition={{ duration: 0.5, delay: 1 }}
                  key={`tick-${i}`}
                  x1={midX}
                  y1={node.y0!}
                  x2={midX}
                  y2={node.y0! + nodeH}
                  stroke={nodeColor}
                  strokeWidth={2}
                  strokeLinecap="round"
                  style={{
                    transformOrigin: `50% ${node.y0!}px`,
                    cursor: "pointer",
                  }}
                  onMouseEnter={() => setHoveredNodeId(node.id)}
                  onMouseLeave={() => setHoveredNodeId(null)}
                />
              );
            })}
          </g>
        </svg>

        {/* ── LAYER 3: Glassmorphism HTML Labels ─────────────────────────────── */}
        {graph.nodes.map((node: any, i: number) => {
          const midY = (node.y0! + node.y1!) / 2;
          const midX = (node.x0! + node.x1!) / 2;

          const isConnected = !isHovering || connectedNodeIds.has(node.id);
          const labelOpacity = isConnected ? 1 : 0.15;

          const isLeft = node.x0! < dimensions.width * 0.33;
          const isRight = node.x0! > dimensions.width * 0.60;
          
          const labelColor = getSankeyNodeColor(node.name, node.type);

          let left: string | number = "auto";
          let right: string | number = "auto";
          let top: string | number = midY;
          let transform = "translateY(-50%)";

          if (isLeft) {
            left = midX + LABEL_GAP;
          } else if (isRight) {
            right = dimensions.width - midX + LABEL_GAP;
          } else {
            left = midX;
            top = node.y0! - 18;
            transform = "translate(-50%, -100%)";
          }

          return (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: labelOpacity, y: 0 }}
              transition={{ duration: 0.5, delay: 1 + i * 0.05 }}
              key={`html-label-${i}`}
              className="absolute pointer-events-none select-none flex flex-col"
              style={{
                left,
                right,
                top,
                transform,
              }}
            >
              <div 
                className="backdrop-blur-md bg-white/[0.03] border border-white/[0.08] px-3 py-1.5 rounded-full flex flex-col shadow-lg items-center"
                style={isLeft ? { alignItems: 'flex-start' } : isRight ? { alignItems: 'flex-end' } : { alignItems: 'center' }}
              >
                <span className="text-xs font-semibold tracking-wide flex items-center gap-2 text-white">
                  {node.type !== 'account' && (
                    <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: labelColor }} />
                  )}
                  {node.name}
                </span>
                <span className="text-[10px] text-gray-400 font-medium tracking-wider mt-0.5">
                  {formatCurrency(node.value ?? 0)}
                </span>
              </div>
            </motion.div>
          );
        })}

        {/* ── Cursor-following tooltip ──────────────────────────────── */}
        <AnimatePresence>
          {tooltip.visible && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.15 }}
              className="absolute z-50 pointer-events-none -translate-x-1/2 -translate-y-[130%] whitespace-nowrap"
              style={{ left: tooltip.x, top: tooltip.y }}
            >
              <div className="bg-[#0a0a14]/90 backdrop-blur-xl border border-white/10 rounded-xl px-4 py-2.5 shadow-[0_0_40px_rgba(0,255,163,0.1)]">
                <div className="text-sm font-bold text-white mb-1">
                  {formatCurrency(tooltip.value)}
                </div>
                <div className="text-xs font-medium text-gray-400 flex items-center gap-2">
                  <span className="text-[#00FFA3]">{tooltip.source}</span>
                  <span className="text-gray-600">→</span>
                  <span className="text-[#C4B5FD]">{tooltip.target}</span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
