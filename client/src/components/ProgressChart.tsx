import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AreaChart, Area, BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

interface ChartData {
  name: string;
  value: number;
  target?: number;
}

interface ProgressChartProps {
  title: string;
  data: ChartData[];
  type?: "area" | "bar" | "line";
  dataKey?: string;
  targetKey?: string;
  height?: number;
}

export default function ProgressChart({
  title,
  data,
  type = "area",
  dataKey = "value",
  targetKey = "target",
  height = 300,
}: ProgressChartProps) {
  const renderChart = () => {
    const commonProps = {
      data,
      margin: { top: 10, right: 10, left: 0, bottom: 0 },
    };

    switch (type) {
      case "bar":
        return (
          <BarChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis dataKey="name" className="text-xs" />
            <YAxis className="text-xs" />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--popover))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "6px",
              }}
            />
            <Legend />
            <Bar dataKey={dataKey} fill="hsl(var(--chart-1))" name="Actual" />
            {data[0]?.[targetKey as keyof ChartData] !== undefined && (
              <Bar dataKey={targetKey} fill="hsl(var(--chart-2))" name="Target" />
            )}
          </BarChart>
        );
      case "line":
        return (
          <LineChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis dataKey="name" className="text-xs" />
            <YAxis className="text-xs" />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--popover))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "6px",
              }}
            />
            <Legend />
            <Line type="monotone" dataKey={dataKey} stroke="hsl(var(--chart-1))" strokeWidth={2} name="Actual" />
            {data[0]?.[targetKey as keyof ChartData] !== undefined && (
              <Line type="monotone" dataKey={targetKey} stroke="hsl(var(--chart-2))" strokeWidth={2} strokeDasharray="5 5" name="Target" />
            )}
          </LineChart>
        );
      default:
        return (
          <AreaChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis dataKey="name" className="text-xs" />
            <YAxis className="text-xs" />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--popover))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "6px",
              }}
            />
            <Legend />
            <Area type="monotone" dataKey={dataKey} stroke="hsl(var(--chart-1))" fill="hsl(var(--chart-1))" fillOpacity={0.3} name="Actual" />
            {data[0]?.[targetKey as keyof ChartData] !== undefined && (
              <Area type="monotone" dataKey={targetKey} stroke="hsl(var(--chart-2))" fill="hsl(var(--chart-2))" fillOpacity={0.1} strokeDasharray="5 5" name="Target" />
            )}
          </AreaChart>
        );
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={height}>
          {renderChart()}
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
