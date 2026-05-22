'use client';

import React, { useState, useMemo } from 'react';
import { useData } from '@/contexts/data-context';
import {
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  ShieldCheck,
  ShieldAlert,
  Search,
  CalendarDays,
  Car,
  User,
  FolderOpen,
  Trash2,
} from 'lucide-react';
import {
  Alert,
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableCell,
  TableHead,
} from '@/components/ui/table';

type TabKey = 'all' | 'pending' | 'reviewed';

export default function IncidentsReviewPage() {
  const { incidents, drivers, vehicles, inspectionReports, approveIncident, deleteIncident } = useData();

  const [reviewingId, setReviewingId] = useState<string | null>(null);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [resolution, setResolution] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTab, setSelectedTab] = useState<TabKey>('pending');

  const inspectedCount = inspectionReports.length;
  const unresolvedInspections = inspectionReports.filter(i => i.status !== 'good').length;

  const pendingIncidents = useMemo(
    () => incidents.filter(i => i.status === 'reported'),
    [incidents],
  );
  const reviewedIncidents = useMemo(
    () => incidents.filter(i => i.status === 'reviewed'),
    [incidents],
  );

  const highCount  = incidents.filter(i => i.severity === 'high'  && i.status !== 'resolved').length;
  const mediumCount = incidents.filter(i => i.severity === 'medium' && i.status !== 'resolved').length;
  const lowCount   = incidents.filter(i => i.severity === 'low'   && i.status !== 'resolved').length;

  const getVehicleById = (id: string) => vehicles.find(v => v.id === id);
  const getDriverById  = (id: string) => drivers.find(d => d.id === id);

  const handleApprove = (incidentId: string) => {
    approveIncident(incidentId, 'admin_user');
    setReviewingId(null);
    setResolution('');
  };

  const handleReject = (incidentId: string) => {
    approveIncident(incidentId, 'admin_user');
    setReviewingId(null);
    setResolution('');
  };

  const handleUnreview = (incidentId: string) => {
    approveIncident(incidentId, 'admin_user');
    setReviewingId(null);
    setResolution('');
  };

  const handleDelete = (incidentId: string) => {
    deleteIncident(incidentId);
    setDeleteTargetId(null);
    if (reviewingId === incidentId) setReviewingId(null);
  };

  /* â”€â”€ Tab filtering â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
  const filterTabMap: Record<TabKey, string> = { all: 'all', pending: 'reported', reviewed: 'reviewed' };

  const filteredIncidents = useMemo(() => {
    const all = selectedTab === 'pending'
      ? incidents.filter(i => i.status === 'reported')
      : selectedTab === 'reviewed'
        ? incidents.filter(i => i.status === 'reviewed')
        : incidents;
    const q = searchTerm.toLowerCase();
    return all.filter(i => {
      const v = getVehicleById(i.vehicleId);
      const d = getDriverById(i.driverId);
      return (
        i.type.toLowerCase().includes(q) ||
        i.description.toLowerCase().includes(q) ||
        (v?.plateNumber ?? '').toLowerCase().includes(q) ||
        (d?.name ?? '').toLowerCase().includes(q)
      );
    });
  }, [incidents, selectedTab, searchTerm, getVehicleById, getDriverById]);

  /* â”€â”€ Severity helpers â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
  const severityMeta: Record<string, { label: string; icon: React.ReactNode; badgeClass: string; dotClass: string }> = {
    high: {
      label: 'High',
      icon: <ShieldAlert className="w-3.5 h-3.5" />,
      badgeClass: 'inline-flex items-center gap-1 bg-red-500/20 text-red-700 dark:bg-red-500/15 dark:text-red-400',
      dotClass: 'bg-red-500',
    },
    medium: {
      label: 'Medium',
      icon: <AlertTriangle className="w-3.5 h-3.5" />,
      badgeClass: 'inline-flex items-center gap-1 bg-yellow-500/20 text-yellow-700 dark:bg-yellow-500/15 dark:text-yellow-400',
      dotClass: 'bg-yellow-500',
    },
    low: {
      label: 'Low',
      icon: <ShieldCheck className="w-3.5 h-3.5" />,
      badgeClass: 'inline-flex items-center gap-1 bg-blue-500/20 text-blue-700 dark:bg-blue-500/15 dark:text-blue-400',
      dotClass: 'bg-blue-500',
    },
  };

  const statusMeta: Record<string, { label: string; badgeClass: string; iconClass: string }> = {
    reported: {
      label: 'Reported',
      badgeClass: 'bg-orange-500/20 text-orange-700 dark:bg-orange-500/15 dark:text-orange-400',
      iconClass: 'text-orange-500',
    },
    reviewed: {
      label: 'Reviewed',
      badgeClass: 'bg-blue-500/20 text-blue-700 dark:bg-blue-500/15 dark:text-blue-400',
      iconClass: 'text-blue-500',
    },
    resolved: {
      label: 'Resolved',
      badgeClass: 'bg-green-500/20 text-green-700 dark:bg-green-500/15 dark:text-green-400',
      iconClass: 'text-green-500',
    },
  };

  const driverViewUrl = (driverId: string) => `/drivers/${driverId}`;
  const vehicleViewUrl = (vehicleId: string) => `/vehicles/${vehicleId}`;

  const activeReview = reviewingId ? incidents.find(i => i.id === reviewingId) : null;

  /* â”€â”€ IncidentCard (inner, closure access) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
  type CardVariant = 'pending' | 'reviewed';

  function IncidentCard({
    incident,
    variant,
    onReview,
    reviewingId,
    resolution,
    onResolutionChange,
    onApprove,
    onUnreview,
    onDelete,
    deleteTargetId,
  }: {
    incident: any;
    variant: CardVariant;
    onReview: (id: string) => void;
    reviewingId: string | null;
    resolution: string;
    onResolutionChange: (v: string) => void;
    onApprove: (id: string) => void;
    onUnreview: (id: string) => void;
    onDelete: (id: string) => void;
    deleteTargetId: string | null;
  }) {
    const vehicle = getVehicleById(incident.vehicleId);
    const driver  = getDriverById(incident.driverId);
    const sv = severityMeta[incident.severity];
    const st = statusMeta[incident.status];
    const isEditing = reviewingId === incident.id;

    return (
      <Card
        className={`border-l-4 transition-all duration-200 hover:shadow-md ${
          incident.severity === 'high'  ? 'border-l-red-500' :
          incident.severity === 'medium' ? 'border-l-yellow-500' :
                                           'border-l-blue-500'
        } ${variant === 'pending' ? 'bg-card' : 'bg-muted/30'}`}
      >
        <div className="p-4 space-y-3">
          <div className="flex justify-between items-start gap-4">
            <div className="flex items-start gap-3 min-w-0">
              <div className="mt-0.5 shrink-0">{sv.icon}</div>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-semibold text-foreground capitalize">{incident.type.replace('_', ' ')}</p>
                  <Badge variant="secondary" className={sv.badgeClass}>{sv.label} Severity</Badge>
                  <Badge variant="secondary" className={st.badgeClass}>{st.label}</Badge>
                </div>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-0.5 mt-1.5 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1.5">
                    <Car className="w-3.5 h-3.5" />
                    {vehicle?.plateNumber ?? vehicle?.vehicleId ?? incident.vehicleId.slice(0, 8)}
                    {vehicle && <span className="text-muted-foreground/60">â€” {vehicle.brand} {vehicle.model}</span>}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5" />
                    {driver?.name ?? 'Unknown'}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <CalendarDays className="w-3.5 h-3.5" />
                    {new Date(incident.submittedAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                  </span>
                  <span className="flex items-center gap-1.5 opacity-60">
                    <Clock className="w-3 h-3" />
                    {new Date(incident.submittedAt).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            </div>
            <div className="shrink-0 flex flex-col items-end gap-2">
              {variant === 'pending' && !isEditing ? (
                <Button size="sm" onClick={() => onReview(incident.id)} className="gap-1.5">
                  <CheckCircle className="w-4 h-4" /> Review
                </Button>
              ) : variant === 'reviewed' && !isEditing ? (
                <div className="flex gap-1.5">
                  <Button size="sm" variant="outline" onClick={() => onUnreview(incident.id)} className="gap-1">
                    <Clock className="w-3.5 h-3.5" /> Reopen
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button size="sm" variant="ghost" className="gap-1 text-destructive hover:text-destructive hover:bg-destructive/10">
                        <Trash2 className="w-3.5 h-3.5" /> Delete
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete this incident?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This permanently removes the incident record for <strong>{incident.type.replace('_', ' ')}</strong> ({vehicle?.plateNumber ?? incident.vehicleId.slice(0, 8)}). This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Keep</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => onDelete(incident.id)}
                          className="bg-destructive text-white hover:bg-destructive/90"
                        >
                          Delete Permanently
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              ) : null}
            </div>
          </div>
          <p className="text-sm text-foreground/80 leading-relaxed border-l-2 border-border/40 pl-3">{incident.description}</p>
          {isEditing && (
            <div className="pt-2 border-t border-border/40 space-y-2">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Resolution Notes</p>
              <Textarea placeholder="Action taken · cost estimate · reminders for follow-up…" value={resolution} onChange={e => onResolutionChange(e.target.value)} rows={4} className="resize-none" />
              {variant === 'pending' && (
                <div className="flex gap-2">
                  <Button size="sm" className="flex-1 gap-1.5" onClick={() => onApprove(incident.id)}><CheckCircle className="w-4 h-4" /> Approve &amp; Close</Button>
                  <Button size="sm" variant="destructive" className="flex-1 gap-1.5" onClick={() => onUnreview(incident.id)}><XCircle className="w-4 h-4" /> Dismiss</Button>
                  <Button size="sm" variant="outline" className="flex-1" onClick={() => onReview('')}>Cancel</Button>
                </div>
              )}
              {variant === 'reviewed' && (
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" className="flex-1 gap-1" onClick={() => onUnreview(incident.id)}><Clock className="w-4 h-4" /> Reopen</Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button size="sm" variant="ghost" className="flex-1 gap-1 text-destructive hover:text-destructive hover:bg-destructive/10"><Trash2 className="w-4 h-4" /> Delete</Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete this incident?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Permanently remove <strong>{incident.type.replace('_', ' ')}</strong> ({vehicle?.plateNumber ?? incident.vehicleId.slice(0, 8)}). This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Keep</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => onDelete(incident.id)}
                          className="bg-destructive text-white hover:bg-destructive/90"
                        >
                          Delete Permanently
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                  <Button size="sm" variant="outline" className="flex-1" onClick={() => onReview('')}>Close</Button>
                </div>
              )}
            </div>
          )}
        </div>
      </Card>
    );
  }


  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6">
      {/* â”€â”€ Page Header â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <div className="space-y-1">
        <h1 className="text-2xl md:text-3xl font-bold text-foreground flex items-center gap-2">
          <AlertTriangle className="w-7 h-7 text-destructive" />
          Incident & Inspection Review
        </h1>
        <p className="text-sm md:text-base text-muted-foreground">
          Review, approve, and track reported incidents and inspection quality
        </p>
      </div>

      {/* â”€â”€ KPI Overview â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-4">
        <Card className="border-l-4 border-l-orange-500">
          <CardContent className="p-4 space-y-1">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Pending</p>
            <p className="text-2xl font-bold text-orange-600">{pendingIncidents.length}</p>
            <p className="text-[10px] text-muted-foreground">Awaiting review</p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-blue-500">
          <CardContent className="p-4 space-y-1">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Reviewed</p>
            <p className="text-2xl font-bold text-blue-600">{reviewedIncidents.length}</p>
            <p className="text-[10px] text-muted-foreground">Processed incidents</p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-green-500">
          <CardContent className="p-4 space-y-1">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Inspections</p>
            <p className="text-2xl font-bold text-green-600">{inspectedCount}</p>
            <p className="text-[10px] text-muted-foreground">Total reports</p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-red-500">
          <CardContent className="p-4 space-y-1">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">High Severity</p>
            <p className="text-2xl font-bold text-red-600">{highCount}</p>
            <p className="text-[10px] text-muted-foreground">Unresolved high</p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-yellow-500">
          <CardContent className="p-4 space-y-1">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Medium</p>
            <p className="text-2xl font-bold text-yellow-600">{mediumCount}</p>
            <p className="text-[10px] text-muted-foreground">Unresolved medium</p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-blue-500">
          <CardContent className="p-4 space-y-1">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Low Severity</p>
            <p className="text-2xl font-bold text-blue-600">{lowCount}</p>
            <p className="text-[10px] text-muted-foreground">Unresolved low</p>
          </CardContent>
        </Card>
      </div>

      {/* â”€â”€ Tabs + Search â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <Tabs value={selectedTab} onValueChange={(v) => setSelectedTab(v as TabKey)}>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <TabsList className="self-start">
            <TabsTrigger value="pending">
              Pending
              {pendingIncidents.length > 0 && (
                <span className="ml-1.5 h-4 w-4 inline-flex items-center justify-center rounded-full bg-orange-500 text-[10px] text-white font-semibold">
                  {pendingIncidents.length}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="reviewed">Reviewed</TabsTrigger>
            <TabsTrigger value="all">All</TabsTrigger>
          </TabsList>

          {pendingIncidents.length > 0 && (
            <div className="relative self-start">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                placeholder="Filter by vehicle, driver, typeâ€¦"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="h-9 pl-8 pr-3 text-sm bg-card border border-border/50 rounded-lg w-48 sm:w-64 focus:outline-none focus:ring-1 focus:ring-ring transition-all"
              />
            </div>
          )}
        </div>

        {/* â”€â”€ PENDING INCIDENTS â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
        <TabsContent value="pending" className="mt-6 space-y-4">
          {filteredIncidents.length === 0 ? (
            <Card className="p-10 text-center space-y-3">
              <CheckCircle className="w-14 h-14 text-green-600 mx-auto" />
              <p className="text-lg font-medium text-foreground">All caught up</p>
              <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                No pending incidents match your filter. Great work keeping the fleet safe.
              </p>
            </Card>
          ) : (
            <div className="space-y-3">
              {filteredIncidents.map(incident => (
                <IncidentCard
                  key={incident.id}
                  incident={incident}
                  variant="pending"
                  onReview={setReviewingId}
                  reviewingId={reviewingId}
                  resolution={resolution}
                  onResolutionChange={setResolution}
                  onApprove={handleApprove}
                  onUnreview={handleUnreview}
                  onDelete={handleDelete}
                  deleteTargetId={deleteTargetId}
                />
              ))}
            </div>
          )}
        </TabsContent>

        {/* â”€â”€ REVIEWED INCIDENTS â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
        <TabsContent value="reviewed" className="mt-6 space-y-4">
          {filteredIncidents.length === 0 ? (
            <Card className="p-10 text-center space-y-3">
              <FolderOpen className="w-14 h-14 text-muted-foreground mx-auto" />
              <p className="text-lg font-medium text-foreground">No reviewed incidents yet</p>
              <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                Once incidents are approved or marked reviewed, they will appear here with resolution notes.
              </p>
            </Card>
          ) : (
            <div className="space-y-3">
              {filteredIncidents.slice().reverse().map(incident => (
                <IncidentCard
                  key={incident.id}
                  incident={incident}
                  variant="reviewed"
                  onReview={setReviewingId}
                  reviewingId={reviewingId}
                  resolution={resolution}
                  onResolutionChange={setResolution}
                  onApprove={handleApprove}
                  onUnreview={handleUnreview}
                  onDelete={handleDelete}
                  deleteTargetId={deleteTargetId}
                />
              ))}
            </div>
          )}
        </TabsContent>

        {/* â”€â”€ ALL INCIDENTS â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
        <TabsContent value="all" className="mt-6 space-y-4">
          {filteredIncidents.length === 0 ? (
            <Card className="p-10 text-center space-y-3">
              <FolderOpen className="w-14 h-14 text-muted-foreground mx-auto" />
              <p className="text-lg font-medium text-foreground">No incidents yet</p>
              <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                When drivers report incidents, they will appear here for your review.
              </p>
            </Card>
          ) : (
            <div className="space-y-3">
              {filteredIncidents.slice().reverse().map(incident => (
                <IncidentCard
                  key={incident.id}
                  incident={incident}
                  variant={incident.status === 'reported' ? 'pending' : 'reviewed'}
                  onReview={setReviewingId}
                  reviewingId={reviewingId}
                  resolution={resolution}
                  onResolutionChange={setResolution}
                  onApprove={handleApprove}
                  onUnreview={handleUnreview}
                  onDelete={handleDelete}
                  deleteTargetId={deleteTargetId}
                />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* â”€â”€ Approval / Reject Dialog â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      {activeReview && (() => {
        const vehicle = getVehicleById(activeReview.vehicleId);
        const driver  = getDriverById(activeReview.driverId);
        const sv = severityMeta[activeReview.severity];
        return (
          <Dialog open={!!reviewingId} onOpenChange={open => !open && setReviewingId(null)}>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2 text-destructive">
                  {sv.icon}
                  {sv.label} Incident â€” {activeReview.type.replace('_', ' ')}
                </DialogTitle>
                <DialogDescription>
                  {driver?.name} Â· {vehicle?.plateNumber ?? 'Unknown vehicle'} Â·{' '}
                  {new Date(activeReview.submittedAt).toLocaleString()}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-3 py-1">
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">Description</p>
                  <p className="text-sm text-foreground leading-relaxed">{activeReview.description}</p>
                </div>

                <div className="flex gap-2">
                  <Badge variant="secondary" className={sv.badgeClass}>{sv.label} severity</Badge>
                  <Badge variant="secondary" className={statusMeta[activeReview.status].badgeClass}>
                    {statusMeta[activeReview.status].label}
                  </Badge>
                </div>

                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">
                    Resolution Notes
                  </p>
                  <Textarea
                    placeholder="Describe the action taken, cost assessment, repairs scheduled, follow-up requiredâ€¦"
                    value={resolution}
                    onChange={e => setResolution(e.target.value)}
                    rows={4}
                    className="resize-none"
                  />
                </div>
              </div>

              <DialogFooter className="gap-2">
                <DialogClose asChild>
                  <Button variant="outline" size="sm">Cancel</Button>
                </DialogClose>
                <Button
                  variant="destructive"
                  size="sm"
                  className="gap-1"
                  onClick={() => handleReject(activeReview.id)}
                >
                  <XCircle className="w-4 h-4" />
                  Mark Reviewed No Action
                </Button>
                <Button
                  size="sm"
                  className="gap-1"
                  onClick={() => handleApprove(activeReview.id)}
                >
                  <CheckCircle className="w-4 h-4" />
                  Approve Resolution
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        );
      })()}

      {/* â”€â”€ Summary Table â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <div className="space-y-4 pt-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-foreground">
            Incident Summary â€” All Records
          </h2>
          <Badge variant="outline">{incidents.length} total</Badge>
        </div>

        {incidents.length === 0 ? (
          <Card className="p-10 text-center space-y-3">
            <CheckCircle className="w-14 h-14 text-green-600 mx-auto" />
            <p className="text-lg font-medium text-foreground">All clear</p>
            <p className="text-sm text-muted-foreground">No incidents or inspections have been reported yet.</p>
          </Card>
        ) : (
          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>#</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Severity</TableHead>
                  <TableHead>Vehicle</TableHead>
                  <TableHead>Driver</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Reported</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {incidents
                  .slice()
                  .sort((a, b) =>
                    new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime(),
                  )
                  .map((incident, idx) => {
                    const vehicle = getVehicleById(incident.vehicleId);
                    const driver  = getDriverById(incident.driverId);
                    const isPending = incident.status === 'reported';
                    const sv = severityMeta[incident.severity];
                    const st = statusMeta[incident.status];
                    return (
                      <TableRow
                        key={incident.id}
                        className={isPending ? 'bg-orange-500/[0.04]' : undefined}
                      >
                        <TableCell className="text-xs text-muted-foreground font-mono">
                          #{incidents.length - idx}
                        </TableCell>
                        <TableCell className="capitalize font-medium">
                          {incident.type.replace('_', ' ')}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="secondary"
                            className={sv.badgeClass}
                          >
                            {sv.icon}
                            {sv.label}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <span className="flex items-center gap-1.5 text-sm">
                            <Car className="w-3 h-3 text-muted-foreground" />
                            {vehicle?.plateNumber ?? vehicle?.vehicleId ?? incident.vehicleId.slice(0, 8)}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className="flex items-center gap-1.5 text-sm">
                            <User className="w-3 h-3 text-muted-foreground" />
                            {driver?.name ?? 'Unknown'}
                          </span>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary" className={st.badgeClass}>
                            {st.label}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground whitespace-nowrap text-xs">
                          {new Date(incident.submittedAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1.5">
                            {isPending ? (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setReviewingId(incident.id)}
                                className="gap-1"
                              >
                                <CheckCircle className="w-3.5 h-3.5" />
                                Review
                              </Button>
                            ) : (
                              <>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => setReviewingId(incident.id)}
                                  className="gap-1"
                                >
                                  <Clock className="w-3.5 h-3.5" />
                                  Reopen
                                </Button>
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      className="gap-1 text-destructive hover:text-destructive hover:bg-destructive/10"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                      Delete
                                    </Button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>Delete this incident?</AlertDialogTitle>
                                      <AlertDialogDescription>
                                        Permanently remove <strong>{incident.type.replace('_', ' ')}</strong> ({vehicle?.plateNumber ?? incident.vehicleId.slice(0, 8)}). This cannot be undone.
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>Keep</AlertDialogCancel>
                                      <AlertDialogAction
                                        onClick={() => handleDelete(incident.id)}
                                        className="bg-destructive text-white hover:bg-destructive/90"
                                      >
                                        Delete Permanently
                                      </AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                              </>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
              </TableBody>
            </Table>
          </Card>
        )}
      </div>
    </div>
  );
}

