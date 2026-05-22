'use client';

import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { useData } from '@/contexts/data-context';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ClipboardCheck, AlertTriangle, ShieldAlert } from 'lucide-react';

export default function DriverInspectionsPage() {
  const { user } = useAuth();
  const { drivers, vehicles, trips, inspectionReports, submitInspectionReport, isLoading } = useData();
  const [showForm, setShowForm] = useState(false);
  const [selectedTripId, setSelectedTripId] = useState('');
  const [formData, setFormData] = useState({
    type: 'pre_trip',
    status: 'good',
    notes: '',
  });
  const [actionError, setActionError] = useState<string | null>(null);

  const currentDriver = drivers.find(driver => driver.userId === user?.id);
  const assignedVehicle = vehicles.find(vehicle => vehicle.id === currentDriver?.assignedVehicleId);
  const driverTrips = useMemo(
    () => [...trips].filter(trip => trip.driverId === currentDriver?.id).sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime()),
    [currentDriver?.id, trips]
  );
  const recentInspections = useMemo(
    () => [...inspectionReports].filter(report => report.driverId === currentDriver?.id).sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()),
    [currentDriver?.id, inspectionReports]
  );

  const latestTrip = driverTrips[0];

  useEffect(() => {
    if (!selectedTripId && latestTrip?.id) {
      setSelectedTripId(latestTrip.id);
    }
  }, [latestTrip?.id, selectedTripId]);

  const handleSubmit = () => {
    if (!currentDriver) {
      setActionError('Hindi mahanap ang driver profile mo.');
      return;
    }

    if (!assignedVehicle) {
      setActionError('Walang assigned vehicle sa profile mo.');
      return;
    }

    if (!selectedTripId) {
      setActionError('Pumili ng trip bago mag-submit.');
      return;
    }

    if (!formData.notes.trim()) {
      setActionError('Maglagay ng inspection notes bago mag-submit.');
      return;
    }

    submitInspectionReport({
      tripId: selectedTripId,
      driverId: currentDriver.id,
      vehicleId: assignedVehicle.id,
      type: formData.type as 'pre_trip' | 'post_trip',
      status: formData.status as 'good' | 'minor_issue' | 'major_issue',
      notes: formData.notes.trim(),
    });

    setActionError(null);
    setShowForm(false);
    setSelectedTripId(latestTrip?.id || '');
    setFormData({ type: 'pre_trip', status: 'good', notes: '' });
  };

  const statusStyles: Record<string, string> = {
    good: 'bg-green-500/20 text-green-700 dark:text-green-400',
    minor_issue: 'bg-yellow-500/20 text-yellow-700 dark:text-yellow-400',
    major_issue: 'bg-red-500/20 text-red-700 dark:text-red-400',
  };

  const typeStyles: Record<string, string> = {
    pre_trip: 'bg-blue-500/20 text-blue-700 dark:text-blue-400',
    post_trip: 'bg-purple-500/20 text-purple-700 dark:text-purple-400',
  };

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl md:text-3xl font-bold text-foreground">My Inspections</h1>
        <p className="text-sm md:text-base text-muted-foreground">Submit vehicle inspection reports before and after trips</p>
      </div>

      {actionError && (
        <Card className="p-4 border-red-500/30 bg-red-500/10 text-red-700 dark:text-red-300">
          <p className="text-sm font-medium">{actionError}</p>
        </Card>
      )}

      {assignedVehicle && (
        <Card className="p-4 bg-muted/50">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-foreground">Assigned Vehicle</p>
              <p className="text-lg font-semibold">{assignedVehicle.brand} {assignedVehicle.model}</p>
              <p className="text-xs text-muted-foreground">{assignedVehicle.plateNumber}</p>
            </div>
            <ClipboardCheck className="w-6 h-6 text-primary" />
          </div>
        </Card>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-4 space-y-2">
          <p className="text-xs font-semibold text-muted-foreground uppercase">Inspections</p>
          <p className="text-3xl font-bold text-foreground">{recentInspections.length}</p>
          <p className="text-xs text-muted-foreground">Reports submitted by you</p>
        </Card>
        <Card className="p-4 space-y-2">
          <p className="text-xs font-semibold text-muted-foreground uppercase">Issues</p>
          <p className="text-3xl font-bold text-yellow-600">
            {recentInspections.filter(report => report.status !== 'good').length}
          </p>
          <p className="text-xs text-muted-foreground">Need follow-up review</p>
        </Card>
        <Card className="p-4 space-y-2">
          <p className="text-xs font-semibold text-muted-foreground uppercase">Trips</p>
          <p className="text-3xl font-bold text-primary">{driverTrips.length}</p>
          <p className="text-xs text-muted-foreground">Available for inspection</p>
        </Card>
      </div>

      {!showForm ? (
        <Button
          onClick={() => {
            setActionError(null);
            setShowForm(true);
          }}
          className="w-full gap-2"
          disabled={isLoading}
        >
          <AlertTriangle className="w-4 h-4" />
          Submit Inspection
        </Button>
      ) : (
        <Card className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Trip</label>
              <select
                value={selectedTripId}
                onChange={(e) => setSelectedTripId(e.target.value)}
                className="w-full px-3 py-2 border border-border rounded-lg bg-card text-foreground"
              >
                <option value="">Select a trip</option>
                {driverTrips.map(trip => {
                  const vehicle = vehicles.find(v => v.id === trip.vehicleId);
                  return (
                    <option key={trip.id} value={trip.id}>
                      {vehicle?.plateNumber || trip.vehicleId} - {new Date(trip.startTime).toLocaleDateString()}
                    </option>
                  );
                })}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Inspection Type</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="w-full px-3 py-2 border border-border rounded-lg bg-card text-foreground"
              >
                <option value="pre_trip">Pre Trip</option>
                <option value="post_trip">Post Trip</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Result</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-3 py-2 border border-border rounded-lg bg-card text-foreground"
              >
                <option value="good">Good</option>
                <option value="minor_issue">Minor Issue</option>
                <option value="major_issue">Major Issue</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Quick Guide</label>
              <div className={`rounded-lg px-3 py-2 text-sm font-medium ${typeStyles[formData.type]} ${statusStyles[formData.status]}`.trim()}>
                {formData.type.replace('_', ' ')} inspection - {formData.status.replace('_', ' ')}
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Notes</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={4}
              placeholder="Describe what you checked, any issues found, and recommendations..."
              className="w-full px-3 py-2 border border-border rounded-lg bg-card text-foreground"
            />
          </div>

          <div className="flex gap-2">
            <Button onClick={handleSubmit} className="flex-1" disabled={isLoading}>Submit</Button>
            <Button variant="outline" onClick={() => setShowForm(false)} className="flex-1">Cancel</Button>
          </div>

          <p className="text-xs text-muted-foreground flex items-center gap-2">
            <ShieldAlert className="w-3 h-3" />
            Inspection reports are sent directly to admin review.
          </p>
        </Card>
      )}

      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-foreground">Recent Reports</h2>
        {recentInspections.length === 0 ? (
          <Card className="p-6 text-center">
            <p className="text-muted-foreground">No inspection reports yet</p>
          </Card>
        ) : (
          <div className="space-y-2">
            {recentInspections.slice(0, 6).map(report => {
              const trip = trips.find(item => item.id === report.tripId);
              const vehicle = vehicles.find(item => item.id === report.vehicleId);

              return (
                <Card key={report.id} className="p-4 space-y-2">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="font-medium text-foreground capitalize">{report.type.replace('_', ' ')} inspection</p>
                      <p className="text-sm text-muted-foreground">{vehicle?.plateNumber} {trip ? `- ${new Date(trip.startTime).toLocaleDateString()}` : ''}</p>
                      <p className="text-sm text-foreground mt-1">{report.notes}</p>
                    </div>
                    <div className="text-right space-y-1">
                      <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${typeStyles[report.type]}`}>
                        {report.type.replace('_', ' ')}
                      </span>
                      <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${statusStyles[report.status]} ml-2`}>
                        {report.status.replace('_', ' ')}
                      </span>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">{new Date(report.submittedAt).toLocaleString()}</p>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
