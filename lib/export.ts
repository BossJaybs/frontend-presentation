import { Vehicle, Driver, MaintenanceRecord } from '@/contexts/data-context';

function arrayToCSV(data: any[]): string {
  if (data.length === 0) return '';

  const headers = Object.keys(data[0]);
  const csv = [
    headers.join(','),
    ...data.map(row =>
      headers
        .map(header => {
          const value = row[header];
          if (value === null || value === undefined) return '';
          if (typeof value === 'string' && value.includes(',')) {
            return `"${value}"`;
          }
          return value;
        })
        .join(',')
    ),
  ];

  return csv.join('\n');
}

function downloadCSV(content: string, filename: string) {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function exportVehicles(vehicles: Vehicle[]) {
  const data = vehicles.map(v => ({
    'Vehicle ID': v.vehicleId,
    'Plate Number': v.plateNumber,
    Brand: v.brand,
    Model: v.model,
    Year: v.year,
    Status: v.status,
    'Created At': new Date(v.createdAt).toLocaleDateString(),
  }));

  const csv = arrayToCSV(data);
  downloadCSV(csv, `vehicles_${new Date().toISOString().split('T')[0]}.csv`);
}

export function exportDrivers(drivers: Driver[]) {
  const data = drivers.map(d => ({
    Name: d.name,
    'License Number': d.licenseNumber,
    'Contact Number': d.contactNumber,
    'Assigned Vehicle': d.assignedVehicleId || 'None',
    Status: d.status,
    'Created At': new Date(d.createdAt).toLocaleDateString(),
  }));

  const csv = arrayToCSV(data);
  downloadCSV(csv, `drivers_${new Date().toISOString().split('T')[0]}.csv`);
}

export function exportMaintenance(maintenance: MaintenanceRecord[]) {
  const data = maintenance.map(m => ({
    'Vehicle ID': m.vehicleId,
    Type: m.type,
    Date: m.date,
    Cost: `$${m.cost.toFixed(2)}`,
    Notes: m.notes,
    'Created At': new Date(m.createdAt).toLocaleDateString(),
  }));

  const csv = arrayToCSV(data);
  downloadCSV(csv, `maintenance_${new Date().toISOString().split('T')[0]}.csv`);
}

export function calculateMaintenanceSummary(maintenance: MaintenanceRecord[], vehicles: Vehicle[]) {
  const summary: Record<string, { count: number; totalCost: number }> = {};

  maintenance.forEach(m => {
    if (!summary[m.vehicleId]) {
      summary[m.vehicleId] = { count: 0, totalCost: 0 };
    }
    summary[m.vehicleId].count += 1;
    summary[m.vehicleId].totalCost += m.cost;
  });

  const result = Object.entries(summary).map(([vehicleId, data]) => {
    const vehicle = vehicles.find(v => v.id === vehicleId);
    return {
      'Vehicle ID': vehicle?.vehicleId || vehicleId,
      'Plate Number': vehicle?.plateNumber || 'Unknown',
      'Total Maintenance Records': data.count,
      'Total Cost': `$${data.totalCost.toFixed(2)}`,
    };
  });

  return result;
}

export function getMaintenanceStats(maintenance: MaintenanceRecord[]) {
  const stats = {
    total: maintenance.length,
    byType: {} as Record<string, number>,
    totalCost: 0,
    averageCost: 0,
  };

  maintenance.forEach(m => {
    if (!stats.byType[m.type]) {
      stats.byType[m.type] = 0;
    }
    stats.byType[m.type] += 1;
    stats.totalCost += m.cost;
  });

  stats.averageCost = stats.total > 0 ? stats.totalCost / stats.total : 0;

  return stats;
}
