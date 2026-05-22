'use client';

import { useData } from '@/contexts/data-context';
import { useAuth } from '@/contexts/auth-context';
import { StatsCard } from '@/components/dashboard/stats-card';
import { ActivityLog } from '@/components/dashboard/activity-log';
import { VehicleStatusChart } from '@/components/dashboard/vehicle-status-chart';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableHeader, TableBody, TableRow, TableCell, TableHead } from '@/components/ui/table';
import { Truck, Users, Wrench, BarChart3, ClipboardCheck, ArrowRight, AlertTriangle, Clock, Fuel, FileText, Search, Plane, Activity } from 'lucide-react';
import Link from 'next/link';

export default function DashboardPage() {
  const { vehicles, drivers, maintenance, trips, inspectionReports, incidents } = useData();
  const { user } = useAuth();

  const activeVehicles = vehicles.filter(v => v.status === 'active').length;
  const maintenanceVehicles = vehicles.filter(v => v.status === 'maintenance').length;
  const inactiveVehicles = vehicles.filter(v => v.status === 'inactive').length;
  const totalCost = maintenance.reduce((sum, m) => sum + m.cost, 0);
  const utilizationRate = drivers.length > 0
    ? Math.round((drivers.filter(d => d.status === 'active').length / drivers.length) * 100)
    : 0;

  const ongoingTrips = trips.filter(t => t.status === 'ongoing').length;
  const unresolvedIncidents = incidents.filter(i => i.status !== 'resolved').length;
  const pendingInspections = inspectionReports.filter(i => i.status !== 'good').length;
  const onLeaveDrivers = drivers.filter(d => d.status === 'on_leave').length;
  const unassignedDrivers = drivers.filter(d => d.assignedVehicleId === null && d.status === 'active').length;

  const latestInspectionStatus = inspectionReports.length > 0
    ? inspectionReports.sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt))[0].status.replace('_', ' ')
    : 'No inspection yet';

  const latestIncidentStatus = incidents.length > 0
    ? incidents.sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt))[0].status.replace('_', ' ')
    : 'No incidents yet';

  const avgFuelEfficiency = vehicles.length > 0
    ? (vehicles.reduce((sum, v) => sum + v.fuelConsumption, 0) / vehicles.length).toFixed(1)
    : '0';

  // Sort maintenance by most recent first
  const recentMaintenance = [...maintenance].sort((a, b) =>
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  ).slice(0, 5);

  // Sort unresolved incidents by severity
  const unresolvedIncidentsList = incidents
    .filter(i => i.status !== 'resolved')
    .sort((a, b) => {
      const order = { high: 0, medium: 1, low: 2 };
      return (order[a.severity as keyof typeof order] ?? 3) - (order[b.severity as keyof typeof order] ?? 3);
    })
    .slice(0, 5);

  // Driver view - simplified dashboard
  if (user?.role === 'driver') {
    return (
      <div className="p-4 md:p-6 lg:p-8 space-y-6 md:space-y-8">
        <div className="space-y-1 md:space-y-2">
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-foreground">My Dashboard</h1>
          <p className="text-sm md:text-base text-muted-foreground">Your vehicle and maintenance information</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
          <div className="bg-card rounded-xl p-6 border border-border/50 shadow-sm">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-4">Quick Stats</p>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Active Vehicles</p>
                <p className="text-3xl font-bold text-foreground">{activeVehicles}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Scheduled Maintenance</p>
                <p className="text-3xl font-bold text-primary">{maintenance.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-card rounded-xl p-6 border border-border/50 shadow-sm">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-4">My Information</p>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-muted-foreground">Email</p>
                <p className="font-medium text-foreground truncate">{user?.email}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Role</p>
                <span className="inline-block px-3 py-1 bg-primary/20 text-primary rounded-lg text-xs font-medium">Driver</span>
              </div>
            </div>
          </div>
        </div>

        <ActivityLog />
      </div>
    );
  }

  // Admin and Fleet Manager view - full dashboard
  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6 md:space-y-8">
      {/* Header Section */}
      <div className="space-y-1 md:space-y-2 flex items-start justify-between">
        <div className="space-y-1 md:space-y-2">
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-foreground">Fleet Overview</h1>
          <p className="text-sm md:text-base text-muted-foreground">Real-time metrics and operational insights</p>
        </div>
        <Link href="/vehicles">
          <Button className="hidden sm:inline-flex" variant="outline" size="sm">
            Quick Actions
            <ArrowRight className="ml-1.5 h-4 w-4" />
          </Button>
        </Link>
      </div>

      {/* ── Primary Stats ────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 md:gap-4">
        <StatsCard label="Total Vehicles" value={vehicles.length} icon={Truck} description="All registered vehicles" />
        <StatsCard label="Active Vehicles" value={activeVehicles} icon={BarChart3} description={`${((activeVehicles / vehicles.length) * 100 || 0).toFixed(0)}% operational`} />
        <StatsCard label="In Maintenance" value={maintenanceVehicles} icon={Wrench} description="Currently being serviced" />
        <StatsCard label="Active Drivers" value={drivers.filter(d => d.status === 'active').length} icon={Users} description={`${utilizationRate}% utilization`} />
        <StatsCard label="Ongoing Trips" value={ongoingTrips} icon={Plane} description="Trips in progress" />
      </div>

      {/* ── Secondary Stats ─────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
        <StatsCard
          label="Unresolved Incidents"
          value={unresolvedIncidents}
          icon={AlertTriangle}
          description="Requires attention"
        />
        <StatsCard
          label="Pending Inspections"
          value={pendingInspections}
          icon={FileText}
          description="Reports flagged"
        />
        <StatsCard
          label="Drivers on Leave"
          value={onLeaveDrivers}
          icon={Clock}
          description={`${unassignedDrivers} driver${unassignedDrivers !== 1 ? 's' : ''} unassigned`}
        />
      </div>

      {/* ── Proactive Alerts ─────────────────────────── */}
      {unresolvedIncidents > 0 && (
        <Alert variant="destructive" className="border-destructive/50">
          <AlertTriangle className="h-4 w-4 text-destructive" />
          <AlertTitle>Unresolved Incidents</AlertTitle>
          <AlertDescription>
            {unresolvedIncidents} incident{unresolvedIncidents !== 1 ? 's' : ''} still requiring review.
            <Button variant="link" size="sm" className="h-auto p-0 ml-1 text-destructive underline">
              Go to Incidents &rarr;
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {maintenanceVehicles > 0 && (
        <Alert>
          <Wrench className="h-4 w-4 text-accent" />
          <AlertTitle>Vehicles in Maintenance</AlertTitle>
          <AlertDescription>
            {maintenanceVehicles} vehicle{maintenanceVehicles !== 1 ? 's are' : ' is'} out of service.
            <Button variant="link" size="sm" className="h-auto p-0 ml-1">
              View details &rarr;
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {onLeaveDrivers > 0 && (
        <Alert>
          <Clock className="h-4 w-4 text-accent" />
          <AlertTitle>Drivers Currently on Leave</AlertTitle>
          <AlertDescription>
            {onLeaveDrivers} driver{onLeaveDrivers !== 1 ? 's' : ''} is on leave — consider reallocating coverage.
          </AlertDescription>
        </Alert>
      )}

      {/* ── Charts + Quick Actions ───────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 md:gap-6">
        <div className="lg:col-span-3">
          <VehicleStatusChart />
        </div>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg">Quick Actions</CardTitle>
            <CardDescription>Common admin tasks — tap to navigate</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {[
              { label: 'Add New Vehicle', href: '/vehicles', icon: Truck, color: 'text-primary' },
              { label: 'Register Driver', href: '/drivers', icon: Users, color: 'text-primary' },
              { label: 'Log Maintenance', href: '/maintenance', icon: Wrench, color: 'text-accent' },
              { label: 'View Reports', href: '/reports', icon: BarChart3, color: 'text-green-600 dark:text-green-400' },
              { label: 'Review Incidents', href: '/manager/incidents-review', icon: AlertTriangle, color: 'text-red-600 dark:text-red-400' },
            ].map((action) => {
              const Icon = action.icon;
              return (
                <Link key={action.label} href={action.href}>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full justify-between group"
                  >
                    <span className="flex items-center gap-3">
                      <Icon className={`h-4 w-4 ${action.color}`} />
                      {action.label}
                    </span>
                    <ArrowRight className="h-3.5 w-3.5 text-muted-foreground group-hover:text-foreground transition-colors" />
                  </Button>
                </Link>
              );
            })}
          </CardContent>
        </Card>
      </div>

      {/* ── Key Metrics ──────────────────────────────── */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Key Metrics</CardTitle>
          <CardDescription>Financial and operational at a glance</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Total Maintenance Cost */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-baseline">
              <span className="text-sm text-muted-foreground">Total Maintenance Cost</span>
              <span className="text-xs text-accent font-medium">All time</span>
            </div>
            <p className="text-3xl font-bold text-primary">${totalCost.toFixed(2)}</p>
            <p className="text-xs text-muted-foreground">Across {maintenance.length} records</p>
          </div>

          {/* Latest Inspection */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-baseline">
              <span className="text-sm text-muted-foreground">Latest Inspection</span>
              <span className="text-xs text-accent font-medium">Status</span>
            </div>
            <p className="text-2xl font-bold text-foreground capitalize">{latestInspectionStatus}</p>
            <p className="text-xs text-muted-foreground">{inspectionReports.length} report{inspectionReports.length !== 1 ? 's' : ''} on file</p>
          </div>

          {/* Latest Incident Status */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-baseline">
              <span className="text-sm text-muted-foreground">Latest Incident</span>
              <span className="text-xs text-accent font-medium">Status</span>
            </div>
            <p className="text-2xl font-bold text-foreground capitalize">{latestIncidentStatus}</p>
            <p className="text-xs text-muted-foreground">{incidents.length} total incident{incidents.length !== 1 ? 's' : ''} recorded</p>
          </div>

          {/* Avg Cost per Record */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-baseline">
              <span className="text-sm text-muted-foreground">Avg Cost per Record</span>
              <span className="text-xs text-accent font-medium">Efficiency</span>
            </div>
            <p className="text-3xl font-bold text-foreground">
              ${(maintenance.length > 0 ? totalCost / maintenance.length : 0).toFixed(2)}
            </p>
          </div>

          <div className="sm:col-span-2 lg:col-span-4">
            <div className="h-px bg-border/40" />
          </div>

          {/* Fleet Status */}
          <div className="space-y-1.5 sm:col-span-2 lg:col-span-4">
            <div className="flex justify-between items-baseline">
              <span className="text-sm font-medium text-foreground">Fleet Status Distribution</span>
              <span className="text-xs text-accent font-medium">Overview</span>
            </div>
            <div className="flex gap-3 mt-2">
              <div className="flex-1 space-y-1">
                <p className="text-xs text-muted-foreground">Active — {activeVehicles}</p>
                <div className="h-2.5 bg-border rounded-full overflow-hidden">
                  <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${(activeVehicles / vehicles.length) * 100 || 0}%` }} />
                </div>
              </div>
              <div className="flex-1 space-y-1">
                <p className="text-xs text-muted-foreground">Service — {maintenanceVehicles}</p>
                <div className="h-2.5 bg-border rounded-full overflow-hidden">
                  <div className="h-full bg-accent rounded-full transition-all" style={{ width: `${(maintenanceVehicles / vehicles.length) * 100 || 0}%` }} />
                </div>
              </div>
              <div className="flex-1 space-y-1">
                <p className="text-xs text-muted-foreground">Inactive — {inactiveVehicles}</p>
                <div className="h-2.5 bg-border rounded-full overflow-hidden">
                  <div className="h-full bg-muted rounded-full transition-all" style={{ width: `${(inactiveVehicles / vehicles.length) * 100 || 0}%` }} />
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ── Incidents (if any) ───────────────────────── */}
      {unresolvedIncidentsList.length > 0 && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-lg flex items-center gap-2">
                <AlertTriangle className="h-4.5 w-4.5 text-destructive" />
                Unresolved Incidents
              </CardTitle>
              <CardDescription>{unresolvedIncidents} incident{unresolvedIncidents !== 1 ? 's' : ''} pending review</CardDescription>
            </div>
            <Link href="/manager/incidents-review">
              <Button variant="outline" size="sm">
                Review All
                <ArrowRight className="ml-1.5 h-4 w-4" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Vehicle</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Severity</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Reported</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {unresolvedIncidentsList.map((incident) => {
                  const vehicle = vehicles.find(v => v.id === incident.vehicleId);
                  const severityColors: Record<string, string> = {
                    high: 'bg-red-100 text-red-700 dark:bg-red-400/10 dark:text-red-400',
                    medium: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-400/10 dark:text-yellow-400',
                    low: 'bg-blue-100 text-blue-700 dark:bg-blue-400/10 dark:text-blue-400',
                  };
                  const statusColors: Record<string, string> = {
                    reported: 'bg-orange-100 text-orange-700 dark:bg-orange-400/10 dark:text-orange-400',
                    reviewed: 'bg-purple-100 text-purple-700 dark:bg-purple-400/10 dark:text-purple-400',
                    resolved: 'bg-green-100 text-green-700 dark:bg-green-400/10 dark:text-green-400',
                  };
                  return (
                    <TableRow key={incident.id}>
                      <TableCell className="font-medium">{vehicle?.vehicleId ?? vehicle?.plateNumber ?? incident.vehicleId}</TableCell>
                      <TableCell className="capitalize">{incident.type.replace('_', ' ')}</TableCell>
                      <TableCell>
                        <span className={`inline-block px-2 py-0.5 rounded-md text-xs font-medium capitalize ${severityColors[incident.severity] ?? 'bg-muted text-muted-foreground'}`}>
                          {incident.severity}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className={`inline-block px-2 py-0.5 rounded-md text-xs font-medium capitalize ${statusColors[incident.status] ?? 'bg-muted text-muted-foreground'}`}>
                          {incident.status}
                        </span>
                      </TableCell>
                      <TableCell className="text-right text-muted-foreground text-xs">
                        {new Date(incident.submittedAt).toLocaleDateString()}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* ── Recent Maintenance ───────────────────────── */}
      {recentMaintenance.length > 0 && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-lg flex items-center gap-2">
                <Wrench className="h-4.5 w-4.5 text-accent" />
                Recent Maintenance Records
              </CardTitle>
              <CardDescription>Latest service entries across the fleet</CardDescription>
            </div>
            <Link href="/maintenance">
              <Button variant="outline" size="sm">
                View All
                <ArrowRight className="ml-1.5 h-4 w-4" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Vehicle</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Cost</TableHead>
                  <TableHead>Notes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentMaintenance.map((record) => {
                  const vehicle = vehicles.find(v => v.id === record.vehicleId);
                  return (
                    <TableRow key={record.id}>
                      <TableCell className="font-medium">{vehicle?.vehicleId ?? vehicle?.plateNumber ?? record.vehicleId}</TableCell>
                      <TableCell className="capitalize">{record.type.replace('_', ' ')}</TableCell>
                      <TableCell className="text-muted-foreground">{record.date}</TableCell>
                      <TableCell className="font-medium text-primary">${record.cost.toFixed(2)}</TableCell>
                      <TableCell className="text-muted-foreground text-xs max-w-[200px] truncate">{record.notes}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* ── Activity Feed ────────────────────────────── */}
      <ActivityLog />
    </div>
  );
}
