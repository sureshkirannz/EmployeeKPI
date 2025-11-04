import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

interface ActivityData {
  name: string;
  events?: number;
  meetings?: number;
  videos?: number;
  thankyouCards?: number;
  hoursProspected?: number;
  leadsReceived?: number;
}

interface ActivityBreakdownChartProps {
  title: string;
  data: ActivityData[];
  type?: "stacked" | "grouped";
  height?: number;
}

export default function ActivityBreakdownChart({
  title,
  data,
  type = "stacked",
  height = 300,
}: ActivityBreakdownChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={height}>
          <BarChart
            data={data}
            margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
          >
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
            <Bar
              dataKey="events"
              stackId={type === "stacked" ? "a" : undefined}
              fill="hsl(var(--chart-1))"
              name="Events"
              data-testid="bar-events"
            />
            <Bar
              dataKey="meetings"
              stackId={type === "stacked" ? "a" : undefined}
              fill="hsl(var(--chart-2))"
              name="Meetings"
              data-testid="bar-meetings"
            />
            <Bar
              dataKey="videos"
              stackId={type === "stacked" ? "a" : undefined}
              fill="hsl(var(--chart-3))"
              name="Videos"
              data-testid="bar-videos"
            />
            <Bar
              dataKey="thankyouCards"
              stackId={type === "stacked" ? "a" : undefined}
              fill="hsl(var(--chart-4))"
              name="Thank You Cards"
              data-testid="bar-thankyou"
            />
            <Bar
              dataKey="hoursProspected"
              stackId={type === "stacked" ? "a" : undefined}
              fill="hsl(var(--chart-5))"
              name="Hours Prospected"
              data-testid="bar-hours"
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
