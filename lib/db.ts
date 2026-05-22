// SQLite database initialization with sql.js
import initSqlJs, { Database as SqlJsDatabase } from 'sql.js';

export interface DatabaseSchema {
  users: {
    id: string;
    email: string;
    password: string;
    role: 'admin' | 'fleet_manager' | 'driver';
    status: 'active' | 'suspended';
    createdAt: string;
  };
  vehicles: {
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
  };
  drivers: {
    id: string;
    userId: string;
    name: string;
    licenseNumber: string;
    contactNumber: string;
    assignedVehicleId: string | null;
    status: 'active' | 'inactive' | 'on_leave';
    createdAt: string;
    updatedAt: string;
  };
  trips: {
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
  };
  inspectionReports: {
    id: string;
    tripId: string;
    driverId: string;
    vehicleId: string;
    type: 'pre_trip' | 'post_trip';
    status: 'good' | 'minor_issue' | 'major_issue';
    notes: string;
    submittedAt: string;
  };
  incidents: {
    id: string;
    driverId: string;
    vehicleId: string;
    type: 'damage' | 'accident' | 'fuel_issue' | 'mechanical' | 'other';
    severity: 'low' | 'medium' | 'high';
    description: string;
    status: 'reported' | 'reviewed' | 'resolved';
    approvedBy: string | null;
    submittedAt: string;
  };
  maintenanceRecords: {
    id: string;
    vehicleId: string;
    type: 'oil_change' | 'tire_repair' | 'inspection' | 'repair' | 'other';
    date: string;
    cost: number;
    notes: string;
    createdAt: string;
  };
  activityLog: {
    id: string;
    userId: string;
    action: string;
    description: string;
    timestamp: string;
  };
}

let dbInstance: SqlJsDatabase | null = null;
let SQL: any = null;

export async function initDB() {
  if (dbInstance && SQL) {
    return { db: dbInstance, SQL };
  }

  try {
    SQL = await initSqlJs();
  } catch (e) {
    console.error('[v0] Failed to initialize sql.js:', e);
    throw new Error('Failed to initialize database');
  }
  
  // Try to load from localStorage
  const savedDb = typeof window !== 'undefined' ? localStorage.getItem('group4fvms_db') : null;
  
  if (savedDb) {
    try {
      const data = JSON.parse(savedDb);
      dbInstance = new SQL.Database(new Uint8Array(data));
    } catch (e) {
      console.error('[v0] Failed to load database from localStorage:', e);
      // If loading fails, create a new database
      dbInstance = new SQL.Database();
      createSchema();
    }
  } else {
    dbInstance = new SQL.Database();
    createSchema();
    seedDatabase();
  }
  
  return { db: dbInstance, SQL };
}

