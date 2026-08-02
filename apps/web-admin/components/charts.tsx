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

const COLORS = ['#f0b429', '#3dba95', '#6ea8fe', '#f07178', '#c792ea', '#89ddff', '#ffcb6b'];

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
          <CartesianGrid stroke="#243149" strokeDasharray="3 3" />
          <XAxis dataKey="label" stroke="#93a4bf" fontSize={12} />
          <YAxis stroke="#93a4bf" fontSize={12} allowDecimals={false} />
          <Tooltip
            contentStyle={{ background: '#121a2b', border: '1px solid #243149', borderRadius: 8 }}
          />
          <Line type="monotone" dataKey="visits" stroke="#f0b429" strokeWidth={2} dot={false} />
          <Line
            type="monotone"
            dataKey="uniqueSessions"
            stroke="#3dba95"
            strokeWidth={2}
            dot={false}
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
          <CartesianGrid stroke="#243149" strokeDasharray="3 3" />
          <XAxis type="number" stroke="#93a4bf" fontSize={12} allowDecimals={false} />
          <YAxis type="category" dataKey="name" width={120} stroke="#93a4bf" fontSize={11} />
          <Tooltip
            contentStyle={{ background: '#121a2b', border: '1px solid #243149', borderRadius: 8 }}
          />
          <Bar dataKey="count" fill="#f0b429" radius={[0, 6, 6, 0]} />
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
          <Pie data={data} dataKey="count" nameKey="name" innerRadius={55} outerRadius={95}>
            {data.map((_, i) => (
              <Cell key={data[i]?.name ?? String(i)} fill={COLORS[i % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{ background: '#121a2b', border: '1px solid #243149', borderRadius: 8 }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
