 
"use client";

import React, { useMemo, useState } from "react";
import { sankey, sankeyLinkHorizontal } from "d3-sankey";
import { PieChart, Pie, Cell, Tooltip as RechartsTooltip, ResponsiveContainer } from "recharts";

// --- Data ---
const SANKEY_DATA = {
  nodes: [
    { id: "travel", name: "Travel", color: "#f97316", gradient: ["#ffedd5", "#f97316"] },       // Orange
    { id: "checking", name: "Checking", color: "#a855f7", gradient: ["#f3e8ff", "#a855f7"] },   // Purple
    { id: "saving", name: "Saving", color: "#14b8a6", gradient: ["#ccfbf1", "#14b8a6"] },       // Teal
    { id: "emergency", name: "Emergency Fund", color: "#3b82f6", gradient: ["#dbeafe", "#3b82f6"] },
    { id: "investments", name: "Investments", color: "#8b5cf6", gradient: ["#ede9fe", "#8b5cf6"] },
    { id: "expenses", name: "Expenses", color: "#ec4899", gradient: ["#fce7f3", "#ec4899"] },   // Pink
  ],
  links: [
    { source: "travel", target: "saving", value: 400 },
    { source: "checking", target: "saving", value: 2400 },
    { source: "saving", target: "emergency", value: 600 },
    { source: "saving", target: "investments", value: 1000 },
    { source: "saving", target: "expenses", value: 1200 },
  ],
};

const DONUT_DATA = [
  { name: "Groceries", value: 500, color: "#10b981" },
  { name: "Utilities", value: 300, color: "#3b82f6" },
  { name: "Leisure", value: 400, color: "#f59e0b" },
];

