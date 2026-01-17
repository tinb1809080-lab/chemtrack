
import { Chemical, PhysicalState } from './types';

export const CATEGORIES = [
  'Axit', 'Bazơ', 'Chất oxi hóa', 'Chất dễ cháy', 'Độc hại', 'Thuốc thử', 'Dung môi', 'Khác'
];

// Phân loại đơn vị để người dùng dễ chọn lựa
export const UNIT_GROUPS = {
  MEASUREMENT: ['ml', 'L', 'g', 'kg', 'mg', 'test', 'viên'],
  PACKAGING: ['chai', 'lọ', 'ống', 'túi', 'gói', 'hộp', 'thùng', 'bình', 'can']
};

export const UNITS = [...UNIT_GROUPS.MEASUREMENT, ...UNIT_GROUPS.PACKAGING];

export const INITIAL_CHEMICALS: Chemical[] = [
  {
    id: '1',
    code: 'CH-001',
    name: 'Acetone',
    formula: 'C3H6O',
    casNumber: '67-64-1',
    category: 'Dung môi',
    state: PhysicalState.LIQUID,
    hazardGHS: ['Dễ cháy', 'Kích ứng'],
    nfpa: { health: 1, flammability: 3, instability: 0 },
    location: 'N.1',
    supplier: 'Sigma-Aldrich',
    defaultPaoDays: 180,
    minThreshold: 500, // Cảnh báo khi dưới 500ml (1 chai)
    lots: [
      {
        id: 'lot-101',
        mfgLotNumber: 'M-ACT-2023',
        lotNumber: 'ACT2305-A',
        packaging: 'chai',
        containerCapacity: 500, // 500ml mỗi chai
        quantity: 2500, // 5 chai * 500ml = 2500ml
        unit: 'ml',
        entryDate: '2023-05-15',
        expiryDate: '2025-05-01',
        status: 'RESERVED'
      }
    ]
  }
];
