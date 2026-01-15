
import React from 'react';
import { Chemical, PhysicalState, UserRole } from './types';

export const CATEGORIES = [
  'Acids', 'Bases', 'Oxidizers', 'Flammables', 'Toxics', 'Reagents', 'Solvents', 'Others'
];

export const UNITS = ['mg', 'g', 'kg', 'ml', 'L', 'unit'];

export const INITIAL_CHEMICALS: Chemical[] = [
  {
    id: '1',
    code: 'CH-001',
    name: 'Acetone',
    formula: 'C3H6O',
    casNumber: '67-64-1',
    category: 'Solvents',
    state: PhysicalState.LIQUID,
    hazardGHS: ['Flammable', 'Irritant'],
    nfpa: { health: 1, flammability: 3, instability: 0 },
    stock: 25,
    unit: 'L',
    location: 'Cabinet A-02',
    entryDate: '2023-12-01',
    expiryDate: '2025-12-01',
    supplier: 'Sigma-Aldrich',
    sdsUrl: 'https://example.com/sds/acetone'
  },
  {
    id: '2',
    code: 'CH-002',
    name: 'Sulfuric Acid',
    formula: 'H2SO4',
    casNumber: '7664-93-9',
    category: 'Acids',
    state: PhysicalState.LIQUID,
    hazardGHS: ['Corrosive'],
    nfpa: { health: 3, flammability: 0, instability: 2, special: 'W' },
    stock: 5,
    unit: 'L',
    location: 'Acid Cabinet 01',
    entryDate: '2024-01-15',
    expiryDate: '2024-12-30',
    supplier: 'Merck',
    sdsUrl: 'https://example.com/sds/h2so4'
  },
  {
    id: '3',
    code: 'CH-003',
    name: 'Sodium Hydroxide',
    formula: 'NaOH',
    casNumber: '1310-73-2',
    category: 'Bases',
    state: PhysicalState.SOLID,
    hazardGHS: ['Corrosive'],
    nfpa: { health: 3, flammability: 0, instability: 1 },
    stock: 2,
    unit: 'kg',
    location: 'Base Shelf 03',
    entryDate: '2023-11-10',
    expiryDate: '2026-11-10',
    supplier: 'Fisher Scientific',
    sdsUrl: 'https://example.com/sds/naoh'
  }
];
