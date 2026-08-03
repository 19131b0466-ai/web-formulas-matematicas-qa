'use client';

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

const COLORS = ['#22e6ff', '#ff2bd6', '#3dffc0', '#7af6ff', '#ff4d7a', '#a78bfa', '#fbbf24'];
const GRID = 'rgba(34, 230, 255, 0.14)';
const AXIS = '#6f93a8';
const TOOLTIP_STYLE = {
  background: 'rgba(7, 17, 28, 0.95)',
  border: '1px solid rgba(34, 230, 255, 0.35)',
  borderRadius: 0,
  color: '#d7f7ff',
  fontSize: 12,
};

export function VisitsLineChart({
  data,
}: {
  data: Array<{ date: string; visits: number; uniqueSessions: number }>;
}) {
  const formatted = data.map((d) => ({
    ...d,
    label: d.date.slice(0, 10),
  }));

  return (
    <div className="h-72 w-full">
      <ResponsiveContainer>
        <LineChart data={formatted}>
          <CartesianGrid stroke={GRID} strokeDasharray="4 6" />
          <XAxis dataKey="label" stroke={AXIS} fontSize={11} tickLine={false} />
          <YAxis stroke={AXIS} fontSize={11} allowDecimals={false} tickLine={false} />
          <Tooltip contentStyle={TOOLTIP_STYLE} />
          <Line
            type="monotone"
            dataKey="visits"
            stroke="#22e6ff"
            strokeWidth={2.2}
            dot={false}
            activeDot={{ r: 4, fill: '#22e6ff' }}
          />
          <Line
            type="monotone"
            dataKey="uniqueSessions"
            stroke="#ff2bd6"
            strokeWidth={2.2}
            dot={false}
            activeDot={{ r: 4, fill: '#ff2bd6' }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export function HorizontalBars({ data }: { data: Array<{ name: string; count: number }> }) {
  return (
    <div className="h-80 w-full">
      <ResponsiveContainer>
        <BarChart data={data} layout="vertical" margin={{ left: 24, right: 16 }}>
          <CartesianGrid stroke={GRID} strokeDasharray="4 6" />
          <XAxis type="number" stroke={AXIS} fontSize={11} allowDecimals={false} tickLine={false} />
          <YAxis
            type="category"
            dataKey="name"
            width={120}
            stroke={AXIS}
            fontSize={10}
            tickLine={false}
          />
          <Tooltip contentStyle={TOOLTIP_STYLE} />
          <Bar dataKey="count" fill="#22e6ff" radius={[0, 2, 2, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function DevicePie({ data }: { data: Array<{ name: string; count: number }> }) {
  return (
    <div className="h-72 w-full">
      <ResponsiveContainer>
        <PieChart>
          <Pie data={data} dataKey="count" nameKey="name" innerRadius={58} outerRadius={96} stroke="#04080f">
            {data.map((_, i) => (
              <Cell key={data[i]?.name ?? String(i)} fill={COLORS[i % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip contentStyle={TOOLTIP_STYLE} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
