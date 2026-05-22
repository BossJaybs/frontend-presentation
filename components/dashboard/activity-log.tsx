'use client';

import { Card } from '@/components/ui/card';
import { getActivityLog } from '@/lib/auth';
import { useEffect, useState } from 'react';

interface Activity {
  id: string;
  userId: string;
  action: string;
  description: string;
  timestamp: string;
}

export function ActivityLog() {
  const [activities, setActivities] = useState<Activity[]>([]);

  useEffect(() => {
    const loadActivities = () => {
      const log = getActivityLog(10);
      setActivities(log);
    };

    loadActivities();

    // Refresh every 5 seconds
    const interval = setInterval(loadActivities, 5000);
    return () => clearInterval(interval);
  }, []);

  const getActionColor = (action: string) => {
    if (action.includes('CREATE')) return 'bg-green-500/15 text-green-700 dark:text-green-400 border border-green-200/50 dark:border-green-500/30';
    if (action.includes('DELETE')) return 'bg-red-500/15 text-red-700 dark:text-red-400 border border-red-200/50 dark:border-red-500/30';
    if (action.includes('UPDATE')) return 'bg-blue-500/15 text-blue-700 dark:text-blue-400 border border-blue-200/50 dark:border-blue-500/30';
    return 'bg-gray-500/15 text-gray-700 dark:text-gray-400 border border-gray-200/50 dark:border-gray-500/30';
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <Card className="p-6 bg-card border border-border/50 shadow-sm">
      <div className="space-y-1 mb-6">
        <h2 className="text-xl font-bold text-foreground">Recent Activity</h2>
        <p className="text-sm text-muted-foreground">Latest system operations and updates</p>
      </div>
      <div className="space-y-3">
        {activities.length === 0 ? (
          <div className="py-8 text-center">
            <p className="text-sm text-muted-foreground">No activities yet</p>
          </div>
        ) : (
          activities.map((activity) => (
            <div
              key={activity.id}
              className="flex items-start gap-4 p-3 rounded-lg bg-card hover:bg-muted/40 transition-colors border border-transparent hover:border-border/40"
            >
              <div
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap ${getActionColor(
                  activity.action
                )}`}
              >
                {activity.action}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground">{activity.description}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {formatTime(activity.timestamp)}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </Card>
  );
}
