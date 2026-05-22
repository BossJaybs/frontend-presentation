'use client';

import { useState } from 'react';
import { Vehicle } from '@/contexts/data-context';
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

interface VehicleTableProps {
  vehicles: Vehicle[];
  onEdit: (vehicle: Vehicle) => void;
  onDelete: (id: string) => void;
  isLoading?: boolean;
}

export function VehicleTable({ vehicles, onEdit, onDelete, isLoading = false }: VehicleTableProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const filteredVehicles = vehicles.filter((vehicle) => {
    const matchesSearch =
      vehicle.vehicleId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vehicle.plateNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vehicle.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vehicle.model.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' || vehicle.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      active: 'bg-green-500/15 text-green-700 dark:text-green-400 border border-green-200/50 dark:border-green-500/30',
      maintenance: 'bg-yellow-500/15 text-yellow-700 dark:text-yellow-400 border border-yellow-200/50 dark:border-yellow-500/30',
      inactive: 'bg-gray-500/15 text-gray-700 dark:text-gray-400 border border-gray-200/50 dark:border-gray-500/30',
    };
    return colors[status] || colors.active;
  };

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-3 items-start md:items-center">
        <div className="relative flex-1 min-w-0">
          <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by vehicle ID, plate, brand, or model..."
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
            <SelectItem value="maintenance">Maintenance</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="border border-border/50 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50 border-b border-border/50">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Vehicle ID</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Plate Number</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Brand</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Model</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Year</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Status</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredVehicles.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-muted-foreground">
                    No vehicles found
                  </td>
                </tr>
              ) : (
                filteredVehicles.map((vehicle) => (
                  <tr key={vehicle.id} className="hover:bg-muted/50 transition-colors">
                    <td className="px-6 py-4 text-sm font-medium text-foreground">{vehicle.vehicleId}</td>
                    <td className="px-6 py-4 text-sm text-foreground">{vehicle.plateNumber}</td>
                    <td className="px-6 py-4 text-sm text-foreground">{vehicle.brand}</td>
                    <td className="px-6 py-4 text-sm text-foreground">{vehicle.model}</td>
                    <td className="px-6 py-4 text-sm text-foreground">{vehicle.year}</td>
                    <td className="px-6 py-4 text-sm">
                      <span className={`inline-block px-3 py-1.5 rounded-lg text-xs font-semibold ${getStatusBadge(vehicle.status)}`}>
                        {vehicle.status.charAt(0).toUpperCase() + vehicle.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => onEdit(vehicle)}
                          disabled={isLoading}
                          className="gap-2"
                        >
                          <Edit2 className="w-4 h-4" />
                          <span className="sr-only">Edit</span>
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => onDelete(vehicle.id)}
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
        Showing {filteredVehicles.length} of {vehicles.length} vehicles
      </p>
    </div>
  );
}
