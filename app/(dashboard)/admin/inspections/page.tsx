'use client';

import { useMemo } from 'react';
import { useData } from '@/contexts/data-context';
import { Card } from '@/components/ui/card';
import { ClipboardCheck, AlertTriangle, CheckCircle2 } from 'lucide-react';

export default function AdminInspectionsPage() {
  const { inspectionReports, drivers, vehicles, trips } = useData();

  const counts = useMemo(() => {
    const total = inspectionReports.length;
    const good = inspectionReports.filter(report => report.status === 'good').length;
    const issues = inspectionReports.filter(report => report.status !== 'good').length;
    const major = inspectionReports.filter(report => report.status === 'major_issue').length;

    return { total, good, issues, major };
  }, [inspectionReports]);

  const recentReports = useMemo(
    () => [...inspectionReports].sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()).slice(0, 8),
    [inspectionReports]
  );

  const issueReports = useMemo(
    () => inspectionReports.filter(report => report.status !== 'good'),
    [inspectionReports]
  );

  const getDriverName = (id: string) => drivers.find(driver => driver.id === id)?.name || 'Unknown driver';
  const getVehiclePlate = (id: string) => vehicles.find(vehicle => vehicle.id === id)?.plateNumber || 'Unknown vehicle';

  const badgeStyles: Record<string, string> = {
    good: 'bg-green-500/20 text-green-700 dark:text-green-400',
    minor_issue: 'bg-yellow-500/20 text-yellow-700 dark:text-yellow-400',
    major_issue: 'bg-red-500/20 text-red-700 dark:text-red-400',
  };

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl md:text-3xl font-bold text-foreground">Inspections Review</h1>
        <p className="text-sm md:text-base text-muted-foreground">Monitor driver inspection submissions and follow-up items</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 space-y-2">
          <p className="text-xs font-semibold text-muted-foreground uppercase">Total Reports</p>
          <p className="text-3xl font-bold text-foreground">{counts.total}</p>
          <p className="text-xs text-muted-foreground">All inspection submissions</p>
        </Card>
        <Card className="p-4 space-y-2">
          <p className="text-xs font-semibold text-muted-foreground uppercase">Good</p>
          <p className="text-3xl font-bold text-green-600">{counts.good}</p>
          <p className="text-xs text-muted-foreground">No follow-up required</p>
        </Card>
        <Card className="p-4 space-y-2">
          <p className="text-xs font-semibold text-muted-foreground uppercase">Issues</p>
          <p className="text-3xl font-bold text-yellow-600">{counts.issues}</p>
          <p className="text-xs text-muted-foreground">Need admin attention</p>
        </Card>
        <Card className="p-4 space-y-2">
          <p className="text-xs font-semibold text-muted-foreground uppercase">Major Issues</p>
          <p className="text-3xl font-bold text-red-600">{counts.major}</p>
          <p className="text-xs text-muted-foreground">Critical inspection findings</p>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2 p-6 space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-foreground">Recent Inspection Reports</h2>
              <p className="text-sm text-muted-foreground">Latest submissions from drivers across the fleet</p>
            </div>
            <ClipboardCheck className="w-6 h-6 text-primary" />
          </div>

          {recentReports.length === 0 ? (
            <div className="rounded-lg border border-dashed border-border p-8 text-center">
              <p className="text-muted-foreground">No inspection reports yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentReports.map(report => {
                const trip = trips.find(item => item.id === report.tripId);

                return (
                  <div key={report.id} className="rounded-xl border border-border/50 bg-muted/30 p-4 space-y-2">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="font-medium text-foreground capitalize">{report.type.replace('_', ' ')} inspection</p>
                        <p className="text-sm text-muted-foreground">{getDriverName(report.driverId)} - {getVehiclePlate(report.vehicleId)}</p>
                        <p className="text-sm text-foreground mt-1">{report.notes}</p>
                      </div>
                      <span className={`inline-flex px-2 py-1 rounded text-xs font-medium ${badgeStyles[report.status]}`}>
                        {report.status.replace('_', ' ')}
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                      <span className="inline-flex items-center gap-1 rounded-full border border-border px-2 py-1">
                        <CheckCircle2 className="w-3 h-3" />
                        {trip ? `Trip ${trip.id.slice(-4)}` : 'No trip reference'}
                      </span>
                      <span>{new Date(report.submittedAt).toLocaleString()}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>

        <Card className="p-6 space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-foreground">Follow-up Queue</h2>
              <p className="text-sm text-muted-foreground">Reports that need a closer look</p>
            </div>
            <AlertTriangle className="w-6 h-6 text-yellow-600" />
          </div>

          {issueReports.length === 0 ? (
            <p className="text-sm text-muted-foreground">No follow-up items right now.</p>
          ) : (
            <div className="space-y-3">
              {issueReports.slice(0, 6).map(report => (
                <div key={report.id} className="rounded-lg border border-border/50 p-3">
                  <p className="text-sm font-medium text-foreground capitalize">{report.type.replace('_', ' ')} · {report.status.replace('_', ' ')}</p>
                  <p className="text-xs text-muted-foreground">{getDriverName(report.driverId)}</p>
                  <p className="text-xs text-muted-foreground">{getVehiclePlate(report.vehicleId)}</p>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
