'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { useData } from '@/contexts/data-context';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { PlayCircle, StopCircle, MapPin, Fuel } from 'lucide-react';

const FUEL_PRICE_PER_LITER = 1.85;
const STANDARD_TRIP_DISTANCE_KM = 100;

export default function DriverTripsPage() {
  const { user } = useAuth();
  const { trips, vehicles, drivers, startTrip, endTrip, getActiveTrips, isLoading } = useData();
  const [showStartTrip, setShowStartTrip] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState('');
  const [fuelStart, setFuelStart] = useState('');
  const [actionError, setActionError] = useState<string | null>(null);

  // Get current driver info
  const currentDriver = drivers.find(d => d.userId === user?.id);
  const activeTrips = getActiveTrips().filter(t => t.driverId === currentDriver?.id);
  const selectedVehicleRecord = vehicles.find(v => v.id === selectedVehicle);
  const estimatedFuelNeeded = selectedVehicleRecord
    ? (selectedVehicleRecord.fuelConsumption * STANDARD_TRIP_DISTANCE_KM) / 100
    : 0;
  const estimatedTripCost = estimatedFuelNeeded * FUEL_PRICE_PER_LITER;

  const handleStartTrip = () => {
    if (!currentDriver) {
      setActionError('Hindi mahanap ang driver profile mo. Pakisign out at sign in ulit.');
      return;
    }

    if (!selectedVehicle || !fuelStart) {
      setActionError('Piliin ang vehicle at ilagay ang starting fuel bago mag-start.');
      return;
    }

    startTrip({
      driverId: currentDriver.id,
      vehicleId: selectedVehicle,
      startTime: new Date().toISOString(),
      endTime: null,
      fuelEnd: null,
      distanceTraveled: null,
      fuelStart: parseFloat(fuelStart),
    });
    setActionError(null);
    setShowStartTrip(false);
    setSelectedVehicle('');
    setFuelStart('');
  };

  const handleEndTrip = (tripId: string, fuelEnd: number, distance: number) => {
    endTrip(tripId, fuelEnd, distance);
  };

  const userVehicles = currentDriver?.assignedVehicleId
    ? vehicles.filter(v => v.id === currentDriver.assignedVehicleId)
    : vehicles;

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl md:text-3xl font-bold text-foreground">My Trips</h1>
        <p className="text-sm md:text-base text-muted-foreground">Manage your daily trips and fuel tracking</p>
      </div>

      {actionError && (
        <Card className="p-4 border-red-500/30 bg-red-500/10 text-red-700 dark:text-red-300">
          <p className="text-sm font-medium">{actionError}</p>
        </Card>
      )}

      {isLoading && (
        <Card className="p-6 text-center">
          <p className="text-muted-foreground">Loading your trip data...</p>
        </Card>
      )}

      {/* Active Trips */}
      <div className="grid grid-cols-1 gap-4">
        <h2 className="text-lg font-semibold text-foreground">Active Trips</h2>
        {activeTrips.length === 0 ? (
          <Card className="p-6 text-center">
            <p className="text-muted-foreground">No active trips</p>
          </Card>
        ) : (
          activeTrips.map(trip => {
            const vehicle = vehicles.find(v => v.id === trip.vehicleId);
            return (
              <Card key={trip.id} className="p-4 space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-medium text-foreground">{vehicle?.brand} {vehicle?.model}</p>
                    <p className="text-sm text-muted-foreground">{vehicle?.plateNumber}</p>
                  </div>
                  <span className="px-3 py-1 bg-green-500/20 text-green-700 dark:text-green-400 rounded-lg text-xs font-medium">
                    Ongoing
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-2">
                    <Fuel className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">Fuel Start</p>
                      <p className="font-medium text-foreground">{trip.fuelStart.toFixed(1)}L</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">Started</p>
                      <p className="font-medium text-foreground text-sm">{new Date(trip.startTime).toLocaleTimeString()}</p>
                    </div>
                  </div>
                </div>
                <Button 
                  onClick={() => {
                    const fuelEnd = prompt('Enter fuel end level (liters):');
                    const distance = prompt('Enter distance traveled (km):');
                    if (fuelEnd && distance) {
                      handleEndTrip(trip.id, parseFloat(fuelEnd), parseFloat(distance));
                    }
                  }}
                  className="w-full gap-2 bg-red-600 hover:bg-red-700"
                >
                  <StopCircle className="w-4 h-4" />
                  End Trip
                </Button>
              </Card>
            );
          })
        )}
      </div>

      {/* Start New Trip */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-foreground">Start New Trip</h2>
        {!showStartTrip ? (
          <Button onClick={() => {
            setActionError(null);
            setShowStartTrip(true);
          }} className="gap-2">
            <PlayCircle className="w-4 h-4" />
            Start Trip
          </Button>
        ) : (
          <Card className="p-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="rounded-lg border border-border bg-muted/30 p-4">
                <p className="text-xs text-muted-foreground">Fuel price / liter</p>
                <p className="mt-1 text-lg font-semibold text-foreground">${FUEL_PRICE_PER_LITER.toFixed(2)}</p>
              </div>
              <div className="rounded-lg border border-border bg-muted/30 p-4">
                <p className="text-xs text-muted-foreground">Standard trip distance</p>
                <p className="mt-1 text-lg font-semibold text-foreground">{STANDARD_TRIP_DISTANCE_KM} km</p>
              </div>
              <div className="rounded-lg border border-border bg-muted/30 p-4">
                <p className="text-xs text-muted-foreground">Estimated trip cost</p>
                <p className="mt-1 text-lg font-semibold text-primary">${estimatedTripCost.toFixed(2)}</p>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Vehicle</label>
              <select
                value={selectedVehicle}
                onChange={(e) => setSelectedVehicle(e.target.value)}
                className="w-full px-3 py-2 border border-border rounded-lg bg-card text-foreground"
              >
                <option value="">Select a vehicle</option>
                {userVehicles.map(v => (
                  <option key={v.id} value={v.id}>
                    {v.brand} {v.model} - {v.plateNumber}
                  </option>
                ))}
              </select>
            </div>
            {selectedVehicleRecord && (
              <Card className="p-4 bg-muted/50">
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-foreground">Cost preview for this vehicle</p>
                    <p className="text-xs text-muted-foreground">
                      {selectedVehicleRecord.brand} {selectedVehicleRecord.model} uses about {selectedVehicleRecord.fuelConsumption.toFixed(1)}L per 100 km.
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Estimated fuel needed: {estimatedFuelNeeded.toFixed(1)}L
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">Estimated fuel spend</p>
                    <p className="text-lg font-semibold text-foreground">${estimatedTripCost.toFixed(2)}</p>
                  </div>
                </div>
              </Card>
            )}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Fuel Level at Start (liters)</label>
              <input
                type="number"
                step="0.1"
                value={fuelStart}
                onChange={(e) => setFuelStart(e.target.value)}
                placeholder="e.g., 45.5"
                className="w-full px-3 py-2 border border-border rounded-lg bg-card text-foreground"
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={handleStartTrip} className="flex-1" disabled={isLoading}>Start</Button>
              <Button variant="outline" onClick={() => setShowStartTrip(false)} className="flex-1">Cancel</Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Tip: this is a guide only. Actual trip cost depends on distance, traffic, and fuel usage.
            </p>
          </Card>
        )}
      </div>

      {/* Trip History */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-foreground">Recent Trips</h2>
        {trips.filter(t => t.driverId === currentDriver?.id && t.status === 'completed').length === 0 ? (
          <Card className="p-6 text-center">
            <p className="text-muted-foreground">No completed trips yet</p>
          </Card>
        ) : (
          <div className="space-y-2">
            {trips
              .filter(t => t.driverId === currentDriver?.id && t.status === 'completed')
              .sort((a, b) => new Date(b.endTime || '').getTime() - new Date(a.endTime || '').getTime())
              .slice(0, 5)
              .map(trip => {
                const vehicle = vehicles.find(v => v.id === trip.vehicleId);
                return (
                  <Card key={trip.id} className="p-4 text-sm">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-medium">{vehicle?.plateNumber}</p>
                        <p className="text-xs text-muted-foreground">{new Date(trip.startTime).toLocaleDateString()}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{trip.distanceTraveled?.toFixed(1)}km</p>
                        <p className="text-xs text-muted-foreground">{((trip.fuelStart - (trip.fuelEnd || 0)).toFixed(1))}L used</p>
                      </div>
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
