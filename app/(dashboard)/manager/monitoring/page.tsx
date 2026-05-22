'use client';

import { useData } from '@/contexts/data-context';
import { Card } from '@/components/ui/card';
import { AlertTriangle, MapPin, Fuel, Clock } from 'lucide-react';

export default function ManagerMonitoringPage() {
  const { trips, incidents, drivers, vehicles, getActiveTrips } = useData();
  const activeTrips = getActiveTrips();
  const pendingIncidents = incidents.filter(i => i.status === 'reported');
  const reviewedIncidents = incidents.filter(i => i.status === 'reviewed');

  const getVehicleById = (id: string) => vehicles.find(v => v.id === id);
  const getDriverById = (id: string) => drivers.find(d => d.id === id);

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl md:text-3xl font-bold text-foreground">Fleet Monitoring</h1>
        <p className="text-sm md:text-base text-muted-foreground">Real-time fleet operations and incident tracking</p>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-4 space-y-2">
          <p className="text-xs font-semibold text-muted-foreground uppercase">Active Trips</p>
          <p className="text-3xl font-bold text-foreground">{activeTrips.length}</p>
          <p className="text-xs text-muted-foreground">Vehicles in transit</p>
        </Card>
        <Card className="p-4 space-y-2">
          <p className="text-xs font-semibold text-muted-foreground uppercase">Pending Incidents</p>
          <p className="text-3xl font-bold text-orange-600">{pendingIncidents.length}</p>
          <p className="text-xs text-muted-foreground">Awaiting review</p>
        </Card>
        <Card className="p-4 space-y-2">
          <p className="text-xs font-semibold text-muted-foreground uppercase">Reviewed</p>
          <p className="text-3xl font-bold text-blue-600">{reviewedIncidents.length}</p>
          <p className="text-xs text-muted-foreground">Processed incidents</p>
        </Card>
      </div>

      {/* Active Trips */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-foreground">Active Trips</h2>
        {activeTrips.length === 0 ? (
          <Card className="p-6 text-center">
            <p className="text-muted-foreground">No active trips</p>
          </Card>
        ) : (
          <div className="space-y-2">
            {activeTrips.map(trip => {
              const vehicle = getVehicleById(trip.vehicleId);
              const driver = getDriverById(trip.driverId);
              const elapsedTime = Math.round(
                (new Date().getTime() - new Date(trip.startTime).getTime()) / 1000 / 60
              );

              return (
                <Card key={trip.id} className="p-4 space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium text-foreground">{vehicle?.plateNumber}</p>
                      <p className="text-sm text-muted-foreground">{driver?.name}</p>
                    </div>
                    <span className="px-2 py-1 bg-green-500/20 text-green-700 dark:text-green-400 rounded text-xs font-medium">
                      Ongoing
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4 text-muted-foreground" />
                      <div>
                        <p className="text-xs text-muted-foreground">Duration</p>
                        <p className="text-sm font-medium">{elapsedTime}min</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <Fuel className="w-4 h-4 text-muted-foreground" />
                      <div>
                        <p className="text-xs text-muted-foreground">Fuel</p>
                        <p className="text-sm font-medium">{trip.fuelStart.toFixed(1)}L</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <MapPin className="w-4 h-4 text-muted-foreground" />
                      <div>
                        <p className="text-xs text-muted-foreground">Started</p>
                        <p className="text-sm font-medium">{new Date(trip.startTime).toLocaleTimeString()}</p>
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Pending Incidents */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-foreground">Pending Incidents</h2>
        {pendingIncidents.length === 0 ? (
          <Card className="p-6 text-center">
            <p className="text-muted-foreground">No pending incidents</p>
          </Card>
        ) : (
          <div className="space-y-2">
            {pendingIncidents.map(incident => {
              const vehicle = getVehicleById(incident.vehicleId);
              const driver = getDriverById(incident.driverId);

              return (
                <Card key={incident.id} className={`p-4 space-y-2 border-l-4 ${
                  incident.severity === 'high' ? 'border-red-500' :
                  incident.severity === 'medium' ? 'border-yellow-500' :
                  'border-blue-500'
                }`}>
                  <div className="flex justify-between items-start">
                    <div className="flex items-start gap-2">
                      <AlertTriangle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium text-foreground capitalize">{incident.type.replace('_', ' ')}</p>
                        <p className="text-sm text-muted-foreground">{vehicle?.plateNumber} - {driver?.name}</p>
                        <p className="text-sm mt-1">{incident.description}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                        incident.severity === 'high' ? 'bg-red-500/20 text-red-700 dark:text-red-400' :
                        incident.severity === 'medium' ? 'bg-yellow-500/20 text-yellow-700 dark:text-yellow-400' :
                        'bg-blue-500/20 text-blue-700 dark:text-blue-400'
                      }`}>
                        {incident.severity}
                      </span>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">{new Date(incident.submittedAt).toLocaleString()}</p>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Reviewed Incidents */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-foreground">Reviewed Incidents</h2>
        {reviewedIncidents.length === 0 ? (
          <Card className="p-6 text-center">
            <p className="text-muted-foreground">No reviewed incidents</p>
          </Card>
        ) : (
          <div className="space-y-2">
            {reviewedIncidents.slice(0, 5).map(incident => {
              const vehicle = getVehicleById(incident.vehicleId);
              return (
                <Card key={incident.id} className="p-3">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium text-sm text-foreground capitalize">{incident.type.replace('_', ' ')}</p>
                      <p className="text-xs text-muted-foreground">{vehicle?.plateNumber}</p>
                    </div>
                    <span className="px-2 py-1 bg-green-500/20 text-green-700 dark:text-green-400 rounded text-xs font-medium">
                      Reviewed
                    </span>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
