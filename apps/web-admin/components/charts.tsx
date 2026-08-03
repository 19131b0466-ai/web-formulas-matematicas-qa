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

const COLORS = ['#00f0ff', '#ff1fc7', '#b8ff3c', '#7dfff8', '#ff3b6b', '#9b87ff', '#ffd84a'];
const GRID = 'rgba(120, 150, 180, 0.14)';
const AXIS = '#6a8499';
const TOOLTIP_STYLE = {
  background: 'linear-gradient(180deg, #1a222e, #0d131c)',
  border: '1px solid rgba(0, 240, 255, 0.45)',
  borderRadius: 0,
  color: '#e6fbff',
  fontSize: 11,
  boxShadow: '0 0 16px rgba(0, 240, 255, 0.2)',
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
    <div className="h-48 w-full sm:h-52">
      <ResponsiveContainer>
        <LineChart data={formatted} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid stroke={GRID} strokeDasharray="3 5" />
          <XAxis dataKey="label" stroke={AXIS} fontSize={10} tickLine={false} />
          <YAxis stroke={AXIS} fontSize={10} allowDecimals={false} tickLine={false} width={28} />
          <Tooltip contentStyle={TOOLTIP_STYLE} />
          <Line
            type="monotone"
            dataKey="visits"
            stroke="#00f0ff"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 3, fill: '#00f0ff', stroke: '#7dfff8' }}
          />
          <Line
            type="monotone"
            dataKey="uniqueSessions"
            stroke="#ff1fc7"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 3, fill: '#ff1fc7', stroke: '#ff9ae4' }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export function HorizontalBars({ data }: { data: Array<{ name: string; count: number }> }) {
  return (
    <div className="h-52 w-full sm:h-56">
      <ResponsiveContainer>
        <BarChart data={data} layout="vertical" margin={{ left: 8, right: 12, top: 4, bottom: 0 }}>
          <CartesianGrid stroke={GRID} strokeDasharray="3 5" />
          <XAxis type="number" stroke={AXIS} fontSize={10} allowDecimals={false} tickLine={false} />
          <YAxis
            type="category"
            dataKey="name"
            width={108}
            stroke={AXIS}
            fontSize={9}
            tickLine={false}
          />
          <Tooltip contentStyle={TOOLTIP_STYLE} />
          <Bar dataKey="count" fill="#00f0ff" radius={[0, 1, 1, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function DevicePie({ data }: { data: Array<{ name: string; count: number }> }) {
  return (
    <div className="h-44 w-full sm:h-48">
      <ResponsiveContainer>
        <PieChart>
          <Pie
            data={data}
            dataKey="count"
            nameKey="name"
            innerRadius={42}
            outerRadius={68}
            stroke="#0a1018"
            strokeWidth={2}
          >
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
