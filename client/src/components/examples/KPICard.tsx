import KPICard from '../KPICard';
import { DollarSign, TrendingUp, Users, Target } from 'lucide-react';

export default function KPICardExample() {
  return (
    <div className="p-8 bg-background">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 max-w-7xl">
        <KPICard
          title="Annual Volume"
          value="$45M"
          target="$100M"
          progress={45}
          icon={DollarSign}
          status="at-risk"
        />
        <KPICard
          title="Monthly Units Closed"
          value="18"
          target="24"
          progress={75}
          icon={Target}
          status="on-track"
        />
        <KPICard
          title="Locked Loans"
          value="22"
          target="26"
          progress={85}
          icon={TrendingUp}
          status="on-track"
        />
        <KPICard
          title="New Files Created"
          value="52"
          target="48"
          progress={108}
          icon={Users}
          status="exceeded"
        />
      </div>
    </div>
  );
}
