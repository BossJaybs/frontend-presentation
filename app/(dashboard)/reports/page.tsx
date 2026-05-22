'use client';

import { useAuth } from '@/contexts/auth-context';
import { useRouter } from 'next/navigation';
import { useData } from '@/contexts/data-context';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  exportVehicles,
  exportDrivers,
  exportMaintenance,
  calculateMaintenanceSummary,
  getMaintenanceStats,
} from '@/lib/export';
import { Download, BarChart3, TrendingUp } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

export default function ReportsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const { vehicles, drivers, maintenance } = useData();

  // Role protection - only admin and fleet manager can access
  if (user && !['admin', 'fleet_manager'].includes(user.role)) {
    return (
      <div className="p-4 md:p-6 lg:p-8 flex flex-col items-center justify-center h-screen gap-4">
        <h1 className="text-2xl font-bold text-foreground">Access Denied</h1>
        <p className="text-muted-foreground">You do not have permission to access this page.</p>
        <Button onClick={() => router.push('/dashboard')}>Go to Dashboard</Button>
      </div>
    );
  }

  const maintenanceSummary = calculateMaintenanceSummary(maintenance, vehicles);
  const maintenanceStats = getMaintenanceStats(maintenance);

  // Data for maintenance type chart
  const maintenanceTypeData = Object.entries(maintenanceStats.byType).map(([type, count]) => ({
    name: type.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
    value: count,
  }));

  const COLORS = ['#4f46e5', '#f59e0b', '#10b981', '#ef4444', '#8b5cf6'];

  // Data for maintenance cost by vehicle
  const costByVehicle = maintenanceSummary.slice(0, 5).map(item => ({
    name: item['Vehicle ID'],
    cost: parseFloat(item['Total Cost'].replace('$', '')),
    records: item['Total Maintenance Records'],
  }));

  return (
    <div className="p-4 md:p-6 lg:p-8">
      {/* Header */}
      <div className="mb-6 md:mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-foreground">Reports</h1>
        <p className="text-sm md:text-base text-muted-foreground mt-1">Generate and export fleet data</p>
      </div>

      {/* Export Buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4 mb-6 md:mb-8">
        <Card className="p-6 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-foreground">Vehicles Export</h3>
            <Download className="w-5 h-5 text-primary" />
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            Export all vehicle records to CSV format
          </p>
          <Button
            onClick={() => exportVehicles(vehicles)}
            className="w-full gap-2"
            variant="outline"
          >
            <Download className="w-4 h-4" />
            Download CSV
          </Button>
        </Card>

        <Card className="p-6 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-foreground">Drivers Export</h3>
            <Download className="w-5 h-5 text-primary" />
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            Export all driver records to CSV format
          </p>
          <Button
            onClick={() => exportDrivers(drivers)}
            className="w-full gap-2"
            variant="outline"
          >
            <Download className="w-4 h-4" />
            Download CSV
          </Button>
        </Card>

        <Card className="p-6 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-foreground">Maintenance Export</h3>
            <Download className="w-5 h-5 text-primary" />
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            Export all maintenance records to CSV format
          </p>
          <Button
            onClick={() => exportMaintenance(maintenance)}
            className="w-full gap-2"
            variant="outline"
          >
            <Download className="w-4 h-4" />
            Download CSV
          </Button>
        </Card>
      </div>

      {/* Statistics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <Card className="p-6">
          <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-primary" />
            Fleet Summary
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center pb-2 border-b border-border">
              <span className="text-sm text-muted-foreground">Total Vehicles</span>
              <span className="font-semibold text-foreground">{vehicles.length}</span>
            </div>
            <div className="flex justify-between items-center pb-2 border-b border-border">
              <span className="text-sm text-muted-foreground">Total Drivers</span>
              <span className="font-semibold text-foreground">{drivers.length}</span>
            </div>
            <div className="flex justify-between items-center pb-2 border-b border-border">
              <span className="text-sm text-muted-foreground">Active Vehicles</span>
              <span className="font-semibold text-foreground">
                {vehicles.filter(v => v.status === 'active').length}
              </span>
            </div>
            <div className="flex justify-between items-center pb-2 border-b border-border">
              <span className="text-sm text-muted-foreground">Active Drivers</span>
              <span className="font-semibold text-foreground">
                {drivers.filter(d => d.status === 'active').length}
              </span>
            </div>
            <div className="flex justify-between items-center pt-2">
              <span className="text-sm text-muted-foreground">Maintenance Records</span>
              <span className="font-semibold text-foreground">{maintenance.length}</span>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            Maintenance Statistics
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center pb-2 border-b border-border">
              <span className="text-sm text-muted-foreground">Total Records</span>
              <span className="font-semibold text-foreground">{maintenanceStats.total}</span>
            </div>
            <div className="flex justify-between items-center pb-2 border-b border-border">
              <span className="text-sm text-muted-foreground">Total Cost</span>
              <span className="font-semibold text-primary">
                ${maintenanceStats.totalCost.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between items-center pb-2 border-b border-border">
              <span className="text-sm text-muted-foreground">Average Cost</span>
              <span className="font-semibold text-foreground">
                ${maintenanceStats.averageCost.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between items-center pb-2 border-b border-border">
              <span className="text-sm text-muted-foreground">Maintenance Types</span>
              <span className="font-semibold text-foreground">
                {Object.keys(maintenanceStats.byType).length}
              </span>
            </div>
          </div>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Maintenance by Type Chart */}
        {maintenanceTypeData.length > 0 && (
          <Card className="p-6">
            <h3 className="font-semibold text-foreground mb-4">Maintenance by Type</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={maintenanceTypeData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {maintenanceTypeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        )}

        {/* Maintenance Cost by Vehicle Chart */}
        {costByVehicle.length > 0 && (
          <Card className="p-6">
            <h3 className="font-semibold text-foreground mb-4">Top Maintenance Costs</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={costByVehicle}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip
                  formatter={(value) => `$${value.toFixed(2)}`}
                  contentStyle={{
                    backgroundColor: 'var(--color-card)',
                    border: '1px solid var(--color-border)',
                  }}
                />
                <Legend />
                <Bar dataKey="cost" fill="var(--color-primary)" name="Total Cost ($)" />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        )}
      </div>

      {/* Maintenance Summary Table */}
      <div className="mt-8">
        <Card className="p-6">
          <h3 className="font-semibold text-foreground mb-4">Maintenance Summary by Vehicle</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted border-b border-border">
                <tr>
                  <th className="px-4 py-2 text-left text-sm font-semibold text-foreground">Vehicle ID</th>
                  <th className="px-4 py-2 text-left text-sm font-semibold text-foreground">Plate</th>
                  <th className="px-4 py-2 text-left text-sm font-semibold text-foreground">Records</th>
                  <th className="px-4 py-2 text-left text-sm font-semibold text-foreground">Total Cost</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {maintenanceSummary.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-4 py-4 text-center text-muted-foreground">
                      No maintenance records
                    </td>
                  </tr>
                ) : (
                  maintenanceSummary.map((item, index) => (
                    <tr key={index} className="hover:bg-muted/50">
                      <td className="px-4 py-3 text-sm font-medium text-foreground">{item['Vehicle ID']}</td>
                      <td className="px-4 py-3 text-sm text-foreground">{item['Plate Number']}</td>
                      <td className="px-4 py-3 text-sm text-foreground">{item['Total Maintenance Records']}</td>
                      <td className="px-4 py-3 text-sm font-semibold text-primary">{item['Total Cost']}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
}
