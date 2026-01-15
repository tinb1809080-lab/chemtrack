
export enum UserRole {
  ADMIN = 'ADMIN',
  STAFF = 'STAFF',
  VIEWER = 'VIEWER'
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
  mfgLotNumber: string;   // Số lô NSX (Manufacturer Lot)
  lotNumber: string;      // Số lô nội bộ (Internal Tracking Lot)
  quantity: number;       // Số lượng hiện tại
  unit: string;
  entryDate: string;      // Ngày nhập kho
  expiryDate: string;     // Ngày hết hạn
  openedDate?: string;    // Ngày mở nắp
  lastUsedDate?: string;  // Ngày dùng gần nhất
  paoDays?: number;       // Số ngày sử dụng sau khi mở
  status: 'RESERVED' | 'IN_USE' | 'EXPIRED' | 'CONSUMED' | 'DISPOSED';
}

export interface Chemical {
  id: string;
  code: string;           // Mã hóa chất
  name: string;           // Tên hóa chất
  formula: string;        // Công thức hóa học
  casNumber: string;      // CAS Number
  category: string;       // Nhóm/loại hóa chất
  state: PhysicalState;   // Trạng thái
  hazardGHS: string[];    // GHS Tags
  nfpa: NFPARating;       // NFPA 704
  lots: ChemicalLot[];    // Danh sách các lô
  location: string;       // Vị trí lưu trữ
  supplier: string;       // Nhà cung cấp
  defaultPaoDays: number;
  minThreshold: number;   // Ngưỡng tồn kho tối thiểu để báo động
  sdsUrl?: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  action: 'CREATE' | 'UPDATE' | 'DELETE' | 'OPEN_LOT' | 'LOT_USAGE' | 'LOT_STOCK_IN' | 'ADD_LOT' | 'STATUS_CHANGE' | 'CONSUME_ALL';
  entityId: string;
  chemicalName?: string;  // Tên hóa chất liên quan
  lotNumber?: string;     // Số lô liên quan
  amount?: number;        // Lượng thay đổi
  unit?: string;          // Đơn vị
  details: string;
}