function createSchema() {
  if (!dbInstance) return;

  // Users table
  dbInstance.run(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'active',
      createdAt TEXT NOT NULL
    )
  `);

  // Vehicles table
  dbInstance.run(`
    CREATE TABLE IF NOT EXISTS vehicles (
      id TEXT PRIMARY KEY,
      vehicleId TEXT UNIQUE NOT NULL,
      plateNumber TEXT UNIQUE NOT NULL,
      model TEXT NOT NULL,
      brand TEXT NOT NULL,
      year INTEGER NOT NULL,
      status TEXT NOT NULL,
      fuelConsumption REAL NOT NULL DEFAULT 0,
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL
    )
  `);

  // Drivers table
  dbInstance.run(`
    CREATE TABLE IF NOT EXISTS drivers (
      id TEXT PRIMARY KEY,
      userId TEXT NOT NULL UNIQUE,
      name TEXT NOT NULL,
      licenseNumber TEXT UNIQUE NOT NULL,
      contactNumber TEXT NOT NULL,
      assignedVehicleId TEXT,
      status TEXT NOT NULL,
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL
    )
  `);

  // Trips table
  dbInstance.run(`
    CREATE TABLE IF NOT EXISTS trips (
      id TEXT PRIMARY KEY,
      driverId TEXT NOT NULL,
      vehicleId TEXT NOT NULL,
      startTime TEXT NOT NULL,
      endTime TEXT,
      status TEXT NOT NULL,
      fuelStart REAL NOT NULL,
      fuelEnd REAL,
      distanceTraveled REAL,
      createdAt TEXT NOT NULL
    )
  `);

  // Inspection Reports table
  dbInstance.run(`
    CREATE TABLE IF NOT EXISTS inspectionReports (
      id TEXT PRIMARY KEY,
      tripId TEXT NOT NULL,
      driverId TEXT NOT NULL,
      vehicleId TEXT NOT NULL,
      type TEXT NOT NULL,
      status TEXT NOT NULL,
      notes TEXT,
      submittedAt TEXT NOT NULL
    )
  `);

  // Incidents table
  dbInstance.run(`
    CREATE TABLE IF NOT EXISTS incidents (
      id TEXT PRIMARY KEY,
      driverId TEXT NOT NULL,
      vehicleId TEXT NOT NULL,
      type TEXT NOT NULL,
      severity TEXT NOT NULL,
      description TEXT NOT NULL,
      status TEXT NOT NULL,
      approvedBy TEXT,
      submittedAt TEXT NOT NULL
    )
  `);

  // Maintenance records table
  dbInstance.run(`
    CREATE TABLE IF NOT EXISTS maintenanceRecords (
      id TEXT PRIMARY KEY,
      vehicleId TEXT NOT NULL,
      type TEXT NOT NULL,
      date TEXT NOT NULL,
      cost REAL NOT NULL,
      notes TEXT,
      createdAt TEXT NOT NULL
    )
  `);

  // Activity log table
  dbInstance.run(`
    CREATE TABLE IF NOT EXISTS activityLog (
      id TEXT PRIMARY KEY,
      userId TEXT NOT NULL,
      action TEXT NOT NULL,
      description TEXT NOT NULL,
      timestamp TEXT NOT NULL
    )
  `);
}

function seedDatabase() {
  if (!dbInstance) return;

  // Seed admin user (password: admin123)
  dbInstance.run(`
    INSERT INTO users (id, email, password, role, createdAt)
    VALUES ('usr_1', 'admin@group4fvms.com', 'hashed_admin123', 'admin', datetime('now'))
  `);

  // Seed fleet manager user
  dbInstance.run(`
    INSERT INTO users (id, email, password, role, createdAt)
    VALUES ('usr_2', 'manager@group4fvms.com', 'hashed_manager123', 'fleet_manager', datetime('now'))
  `);

  // Seed driver user (password: driver123)
  dbInstance.run(`
    INSERT INTO users (id, email, password, role, createdAt)
    VALUES ('usr_3', 'driver@group4fvms.com', 'hashed_driver123', 'driver', datetime('now'))
  `);

  // Seed vehicles
  const vehicles = [
    { id: 'veh_1', vehicleId: 'FL-001', plateNumber: 'ABC-123', model: 'F-150', brand: 'Ford', year: 2022, status: 'active' },
    { id: 'veh_2', vehicleId: 'FL-002', plateNumber: 'DEF-456', model: 'Sprinter', brand: 'Mercedes', year: 2021, status: 'active' },
    { id: 'veh_3', vehicleId: 'FL-003', plateNumber: 'GHI-789', model: 'ProMaster', brand: 'Nissan', year: 2020, status: 'maintenance' },
    { id: 'veh_4', vehicleId: 'FL-004', plateNumber: 'JKL-012', model: 'Transit', brand: 'Ford', year: 2019, status: 'active' },
    { id: 'veh_5', vehicleId: 'FL-005', plateNumber: 'MNO-345', model: 'Citroën Jumper', brand: 'Citroën', year: 2021, status: 'inactive' },
  ];

  vehicles.forEach(v => {
    dbInstance?.run(
      `INSERT INTO vehicles (id, vehicleId, plateNumber, model, brand, year, status, createdAt, updatedAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))`,
      [v.id, v.vehicleId, v.plateNumber, v.model, v.brand, v.year, v.status]
    );
  });

  // Seed drivers
  const drivers = [
    { id: 'drv_1', name: 'John Smith', licenseNumber: 'DL123456', contactNumber: '+1-555-0101', assignedVehicleId: 'veh_1', status: 'active' },
    { id: 'drv_2', name: 'Sarah Johnson', licenseNumber: 'DL123457', contactNumber: '+1-555-0102', assignedVehicleId: 'veh_2', status: 'active' },
    { id: 'drv_3', name: 'Michael Brown', licenseNumber: 'DL123458', contactNumber: '+1-555-0103', assignedVehicleId: null, status: 'on_leave' },
    { id: 'drv_4', name: 'Emily Davis', licenseNumber: 'DL123459', contactNumber: '+1-555-0104', assignedVehicleId: 'veh_4', status: 'active' },
  ];

  drivers.forEach(d => {
    dbInstance?.run(
      `INSERT INTO drivers (id, name, licenseNumber, contactNumber, assignedVehicleId, status, createdAt, updatedAt)
       VALUES (?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))`,
      [d.id, d.name, d.licenseNumber, d.contactNumber, d.assignedVehicleId, d.status]
    );
  });

  // Seed maintenance records
  const maintenance = [
    { id: 'mnt_1', vehicleId: 'veh_1', type: 'oil_change', date: '2024-01-15', cost: 150, notes: 'Regular oil change and filter replacement' },
    { id: 'mnt_2', vehicleId: 'veh_2', type: 'tire_repair', date: '2024-01-20', cost: 250, notes: 'Flat tire repair' },
    { id: 'mnt_3', vehicleId: 'veh_3', type: 'inspection', date: '2024-02-01', cost: 100, notes: 'Annual inspection' },
    { id: 'mnt_4', vehicleId: 'veh_1', type: 'repair', date: '2024-02-10', cost: 500, notes: 'Brake system repair' },
  ];

  maintenance.forEach(m => {
    dbInstance?.run(
      `INSERT INTO maintenanceRecords (id, vehicleId, type, date, cost, notes, createdAt)
       VALUES (?, ?, ?, ?, ?, ?, datetime('now'))`,
      [m.id, m.vehicleId, m.type, m.date, m.cost, m.notes]
    );
  });
}

export function saveDB() {
  if (dbInstance && typeof window !== 'undefined') {
    const data = dbInstance.export();
    const arr = Array.from(data);
    localStorage.setItem('group4fvms_db', JSON.stringify(arr));
  }
}

export async function queryDB(sql: string, params: any[] = []) {
  const { db } = await initDB();
  try {
    const stmt = db.prepare(sql);
    stmt.bind(params);
    const results: any[] = [];
    while (stmt.step()) {
      results.push(stmt.getAsObject());
    }
    stmt.free();
    return results;
  } catch (e) {
    console.error('DB Query Error:', e);
    return [];
  }
}

export async function execDB(sql: string, params: any[] = []) {
  const { db } = await initDB();
  try {
    if (params.length > 0) {
      const stmt = db.prepare(sql);
      stmt.bind(params);
      stmt.step();
      stmt.free();
    } else {
      db.run(sql);
    }
    saveDB();
    return true;
  } catch (e) {
    console.error('DB Exec Error:', e);
    return false;
  }
}

export function getDbInstance() {
  return dbInstance;
}
