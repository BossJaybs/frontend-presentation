'use client';

import React, { createContext, useContext, useCallback, useState, useEffect } from 'react';
import { nanoid } from 'nanoid';
import { logActivity } from '@/lib/auth';
import { useAuth } from './auth-context';

export interface Vehicle {
  id: string;
  vehicleId: string;
  plateNumber: string;
  model: string;
  brand: string;
  year: number;
  status: 'active' | 'maintenance' | 'inactive';
  fuelConsumption: number;
  createdAt: string;
  updatedAt: string;
}

export interface Driver {
  id: string;
  userId?: string;
  name: string;
  licenseNumber: string;
  contactNumber: string;
  assignedVehicleId: string | null;
  status: 'active' | 'inactive' | 'on_leave';
  createdAt: string;
  updatedAt: string;
}

export interface MaintenanceRecord {
  id: string;
  vehicleId: string;
  type: 'oil_change' | 'tire_repair' | 'inspection' | 'repair' | 'other';
  date: string;
  cost: number;
  notes: string;
  createdAt: string;
}

export interface Trip {
  id: string;
  driverId: string;
  vehicleId: string;
  startTime: string;
  endTime: string | null;
  status: 'ongoing' | 'completed' | 'cancelled';
  fuelStart: number;
  fuelEnd: number | null;
  distanceTraveled: number | null;
  createdAt: string;
}

export interface InspectionReport {
  id: string;
  tripId: string;
  driverId: string;
  vehicleId: string;
  type: 'pre_trip' | 'post_trip';
  status: 'good' | 'minor_issue' | 'major_issue';
  notes: string;
  submittedAt: string;
}

export interface Incident {
  id: string;
  driverId: string;
  vehicleId: string;
  type: 'damage' | 'accident' | 'fuel_issue' | 'mechanical' | 'other';
  severity: 'low' | 'medium' | 'high';
  description: string;
  status: 'reported' | 'reviewed' | 'resolved';
  approvedBy: string | null;
  submittedAt: string;
}

