'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { useData } from '@/contexts/data-context';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { AlertTriangle } from 'lucide-react';

const INCIDENT_REPAIR_GUIDE: Record<string, Record<string, [number, number]>> = {
  damage: {
    low: [120, 280],
    medium: [280, 650],
    high: [650, 1400],
  },
  accident: {
    low: [250, 700],
    medium: [700, 1800],
    high: [1800, 5000],
  },
  fuel_issue: {
    low: [80, 220],
    medium: [220, 450],
    high: [450, 950],
  },
  mechanical: {
    low: [150, 400],
    medium: [400, 1200],
    high: [1200, 3500],
  },
  other: {
    low: [100, 250],
    medium: [250, 600],
    high: [600, 1600],
  },
};

function formatCurrencyRange(min: number, max: number) {
  return `$${min.toFixed(0)} - $${max.toFixed(0)}`;
}

export default function DriverIncidentsPage() {
  const { user } = useAuth();
  const { incidents, vehicles, drivers, reportIncident, isLoading } = useData();
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    type: 'damage',
    severity: 'low',
    description: '',
  });
  const [actionError, setActionError] = useState<string | null>(null);

  const currentDriver = drivers.find(d => d.userId === user?.id);
  const assignedVehicle = vehicles.find(v => v.id === currentDriver?.assignedVehicleId);
  const driverIncidents = incidents.filter(i => i.driverId === currentDriver?.id);
  const estimatedRepairRange = INCIDENT_REPAIR_GUIDE[formData.type]?.[formData.severity] || [0, 0];

  const handleSubmit = () => {
    if (!currentDriver) {
      setActionError('Hindi mahanap ang driver profile mo. Pakisign out at sign in ulit.');
      return;
    }

    if (!assignedVehicle) {
      setActionError('Walang assigned vehicle sa profile mo, kaya hindi makapag-submit ng report.');
      return;
    }

    if (!formData.description) {
      setActionError('Maglagay ng description bago mag-submit.');
      return;
    }

    reportIncident({
      driverId: currentDriver.id,
      vehicleId: assignedVehicle.id,
      type: formData.type as any,
      severity: formData.severity as any,
      description: formData.description,
    });
    setActionError(null);
    setShowForm(false);
    setFormData({ type: 'damage', severity: 'low', description: '' });
  };

  const getSeverityColor = (severity: string) => {
    if (severity === 'high') return 'bg-red-500/20 text-red-700 dark:text-red-400';
    if (severity === 'medium') return 'bg-yellow-500/20 text-yellow-700 dark:text-yellow-400';
    return 'bg-blue-500/20 text-blue-700 dark:text-blue-400';
  };

  const getStatusColor = (status: string) => {
    if (status === 'resolved') return 'bg-green-500/20 text-green-700 dark:text-green-400';
    if (status === 'reviewed') return 'bg-yellow-500/20 text-yellow-700 dark:text-yellow-400';
    return 'bg-orange-500/20 text-orange-700 dark:text-orange-400';
  };

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl md:text-3xl font-bold text-foreground">Incident Reports</h1>
        <p className="text-sm md:text-base text-muted-foreground">Report vehicle issues and damage</p>
      </div>

      {actionError && (
        <Card className="p-4 border-red-500/30 bg-red-500/10 text-red-700 dark:text-red-300">
          <p className="text-sm font-medium">{actionError}</p>
        </Card>
      )}

      {isLoading && (
        <Card className="p-6 text-center">
          <p className="text-muted-foreground">Loading your incident data...</p>
        </Card>
      )}

      {/* Current Vehicle Info */}
      {assignedVehicle && (
        <Card className="p-4 bg-muted/50">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm font-medium text-foreground">Assigned Vehicle</p>
              <p className="text-lg font-semibold">{assignedVehicle.brand} {assignedVehicle.model}</p>
              <p className="text-xs text-muted-foreground">{assignedVehicle.plateNumber}</p>
            </div>
            <AlertTriangle className="w-6 h-6 text-primary" />
          </div>
        </Card>
      )}

      {/* Report Form */}
      {!showForm ? (
        <Button onClick={() => {
          setActionError(null);
          setShowForm(true);
        }} className="w-full gap-2">
          <AlertTriangle className="w-4 h-4" />
          Report Incident
        </Button>
      ) : (
        <Card className="p-6 space-y-4">
          <Card className="p-4 bg-muted/50">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1">
                <p className="text-sm font-medium text-foreground">Repair cost estimate</p>
                <p className="text-xs text-muted-foreground">
                  Based on incident type and severity, this is only a rough guide before review.
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs text-muted-foreground">Estimated range</p>
                <p className="text-lg font-semibold text-primary">
                  {formatCurrencyRange(estimatedRepairRange[0], estimatedRepairRange[1])}
                </p>
              </div>
            </div>
          </Card>
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Incident Type</label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              className="w-full px-3 py-2 border border-border rounded-lg bg-card text-foreground"
            >
              <option value="damage">Vehicle Damage</option>
              <option value="accident">Accident</option>
              <option value="fuel_issue">Fuel Issue</option>
              <option value="mechanical">Mechanical Problem</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Severity</label>
            <select
              value={formData.severity}
              onChange={(e) => setFormData({ ...formData, severity: e.target.value })}
              className="w-full px-3 py-2 border border-border rounded-lg bg-card text-foreground"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe the incident in detail..."
              rows={4}
              className="w-full px-3 py-2 border border-border rounded-lg bg-card text-foreground"
            />
          </div>
          <div className="flex gap-2">
            <Button onClick={handleSubmit} className="flex-1" disabled={isLoading}>Submit Report</Button>
            <Button variant="outline" onClick={() => setShowForm(false)} className="flex-1">Cancel</Button>
          </div>
          <p className="text-xs text-muted-foreground">
            Reported incidents are reviewed by the team, so the actual repair amount may change after inspection.
          </p>
        </Card>
      )}

      {/* Incidents List */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-foreground">Your Reports</h2>
        {driverIncidents.length === 0 ? (
          <Card className="p-6 text-center">
            <p className="text-muted-foreground">No incidents reported</p>
          </Card>
        ) : (
          <div className="space-y-2">
            {driverIncidents.sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()).map(incident => (
              <Card key={incident.id} className="p-4 space-y-2">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-medium text-foreground capitalize">{incident.type.replace('_', ' ')}</p>
                    <p className="text-sm text-muted-foreground">{incident.description}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Estimated repair: {formatCurrencyRange(
                        INCIDENT_REPAIR_GUIDE[incident.type]?.[incident.severity]?.[0] || 0,
                        INCIDENT_REPAIR_GUIDE[incident.type]?.[incident.severity]?.[1] || 0
                      )}
                    </p>
                  </div>
                  <div className="text-right space-y-1">
                    <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${getSeverityColor(incident.severity)}`}>
                      {incident.severity}
                    </span>
                    <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${getStatusColor(incident.status)} ml-2`}>
                      {incident.status}
                    </span>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">{new Date(incident.submittedAt).toLocaleString()}</p>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