export function NeonMoneyFlow() {
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);

  // --- Sankey Layout ---
  const graph = useMemo(() => {
    const generator = sankey<any, any>()
      .nodeId((d) => d.id)
      .nodeWidth(12)
      .nodePadding(40)
      .extent([
        [20, 20],
        [500, 380], // Fixed internal coordinate system
      ]);

    const nodes = SANKEY_DATA.nodes.map((d) => ({ ...d }));
    const links = SANKEY_DATA.links.map((d) => ({ ...d }));

    return generator({ nodes, links });
  }, []);

  // --- Render ---
  return (
    <div className="w-full max-w-6xl mx-auto bg-[#030305] p-8 rounded-3xl border border-white/5 shadow-2xl relative overflow-hidden font-sans">
      {/* Background ambient glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3/4 h-3/4 bg-teal-500/5 blur-[120px] rounded-full pointer-events-none" />

      <h2 className="text-white text-xl font-bold mb-8 tracking-wide">
        Wealth Flow <span className="text-teal-400 font-light">Architecture</span>
      </h2>

      <div className="flex flex-col lg:flex-row items-center gap-12">
        {/* Sankey Chart */}
        <div className="flex-1 w-full overflow-visible relative">
          <svg viewBox="0 0 520 400" className="w-full h-auto overflow-visible drop-shadow-2xl">
            <defs>
              {/* Glow Filter for links */}
              <filter id="neon-glow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur in="SourceGraphic" stdDeviation="3" result="blur1" />
                <feGaussianBlur in="SourceGraphic" stdDeviation="8" result="blur2" />
                <feMerge>
                  <feMergeNode in="blur2" />
                  <feMergeNode in="blur1" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>

              {/* Node Glow Filters */}
              {graph.nodes.map((node) => (
                <filter key={`glow-${node.id}`} id={`glow-${node.id}`}>
                  <feGaussianBlur stdDeviation="4" result="coloredBlur" />
                  <feMerge>
                    <feMergeNode in="coloredBlur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              ))}

              {/* Link Gradients */}
              {graph.links.map((link: any, i: number) => {
                const sourceColor = link.source.color;
                const targetColor = link.target.color;
                return (
                  <linearGradient
                    key={`grad-${i}`}
                    id={`link-grad-${i}`}
                    gradientUnits="userSpaceOnUse"
                    x1={link.source.x1}
                    x2={link.target.x0}
                  >
                    <stop offset="0%" stopColor={sourceColor} />
                    <stop offset="100%" stopColor={targetColor} />
                  </linearGradient>
                );
              })}
            </defs>

            {/* Links */}
            <g>
              {graph.links.map((link: any, i: number) => {
                const d = sankeyLinkHorizontal()(link);
                if (!d) return null;

                const isConnected =
                  !hoveredNode || link.source.id === hoveredNode || link.target.id === hoveredNode;

                return (
                  <g key={`link-${i}`}>
                    {/* Background track for the pulse */}
                    <path
                      d={d}
                      fill="none"
                      stroke={`url(#link-grad-${i})`}
                      strokeWidth={Math.max(2, link.width)}
                      strokeOpacity={isConnected ? 0.4 : 0.05}
                      className="transition-opacity duration-300"
                    />
                    
                    {/* Glowing core path */}
                    <path
                      d={d}
                      fill="none"
                      stroke={`url(#link-grad-${i})`}
                      strokeWidth={Math.max(1, link.width * 0.4)}
                      strokeOpacity={isConnected ? 1 : 0.1}
                      filter="url(#neon-glow)"
                      className="transition-opacity duration-300"
                    />
                  </g>
                );
              })}
            </g>

            {/* Nodes */}
            <g>
              {graph.nodes.map((node: any) => {
                const isConnected = !hoveredNode || hoveredNode === node.id;
                
                return (
                  <g
                    key={`node-${node.id}`}
                    onMouseEnter={() => setHoveredNode(node.id)}
                    onMouseLeave={() => setHoveredNode(null)}
                    className="cursor-pointer transition-opacity duration-300"
                    style={{ opacity: isConnected ? 1 : 0.3 }}
                  >
                    {/* Node Bar */}
                    <rect
                      x={node.x0}
                      y={node.y0}
                      width={node.x1 - node.x0}
                      height={Math.max(4, node.y1 - node.y0)}
                      fill={node.color}
                      rx={2}
                      filter={`url(#glow-${node.id})`}
                    />

                    {/* Node Text */}
                    <text
                      x={node.x0 < 250 ? node.x1 + 12 : node.x0 - 12}
                      y={(node.y0 + node.y1) / 2}
                      dy="0.35em"
                      textAnchor={node.x0 < 250 ? "start" : "end"}
                      fill="white"
                      className="text-[12px] font-semibold tracking-wide drop-shadow-md pointer-events-none"
                    >
                      {node.name}
                    </text>
                    
                    {/* Value Badge for Expenses */}
                    {node.id === 'expenses' && (
                      <text
                        x={node.x0 - 12}
                        y={(node.y0 + node.y1) / 2 + 16}
                        textAnchor="end"
                        fill={node.color}
                        className="text-[14px] font-bold tracking-wider pointer-events-none"
                        filter={`url(#glow-${node.id})`}
                      >
                        ${node.value}
                      </text>
                    )}
                  </g>
                );
              })}
            </g>
          </svg>
        </div>

        {/* Donut Chart Section */}
        <div className="w-full lg:w-72 h-72 relative flex-shrink-0 flex items-center justify-center">
          <div className="absolute inset-0 bg-gradient-to-br from-pink-500/5 to-purple-500/5 rounded-full blur-2xl" />
          
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-10">
            <span className="text-gray-400 text-xs uppercase tracking-widest mb-1">Total</span>
            <span className="text-3xl font-bold text-white drop-shadow-[0_0_8px_rgba(236,72,153,0.5)]">
              $1200
            </span>
          </div>

          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={DONUT_DATA}
                cx="50%"
                cy="50%"
                innerRadius={70}
                outerRadius={90}
                paddingAngle={5}
                dataKey="value"
                stroke="none"
              >
                {DONUT_DATA.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <RechartsTooltip 
                contentStyle={{ 
                  backgroundColor: 'rgba(5, 5, 10, 0.9)', 
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '8px',
                  backdropFilter: 'blur(10px)'
                }}
                itemStyle={{ color: '#fff', fontSize: '12px', fontWeight: 600 }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
