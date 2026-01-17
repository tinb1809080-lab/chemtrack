
export enum UserRole {
  ADMIN = 'ADMIN',
  STAFF = 'STAFF',
  VIEWER = 'VIEWER'
}

export interface User {
  id: string;
  username: string;
  fullName: string;
  email: string; 
  password?: string; 
  role: UserRole;
  avatar?: string;
}

export enum PhysicalState {
  SOLID = 'Rắn',
  LIQUID = 'Lỏng',
  GAS = 'Khí'
}

export interface NFPARating {
  health: number;
  flammability: number;
  instability: number;
  special?: string;
}

export interface ChemicalLot {
  id: string;
  mfgLotNumber: string;
  lotNumber: string;
  packaging: string; 
  containerCapacity: number; // Dung tích/Khối lượng mỗi chai/thùng
  quantity: number; // Tổng lượng tồn kho
  unit: string;
  entryDate: string;
  expiryDate: string;
  openedDate?: string;
  lastUsedDate?: string;
  paoDays?: number;
  bottleOpeningDates?: {[key: number]: string}; // Ngày mở cho từng chai (index 0, 1, 2...)
  status: 'RESERVED' | 'IN_USE' | 'EXPIRED' | 'CONSUMED' | 'DISPOSED';
}

export interface Chemical {
  id: string;
  code: string;
  name: string;
  formula: string;
  casNumber: string;
  category: string;
  state: PhysicalState;
  hazardGHS: string[];
  nfpa: NFPARating;
  lots: ChemicalLot[];
  location: string;
  supplier: string;
  defaultPaoDays: number;
  minThreshold: number;
  sdsUrl?: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  action: 'CREATE' | 'UPDATE' | 'DELETE' | 'OPEN_LOT' | 'LOT_USAGE' | 'LOT_STOCK_IN' | 'ADD_LOT' | 'STATUS_CHANGE' | 'CONSUME_ALL' | 'UPDATE_DATES';
  entityId: string;
  chemicalName?: string;
  lotNumber?: string;
  amount?: number;
  unit?: string;
  details: string;
}
