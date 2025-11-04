import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { LucideIcon } from "lucide-react";

interface KPICardProps {
  title: string;
  value: string | number;
  target?: string | number;
  progress?: number;
  trend?: "up" | "down" | "neutral";
  icon?: LucideIcon;
  status?: "behind" | "at-risk" | "on-track" | "exceeded";
  subtitle?: string;
}

export default function KPICard({
  title,
  value,
  target,
  progress,
  trend,
  icon: Icon,
  status,
  subtitle,
}: KPICardProps) {
  const getStatusColor = () => {
    switch (status) {
      case "behind":
        return "bg-destructive text-destructive-foreground";
      case "at-risk":
        return "bg-yellow-500 text-white";
      case "on-track":
        return "bg-green-600 text-white";
      case "exceeded":
        return "bg-blue-600 text-white";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const getStatusLabel = () => {
    switch (status) {
      case "behind":
        return "Behind";
      case "at-risk":
        return "At Risk";
      case "on-track":
        return "On Track";
      case "exceeded":
        return "Exceeded";
      default:
        return "";
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        {Icon && <Icon className="w-4 h-4 text-muted-foreground" />}
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-baseline gap-2">
          <div className="text-3xl font-bold font-mono">{value}</div>
          {target && (
            <div className="text-sm text-muted-foreground">/ {target}</div>
          )}
        </div>
        {subtitle && (
          <p className="text-xs text-muted-foreground">{subtitle}</p>
        )}
        {progress !== undefined && (
          <div className="space-y-1">
            <Progress value={progress} className="h-2" />
            <p className="text-xs text-muted-foreground">{progress}% complete</p>
          </div>
        )}
        {status && (
          <Badge className={getStatusColor()} data-testid={`badge-status-${status}`}>
            {getStatusLabel()}
          </Badge>
        )}
      </CardContent>
    </Card>
  );
}
