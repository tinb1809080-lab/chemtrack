
export enum UserRole {
  ADMIN = 'ADMIN',
  STAFF = 'STAFF',
  VIEWER = 'VIEWER'
}

export enum PhysicalState {
  SOLID = 'Solid',
  LIQUID = 'Liquid',
  GAS = 'Gas'
}

export interface NFPARating {
  health: number;       // 0-4
  flammability: number; // 0-4
  instability: number;  // 0-4
  special?: string;     // OX, SA, W, etc.
}

export interface Chemical {
  id: string;
  code: string;
  name: string;
  formula: string;
  casNumber: string;
  category: string;
  state: PhysicalState;
  hazardGHS: string[]; // List of pictograms or categories
  nfpa: NFPARating;
  stock: number;
  unit: string;
  location: string;
  entryDate: string;
  expiryDate: string;
  supplier: string;
  sdsUrl?: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  action: 'CREATE' | 'UPDATE' | 'DELETE' | 'STOCK_IN' | 'STOCK_OUT';
  entityId: string;
  details: string;
}

export interface Transaction {
  id: string;
  chemicalId: string;
  type: 'IN' | 'OUT';
  quantity: number;
  date: string;
  performedBy: string;
  reason: string;
}