interface DataContextType {
  vehicles: Vehicle[];
  drivers: Driver[];
  maintenance: MaintenanceRecord[];
  trips: Trip[];
  inspectionReports: InspectionReport[];
  incidents: Incident[];
  addVehicle: (vehicle: Omit<Vehicle, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateVehicle: (id: string, vehicle: Partial<Vehicle>) => void;
  deleteVehicle: (id: string) => void;
  addDriver: (driver: Omit<Driver, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateDriver: (id: string, driver: Partial<Driver>) => void;
  deleteDriver: (id: string) => void;
  addMaintenanceRecord: (record: Omit<MaintenanceRecord, 'id' | 'createdAt'>) => void;
  deleteMaintenanceRecord: (id: string) => void;
  getMaintenanceForVehicle: (vehicleId: string) => MaintenanceRecord[];
  startTrip: (trip: Omit<Trip, 'id' | 'createdAt' | 'status'>) => void;
  endTrip: (tripId: string, fuelEnd: number, distanceTraveled: number) => void;
  getActiveTrips: () => Trip[];
  submitInspectionReport: (report: Omit<InspectionReport, 'id' | 'submittedAt'>) => void;
  reportIncident: (incident: Omit<Incident, 'id' | 'submittedAt' | 'status' | 'approvedBy'>) => void;
  approveIncident: (incidentId: string, approverId: string) => void;
  deleteIncident: (incidentId: string) => void;
  isLoading: boolean;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

const STORAGE_KEY_VEHICLES = 'group4fvms_vehicles';
const STORAGE_KEY_DRIVERS = 'group4fvms_drivers';
const STORAGE_KEY_MAINTENANCE = 'group4fvms_maintenance';
const STORAGE_KEY_TRIPS = 'group4fvms_trips';
const STORAGE_KEY_INSPECTIONS = 'group4fvms_inspections';
const STORAGE_KEY_INCIDENTS = 'group4fvms_incidents';

export function DataProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [maintenance, setMaintenance] = useState<MaintenanceRecord[]>([]);
  const [trips, setTrips] = useState<Trip[]>([]);
  const [inspectionReports, setInspectionReports] = useState<InspectionReport[]>([]);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const normalizeDrivers = useCallback((loadedDrivers: Driver[]) => {
    return loadedDrivers.map((driver) => {
      if (driver.id === 'drv_1' && !driver.userId) {
        return { ...driver, userId: 'usr_3' };
      }

      return driver;
    });
  }, []);

  // Load data from localStorage on mount
  useEffect(() => {
    try {
      const savedVehicles = localStorage.getItem(STORAGE_KEY_VEHICLES);
      const savedDrivers = localStorage.getItem(STORAGE_KEY_DRIVERS);
      const savedMaintenance = localStorage.getItem(STORAGE_KEY_MAINTENANCE);

      if (savedVehicles) setVehicles(JSON.parse(savedVehicles));
      else {
        // Initialize with demo data
        const demoVehicles: Vehicle[] = [
          {
            id: 'veh_1',
            vehicleId: 'FL-001',
            plateNumber: 'ABC-123',
            model: 'F-150',
            brand: 'Ford',
            year: 2022,
            status: 'active',
            fuelConsumption: 12.5,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
          {
            id: 'veh_2',
            vehicleId: 'FL-002',
            plateNumber: 'DEF-456',
            model: 'Sprinter',
            brand: 'Mercedes',
            year: 2021,
            status: 'active',
            fuelConsumption: 8.3,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
          {
            id: 'veh_3',
            vehicleId: 'FL-003',
            plateNumber: 'GHI-789',
            model: 'ProMaster',
            brand: 'Nissan',
            year: 2020,
            status: 'maintenance',
            fuelConsumption: 9.1,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
          {
            id: 'veh_4',
            vehicleId: 'FL-004',
            plateNumber: 'JKL-012',
            model: 'Transit',
            brand: 'Ford',
            year: 2019,
            status: 'active',
            fuelConsumption: 7.8,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
          {
            id: 'veh_5',
            vehicleId: 'FL-005',
            plateNumber: 'MNO-345',
            model: 'Citroën Jumper',
            brand: 'Citroën',
            year: 2021,
            status: 'inactive',
            fuelConsumption: 8.9,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
        ];
        setVehicles(demoVehicles);
        localStorage.setItem(STORAGE_KEY_VEHICLES, JSON.stringify(demoVehicles));
      }

      if (savedDrivers) {
        const parsedDrivers = normalizeDrivers(JSON.parse(savedDrivers));
        setDrivers(parsedDrivers);
        localStorage.setItem(STORAGE_KEY_DRIVERS, JSON.stringify(parsedDrivers));
      } else {
        const demoDrivers: Driver[] = [
          {
            id: 'drv_1',
            userId: 'usr_3',
            name: 'John Smith',
            licenseNumber: 'DL123456',
            contactNumber: '+1-555-0101',
            assignedVehicleId: 'veh_1',
            status: 'active',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
          {
            id: 'drv_2',
            name: 'Sarah Johnson',
            licenseNumber: 'DL123457',
            contactNumber: '+1-555-0102',
            assignedVehicleId: 'veh_2',
            status: 'active',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
          {
            id: 'drv_3',
            name: 'Michael Brown',
            licenseNumber: 'DL123458',
            contactNumber: '+1-555-0103',
            assignedVehicleId: null,
            status: 'on_leave',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
          {
            id: 'drv_4',
            name: 'Emily Davis',
            licenseNumber: 'DL123459',
            contactNumber: '+1-555-0104',
            assignedVehicleId: 'veh_4',
            status: 'active',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
        ];
        setDrivers(demoDrivers);
        localStorage.setItem(STORAGE_KEY_DRIVERS, JSON.stringify(demoDrivers));
      }

      if (savedMaintenance) setMaintenance(JSON.parse(savedMaintenance));
      else {
        const demoMaintenance: MaintenanceRecord[] = [
          {
            id: 'mnt_1',
            vehicleId: 'veh_1',
            type: 'oil_change',
            date: '2024-01-15',
            cost: 150,
            notes: 'Regular oil change and filter replacement',
            createdAt: new Date().toISOString(),
          },
          {
            id: 'mnt_2',
            vehicleId: 'veh_2',
            type: 'tire_repair',
            date: '2024-01-20',
            cost: 250,
            notes: 'Flat tire repair',
            createdAt: new Date().toISOString(),
          },
          {
            id: 'mnt_3',
            vehicleId: 'veh_3',
            type: 'inspection',
            date: '2024-02-01',
            cost: 100,
            notes: 'Annual inspection',
            createdAt: new Date().toISOString(),
          },
          {
            id: 'mnt_4',
            vehicleId: 'veh_1',
            type: 'repair',
            date: '2024-02-10',
            cost: 500,
            notes: 'Brake system repair',
            createdAt: new Date().toISOString(),
          },
        ];
        setMaintenance(demoMaintenance);
        localStorage.setItem(STORAGE_KEY_MAINTENANCE, JSON.stringify(demoMaintenance));
      }

      // Load trips
      const savedTrips = localStorage.getItem(STORAGE_KEY_TRIPS);
      if (savedTrips) setTrips(JSON.parse(savedTrips));
      else {
        const demoTrips: Trip[] = [];
        setTrips(demoTrips);
        localStorage.setItem(STORAGE_KEY_TRIPS, JSON.stringify(demoTrips));
      }

      // Load inspection reports
      const savedInspections = localStorage.getItem(STORAGE_KEY_INSPECTIONS);
      if (savedInspections) setInspectionReports(JSON.parse(savedInspections));
      else {
        const demoInspections: InspectionReport[] = [];
        setInspectionReports(demoInspections);
        localStorage.setItem(STORAGE_KEY_INSPECTIONS, JSON.stringify(demoInspections));
      }

      // Load incidents
      const savedIncidents = localStorage.getItem(STORAGE_KEY_INCIDENTS);
      if (savedIncidents) setIncidents(JSON.parse(savedIncidents));
      else {
        const demoIncidents: Incident[] = [];
        setIncidents(demoIncidents);
        localStorage.setItem(STORAGE_KEY_INCIDENTS, JSON.stringify(demoIncidents));
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  const addVehicle = useCallback((vehicle: Omit<Vehicle, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newVehicle: Vehicle = {
      ...vehicle,
      id: `veh_${nanoid()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const updated = [...vehicles, newVehicle];
    setVehicles(updated);
    localStorage.setItem(STORAGE_KEY_VEHICLES, JSON.stringify(updated));
    logActivity('CREATE_VEHICLE', `Added vehicle: ${vehicle.vehicleId}`);
  }, [vehicles]);

  const updateVehicle = useCallback((id: string, updates: Partial<Vehicle>) => {
    const updated = vehicles.map(v =>
      v.id === id ? { ...v, ...updates, updatedAt: new Date().toISOString() } : v
    );
    setVehicles(updated);
    localStorage.setItem(STORAGE_KEY_VEHICLES, JSON.stringify(updated));
    logActivity('UPDATE_VEHICLE', `Updated vehicle: ${id}`);
  }, [vehicles]);

  const deleteVehicle = useCallback((id: string) => {
    const updated = vehicles.filter(v => v.id !== id);
    setVehicles(updated);
    localStorage.setItem(STORAGE_KEY_VEHICLES, JSON.stringify(updated));
    logActivity('DELETE_VEHICLE', `Deleted vehicle: ${id}`);
  }, [vehicles]);

  const addDriver = useCallback((driver: Omit<Driver, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newDriver: Driver = {
      ...driver,
      id: `drv_${nanoid()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const updated = [...drivers, newDriver];
    setDrivers(updated);
    localStorage.setItem(STORAGE_KEY_DRIVERS, JSON.stringify(updated));
    logActivity('CREATE_DRIVER', `Added driver: ${driver.name}`);
  }, [drivers]);

  const updateDriver = useCallback((id: string, updates: Partial<Driver>) => {
    const updated = drivers.map(d =>
      d.id === id ? { ...d, ...updates, updatedAt: new Date().toISOString() } : d
    );
    setDrivers(updated);
    localStorage.setItem(STORAGE_KEY_DRIVERS, JSON.stringify(updated));
    logActivity('UPDATE_DRIVER', `Updated driver: ${id}`);
  }, [drivers]);

  const deleteDriver = useCallback((id: string) => {
    const updated = drivers.filter(d => d.id !== id);
    setDrivers(updated);
    localStorage.setItem(STORAGE_KEY_DRIVERS, JSON.stringify(updated));
    logActivity('DELETE_DRIVER', `Deleted driver: ${id}`);
  }, [drivers]);

  const addMaintenanceRecord = useCallback((record: Omit<MaintenanceRecord, 'id' | 'createdAt'>) => {
    const newRecord: MaintenanceRecord = {
      ...record,
      id: `mnt_${nanoid()}`,
      createdAt: new Date().toISOString(),
    };
    const updated = [...maintenance, newRecord];
    setMaintenance(updated);
    localStorage.setItem(STORAGE_KEY_MAINTENANCE, JSON.stringify(updated));
    logActivity('CREATE_MAINTENANCE', `Added maintenance record for vehicle: ${record.vehicleId}`);
  }, [maintenance]);

  const deleteMaintenanceRecord = useCallback((id: string) => {
    const updated = maintenance.filter(m => m.id !== id);
    setMaintenance(updated);
    localStorage.setItem(STORAGE_KEY_MAINTENANCE, JSON.stringify(updated));
    logActivity('DELETE_MAINTENANCE', `Deleted maintenance record: ${id}`);
  }, [maintenance]);

  const getMaintenanceForVehicle = useCallback((vehicleId: string) => {
    return maintenance.filter(m => m.vehicleId === vehicleId);
  }, [maintenance]);

  const startTrip = useCallback((trip: Omit<Trip, 'id' | 'createdAt' | 'status'>) => {
    const newTrip: Trip = {
      ...trip,
      id: `trip_${nanoid()}`,
      status: 'ongoing',
      createdAt: new Date().toISOString(),
    };
    const updated = [...trips, newTrip];
    setTrips(updated);
    localStorage.setItem(STORAGE_KEY_TRIPS, JSON.stringify(updated));
    logActivity('START_TRIP', `Trip started for vehicle: ${trip.vehicleId}`);
  }, [trips]);

  const endTrip = useCallback((tripId: string, fuelEnd: number, distanceTraveled: number) => {
    const updated = trips.map(t =>
      t.id === tripId
        ? {
            ...t,
            endTime: new Date().toISOString(),
            fuelEnd,
            distanceTraveled,
            status: 'completed' as const,
          }
        : t
    );
    setTrips(updated);
    localStorage.setItem(STORAGE_KEY_TRIPS, JSON.stringify(updated));
    logActivity('END_TRIP', `Trip completed: ${tripId}`);
  }, [trips]);

  const getActiveTrips = useCallback(() => {
    return trips.filter(t => t.status === 'ongoing');
  }, [trips]);

  const submitInspectionReport = useCallback((report: Omit<InspectionReport, 'id' | 'submittedAt'>) => {
    const newReport: InspectionReport = {
      ...report,
      id: `insp_${nanoid()}`,
      submittedAt: new Date().toISOString(),
    };
    const updated = [...inspectionReports, newReport];
    setInspectionReports(updated);
    localStorage.setItem(STORAGE_KEY_INSPECTIONS, JSON.stringify(updated));
    logActivity('SUBMIT_INSPECTION', `Inspection report submitted for vehicle: ${report.vehicleId}`);
  }, [inspectionReports]);

  const reportIncident = useCallback((incident: Omit<Incident, 'id' | 'submittedAt' | 'status' | 'approvedBy'>) => {
    const newIncident: Incident = {
      ...incident,
      id: `inc_${nanoid()}`,
      status: 'reported',
      approvedBy: null,
      submittedAt: new Date().toISOString(),
    };
    const updated = [...incidents, newIncident];
    setIncidents(updated);
    localStorage.setItem(STORAGE_KEY_INCIDENTS, JSON.stringify(updated));
    logActivity('REPORT_INCIDENT', `Incident reported: ${incident.type}`);
  }, [incidents]);

  const approveIncident = useCallback((incidentId: string, approverId: string) => {
    const updated = incidents.map(i =>
      i.id === incidentId ? { ...i, status: 'reviewed' as const, approvedBy: approverId } : i
    );
    setIncidents(updated);
    localStorage.setItem(STORAGE_KEY_INCIDENTS, JSON.stringify(updated));
    logActivity('APPROVE_INCIDENT', `Incident reviewed: ${incidentId}`);
  }, [incidents]);

  const deleteIncident = useCallback((incidentId: string) => {
    const updated = incidents.filter(i => i.id !== incidentId);
    setIncidents(updated);
    localStorage.setItem(STORAGE_KEY_INCIDENTS, JSON.stringify(updated));
    logActivity('DELETE_INCIDENT', `Incident deleted: ${incidentId}`);
  }, [incidents]);

  return (
    <DataContext.Provider
      value={{
        vehicles,
        drivers,
        maintenance,
        trips,
        inspectionReports,
        incidents,
        addVehicle,
        updateVehicle,
        deleteVehicle,
        addDriver,
        updateDriver,
        deleteDriver,
        addMaintenanceRecord,
        deleteMaintenanceRecord,
        getMaintenanceForVehicle,
        startTrip,
        endTrip,
        getActiveTrips,
        submitInspectionReport,
        reportIncident,
        approveIncident,
        deleteIncident,
        isLoading,
      }}
    >
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
}
