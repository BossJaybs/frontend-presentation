import { Card } from '@/components/ui/card';
import { LucideIcon } from 'lucide-react';

interface StatsCardProps {
  label: string;
  value: number | string;
  icon: LucideIcon;
  description?: string;
  trend?: {
    value: number;
    direction: 'up' | 'down';
  };
}

export function StatsCard({
  label,
  value,
  icon: Icon,
  description,
  trend,
}: StatsCardProps) {
  return (
    <Card className="relative p-6 bg-card border border-border/50 overflow-hidden group hover:border-border/80 hover:shadow-md transition-all duration-300">
      {/* Subtle gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      
      <div className="relative flex items-start justify-between">
        <div className="flex-1 space-y-3">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{label}</p>
          <p className="text-4xl font-bold text-foreground">{value}</p>
          {description && (
            <p className="text-sm text-muted-foreground">{description}</p>
          )}
          {trend && (
            <div className="pt-2">
              <span
                className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-lg ${
                  trend.direction === 'up' 
                    ? 'bg-green-500/10 text-green-700 dark:text-green-400' 
                    : 'bg-red-500/10 text-red-700 dark:text-red-400'
                }`}
              >
                {trend.direction === 'up' ? '↑' : '↓'} {Math.abs(trend.value)}%
              </span>
            </div>
          )}
        </div>
        <div className="rounded-xl p-3 bg-gradient-to-br from-primary/20 to-accent/10 group-hover:from-primary/30 group-hover:to-accent/20 transition-colors">
          <Icon className="w-6 h-6 text-primary" strokeWidth={1.5} />
        </div>
      </div>
    </Card>
  );
}
