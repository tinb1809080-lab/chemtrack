
import { Chemical, PhysicalState } from './types';

export const CATEGORIES = [
  'Axit', 'Bazơ', 'Chất oxi hóa', 'Chất dễ cháy', 'Độc hại', 'Thuốc thử', 'Dung môi', 'Khác'
];

export const UNITS = ['mg', 'g', 'kg', 'ml', 'L', 'chai', 'ống'];

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
    location: 'Tủ A-02',
    supplier: 'Sigma-Aldrich',
    defaultPaoDays: 180,
    // Fix: Added missing required property minThreshold
    minThreshold: 5,
    lots: [
      {
        id: 'lot-101',
        mfgLotNumber: 'M-ACT-2023',
        lotNumber: 'ACT2305-A',
        quantity: 10,
        unit: 'L',
        entryDate: '2023-05-15',
        expiryDate: '2025-05-01',
        status: 'RESERVED'
      },
      {
        id: 'lot-102',
        mfgLotNumber: 'M-ACT-2024',
        lotNumber: 'ACT2401-B',
        quantity: 5,
        unit: 'L',
        entryDate: '2024-01-10',
        expiryDate: '2026-01-15',
        openedDate: '2024-02-01',
        paoDays: 180,
        status: 'IN_USE'
      }
    ]
  },
  {
    id: '2',
    code: 'CH-002',
    name: 'Axit Sulfuric',
    formula: 'H2SO4',
    casNumber: '7664-93-9',
    category: 'Axit',
    state: PhysicalState.LIQUID,
    hazardGHS: ['Ăn mòn'],
    nfpa: { health: 3, flammability: 0, instability: 2, special: 'W' },
    location: 'Tủ Axit 01',
    supplier: 'Merck',
    defaultPaoDays: 90,
    // Fix: Added missing required property minThreshold
    minThreshold: 2,
    lots: [
      {
        id: 'lot-201',
        mfgLotNumber: 'BASF-9982',
        lotNumber: 'SUL-9982',
        quantity: 2,
        unit: 'L',
        entryDate: '2023-11-20',
        expiryDate: '2024-12-30',
        status: 'RESERVED'
      }
    ]
  }
];
