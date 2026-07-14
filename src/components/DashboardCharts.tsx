"use client";

import React, { useMemo } from "react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Legend, AreaChart, Area } from "recharts";
import { formatCurrency } from "@/lib/utils";
import { getCategoryColor } from "@/lib/colors";

export const DashboardCharts = React.memo(function DashboardCharts({ 
  pieChartData, 
  lineChartData,
  netWorthData
}: { 
  pieChartData: { name: string, value: number }[],
  lineChartData: { date: string, amount: number }[],
  netWorthData: { date: string, amount: number }[]
}) {
  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
      {/* Pie Chart */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <h3 className="text-lg font-medium text-gray-900 mb-6">Spending by Category (This Month)</h3>
        {pieChartData.length > 0 ? (
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieChartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  fill="#8884d8"
                  paddingAngle={5}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                >
                  {pieChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={getCategoryColor(entry.name)} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: any) => typeof value === 'number' ? formatCurrency(value) : value} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="h-72 flex items-center justify-center text-gray-500 text-sm">
            No expenses this month.
          </div>
        )}
      </div>

      {/* Line Chart */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <h3 className="text-lg font-medium text-gray-900 mb-6">Spending Trend (This Month)</h3>
        {lineChartData.length > 1 ? (
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={lineChartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                <XAxis 
                  dataKey="date" 
                  tickFormatter={(val) => new Date(val).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })}
                  stroke="#9ca3af"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis 
                  tickFormatter={(val) => `₹${val}`}
                  stroke="#9ca3af"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip 
                  formatter={(value: any) => [typeof value === 'number' ? formatCurrency(value) : value, 'Amount']}
                  labelFormatter={(label) => new Date(label as string).toLocaleDateString()}
                />
                <Line 
                  type="monotone" 
                  dataKey="amount" 
                  stroke="#4f46e5" 
                  strokeWidth={3}
                  dot={{ r: 4, fill: "#4f46e5", strokeWidth: 2, stroke: "#fff" }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="h-72 flex flex-col items-center justify-center text-gray-500 text-sm">
            <svg className="w-12 h-12 text-gray-300 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
            </svg>
            Need at least 2 data points for a trend line.
          </div>
        )}
      </div>

      {/* Net Worth Chart */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 lg:col-span-2">
        <h3 className="text-lg font-medium text-gray-900 mb-6">Net Worth (Last 30 Days)</h3>
        {netWorthData.length > 1 ? (
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={netWorthData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <defs>
                  <linearGradient id="colorNetWorth" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                <XAxis 
                  dataKey="date" 
                  tickFormatter={(val) => new Date(val).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })}
                  stroke="#9ca3af"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis 
                  tickFormatter={(val) => `₹${val}`}
                  stroke="#9ca3af"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip 
                  formatter={(value: any) => [typeof value === 'number' ? formatCurrency(value) : value, 'Net Worth']}
                  labelFormatter={(label) => new Date(label as string).toLocaleDateString()}
                />
                <Area 
                  type="monotone" 
                  dataKey="amount" 
                  stroke="#10b981" 
                  fillOpacity={1} 
                  fill="url(#colorNetWorth)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="h-72 flex flex-col items-center justify-center text-gray-500 text-sm">
            <svg className="w-12 h-12 text-gray-300 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
            Need at least 2 data points to chart net worth.
          </div>
        )}
      </div>
    </div>
  );
});
