'use client';

import { useState } from 'react';
import { Driver, Vehicle } from '@/contexts/data-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Edit2, Trash2 } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface DriverTableProps {
  drivers: Driver[];
  vehicles: Vehicle[];
  onEdit: (driver: Driver) => void;
  onDelete: (id: string) => void;
  isLoading?: boolean;
}

export function DriverTable({
  drivers,
  vehicles,
  onEdit,
  onDelete,
  isLoading = false,
}: DriverTableProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const filteredDrivers = drivers.filter((driver) => {
    const matchesSearch =
      driver.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      driver.licenseNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      driver.contactNumber.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' || driver.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      active: 'bg-green-500/15 text-green-700 dark:text-green-400 border border-green-200/50 dark:border-green-500/30',
      inactive: 'bg-gray-500/15 text-gray-700 dark:text-gray-400 border border-gray-200/50 dark:border-gray-500/30',
      on_leave: 'bg-blue-500/15 text-blue-700 dark:text-blue-400 border border-blue-200/50 dark:border-blue-500/30',
    };
    return colors[status] || colors.active;
  };

  const getVehicleInfo = (vehicleId: string | null) => {
    if (!vehicleId) return 'Unassigned';
    const vehicle = vehicles.find(v => v.id === vehicleId);
    return vehicle ? `${vehicle.vehicleId} - ${vehicle.plateNumber}` : 'Unknown';
  };

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-3 items-start md:items-center">
        <div className="relative flex-1 min-w-0">
          <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, license, or contact..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            disabled={isLoading}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter} disabled={isLoading}>
          <SelectTrigger className="w-full md:w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
            <SelectItem value="on_leave">On Leave</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="border border-border/50 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50 border-b border-border/50">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Name</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">License Number</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Contact</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Assigned Vehicle</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Status</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredDrivers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-muted-foreground">
                    No drivers found
                  </td>
                </tr>
              ) : (
                filteredDrivers.map((driver) => (
                  <tr key={driver.id} className="hover:bg-muted/50 transition-colors">
                    <td className="px-6 py-4 text-sm font-medium text-foreground">{driver.name}</td>
                    <td className="px-6 py-4 text-sm text-foreground">{driver.licenseNumber}</td>
                    <td className="px-6 py-4 text-sm text-foreground">{driver.contactNumber}</td>
                    <td className="px-6 py-4 text-sm text-foreground">{getVehicleInfo(driver.assignedVehicleId)}</td>
                    <td className="px-6 py-4 text-sm">
                      <span className={`inline-block px-3 py-1.5 rounded-lg text-xs font-semibold ${getStatusBadge(driver.status)}`}>
                        {driver.status.replace('_', ' ').charAt(0).toUpperCase() + driver.status.replace('_', ' ').slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => onEdit(driver)}
                          disabled={isLoading}
                          className="gap-2"
                        >
                          <Edit2 className="w-4 h-4" />
                          <span className="sr-only">Edit</span>
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => onDelete(driver.id)}
                          disabled={isLoading}
                          className="gap-2 text-destructive hover:text-destructive"
                        >
                          <Trash2 className="w-4 h-4" />
                          <span className="sr-only">Delete</span>
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Results Count */}
      <p className="text-sm text-muted-foreground">
        Showing {filteredDrivers.length} of {drivers.length} drivers
      </p>
    </div>
  );
}
