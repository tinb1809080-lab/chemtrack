
import { PhysicalState, NFPARating } from '../types';

export interface CatalogEntry {
  formula: string;
  casNumber: string;
  state: PhysicalState;
  nfpa: NFPARating;
  category: string;
  location: string;
  packaging?: string; // Thêm gợi ý quy cách
}

export const CHEMICAL_CATALOG: Record<string, CatalogEntry> = {
  "Methanol": {
    formula: "CH₃OH",
    casNumber: "67-56-1",
    state: PhysicalState.LIQUID,
    category: "Dung môi",
    nfpa: { health: 1, flammability: 3, instability: 0 },
    location: "O.1",
    packaging: "2.5L/chai"
  },
  "Ethanol absolute": {
    formula: "C₂H₅OH",
    casNumber: "64-17-5",
    state: PhysicalState.LIQUID,
    category: "Dung môi",
    nfpa: { health: 2, flammability: 3, instability: 0 },
    location: "O.2",
    packaging: "2.5L/chai"
  },
  "Ethanol 96%": {
    formula: "C₂H₅OH",
    casNumber: "64-17-5",
    state: PhysicalState.LIQUID,
    category: "Dung môi",
    nfpa: { health: 2, flammability: 3, instability: 0 },
    location: "Pallet ethanol",
    packaging: "2.5L/chai"
  },
  "Acetone": {
    formula: "C₃H₆O",
    casNumber: "67-64-1",
    state: PhysicalState.LIQUID,
    category: "Dung môi",
    nfpa: { health: 1, flammability: 3, instability: 0 },
    location: "N.1",
    packaging: "2.5L/chai"
  },
  "Acetonitrile": {
    formula: "C₂H₃N",
    casNumber: "75-05-8",
    state: PhysicalState.LIQUID,
    category: "Dung môi",
    nfpa: { health: 2, flammability: 3, instability: 0 },
    location: "N.2",
    packaging: "2.5L/chai"
  },
  "Isopropanol (2-Propanol)": {
    formula: "C₃H₈O",
    casNumber: "67-63-0",
    state: PhysicalState.LIQUID,
    category: "Dung môi",
    nfpa: { health: 1, flammability: 3, instability: 0 },
    location: "N.3",
    packaging: "2.5L/chai"
  },
  "n-Hexane": {
    formula: "C₆H₁₄",
    casNumber: "110-54-3",
    state: PhysicalState.LIQUID,
    category: "Dung môi",
    nfpa: { health: 2, flammability: 3, instability: 0 },
    location: "N.7",
    packaging: "2.5L/chai"
  },
  "n-Heptane": {
    formula: "C₇H₁₆",
    casNumber: "142-82-5",
    state: PhysicalState.LIQUID,
    category: "Dung môi",
    nfpa: { health: 1, flammability: 3, instability: 0 },
    location: "M.8",
    packaging: "2.5L/chai"
  },
  "Cyclohexane": {
    formula: "C₆H₁₂",
    casNumber: "110-82-7",
    state: PhysicalState.LIQUID,
    category: "Dung môi",
    nfpa: { health: 2, flammability: 3, instability: 0 },
    location: "N.10",
    packaging: "2.5L/chai"
  },
  "Toluene": {
    formula: "C₇H₈",
    casNumber: "108-88-3",
    state: PhysicalState.LIQUID,
    category: "Dung môi",
    nfpa: { health: 2, flammability: 3, instability: 0 },
    location: "N.8",
    packaging: "2.5L/chai"
  },
  "Chloroform": {
    formula: "CHCl₃",
    casNumber: "67-66-3",
    state: PhysicalState.LIQUID,
    category: "Dung môi",
    nfpa: { health: 2, flammability: 0, instability: 0 },
    location: "N.4",
    packaging: "2.5L/chai"
  },
  "Dichloromethane": {
    formula: "CH₂Cl₂",
    casNumber: "75-09-2",
    state: PhysicalState.LIQUID,
    category: "Dung môi",
    nfpa: { health: 2, flammability: 1, instability: 0 },
    location: "N.10",
    packaging: "2.5L/chai"
  },
  "1-Butanol": {
    formula: "C₄H₁₀O",
    casNumber: "71-36-3",
    state: PhysicalState.LIQUID,
    category: "Dung môi",
    nfpa: { health: 2, flammability: 3, instability: 0 },
    location: "M.10",
    packaging: "2.5L/chai"
  },
  "1-Pentanol": {
    formula: "C₅H₁₂O",
    casNumber: "71-41-0",
    state: PhysicalState.LIQUID,
    category: "Dung môi",
    nfpa: { health: 2, flammability: 3, instability: 0 },
    location: "M.31",
    packaging: "2.5L/chai"
  },
  "Isoamyl alcohol": {
    formula: "C₅H₁₂O",
    casNumber: "123-51-3",
    state: PhysicalState.LIQUID,
    category: "Dung môi",
    nfpa: { health: 2, flammability: 3, instability: 0 },
    location: "M.32",
    packaging: "2.5L/chai"
  },
  "Isobutanol": {
    formula: "C₄H₁₀O",
    casNumber: "78-83-1",
    state: PhysicalState.LIQUID,
    category: "Dung môi",
    nfpa: { health: 2, flammability: 3, instability: 0 },
    location: "M.24",
    packaging: "2.5L/chai"
  },
  "Tert-Butanol": {
    formula: "C₄H₁₀O",
    casNumber: "75-65-0",
    state: PhysicalState.LIQUID,
    category: "Dung môi",
    nfpa: { health: 1, flammability: 3, instability: 0 },
    location: "N.14",
    packaging: "2.5L/chai"
  },
  "Diethyl ether": {
    formula: "C₄H₁₀O",
    casNumber: "60-29-7",
    state: PhysicalState.LIQUID,
    category: "Dung môi",
    nfpa: { health: 2, flammability: 4, instability: 1 },
    location: "N.11",
    packaging: "2.5L/chai"
  },
  "Tetrahydrofuran (THF)": {
    formula: "C₄H₈O",
    casNumber: "109-99-9",
    state: PhysicalState.LIQUID,
    category: "Dung môi",
    nfpa: { health: 2, flammability: 3, instability: 1 },
    location: "N.13",
    packaging: "2.5L/chai"
  },
  "Ethyl acetate": {
    formula: "C₄H₈O₂",
    casNumber: "141-78-6",
    state: PhysicalState.LIQUID,
    category: "Dung môi",
    nfpa: { health: 1, flammability: 3, instability: 0 },
    location: "N.12",
    packaging: "2.5L/chai"
  },
  "n-Butyl acetate": {
    formula: "C₆H₁₂O₂",
    casNumber: "123-86-4",
    state: PhysicalState.LIQUID,
    category: "Dung môi",
    nfpa: { health: 2, flammability: 3, instability: 0 },
    location: "M.11",
    packaging: "2.5L/chai"
  },
  "Isopropyl acetate": {
    formula: "C₅H₁₀O₂",
    casNumber: "108-21-4",
    state: PhysicalState.LIQUID,
    category: "Dung môi",
    nfpa: { health: 2, flammability: 3, instability: 0 },
    location: "M.34",
    packaging: "2.5L/chai"
  },
  "Ethyl formate": {
    formula: "C₃H₆O₂",
    casNumber: "109-94-4",
    state: PhysicalState.LIQUID,
    category: "Dung môi",
    nfpa: { health: 2, flammability: 3, instability: 0 },
    location: "N.29",
    packaging: "2.5L/chai"
  },
  "Methyl benzoate": {
    formula: "C₈H₈O₂",
    casNumber: "93-58-3",
    state: PhysicalState.LIQUID,
    category: "Dung môi",
    nfpa: { health: 1, flammability: 2, instability: 0 },
    location: "M.4",
    packaging: "2.5L/chai"
  },
  "Ethylene glycol": {
    formula: "C₂H₆O₂",
    casNumber: "107-21-1",
    state: PhysicalState.LIQUID,
    category: "Dung môi",
    nfpa: { health: 2, flammability: 1, instability: 0 },
    location: "M.18",
    packaging: "2.5L/chai"
  },
  "Propylene glycol": {
    formula: "C₃H₈O₂",
    casNumber: "57-55-6",
    state: PhysicalState.LIQUID,
    category: "Dung môi",
    nfpa: { health: 1, flammability: 1, instability: 0 },
    location: "M.25",
    packaging: "2.5L/chai"
  },
  "Polyethylene glycol 200": {
    formula: "(C₂H₄O)n",
    casNumber: "25322-68-3",
    state: PhysicalState.LIQUID,
    category: "Dung môi",
    nfpa: { health: 1, flammability: 1, instability: 0 },
    location: "N.24",
    packaging: "2.5L/chai"
  },
  "n-Pentane": {
    formula: "C₅H₁₂",
    casNumber: "109-66-0",
    state: PhysicalState.LIQUID,
    category: "Dung môi",
    nfpa: { health: 1, flammability: 4, instability: 0 },
    location: "B.2",
    packaging: "2.5L/chai"
  },
  "n-Octane": {
    formula: "C₈H₁₈",
    casNumber: "111-65-9",
    state: PhysicalState.LIQUID,
    category: "Dung môi",
    nfpa: { health: 1, flammability: 3, instability: 0 },
    location: "B.2",
    packaging: "2.5L/chai"
  },
  "Isooctane (2,2,4-Trimethylpentane)": {
    formula: "C₈H₁₈",
    casNumber: "540-84-1",
    state: PhysicalState.LIQUID,
    category: "Dung môi",
    nfpa: { health: 1, flammability: 3, instability: 0 },
    location: "M.35",
    packaging: "2.5L/chai"
  },
  "Petroleum ether (40–60°C)": {
    formula: "Hydrocarbon",
    casNumber: "64742-49-0",
    state: PhysicalState.LIQUID,
    category: "Dung môi",
    nfpa: { health: 1, flammability: 4, instability: 0 },
    location: "M.38",
    packaging: "2.5L/chai"
  },
  "Petroleum ether (100–120°C)": {
    formula: "Hydrocarbon",
    casNumber: "64742-48-9",
    state: PhysicalState.LIQUID,
    category: "Dung môi",
    nfpa: { health: 1, flammability: 3, instability: 0 },
    location: "M.39",
    packaging: "2.5L/chai"
  },
  "Paraffin liquid": {
    formula: "Hydrocarbon",
    casNumber: "8042-47-5",
    state: PhysicalState.LIQUID,
    category: "Dung môi",
    nfpa: { health: 1, flammability: 1, instability: 0 },
    location: "M.27",
    packaging: "2.5L/chai"
  },
  "Squalane": {
    formula: "C₃₀H₆₂",
    casNumber: "111-01-3",
    state: PhysicalState.LIQUID,
    category: "Dung môi",
    nfpa: { health: 1, flammability: 1, instability: 0 },
    location: "M.9",
    packaging: "2.5L/chai"
  },
  "Soybean oil": {
    formula: "Triglyceride",
    casNumber: "8001-22-7",
    state: PhysicalState.LIQUID,
    category: "Dung môi",
    nfpa: { health: 1, flammability: 1, instability: 0 },
    location: "M.9",
    packaging: "2.5L/chai"
  },
  "Acetaldehyde": {
    formula: "C₂H₄O",
    casNumber: "75-07-0",
    state: PhysicalState.LIQUID,
    category: "Thuốc thử",
    nfpa: { health: 2, flammability: 4, instability: 2 },
    location: "Tủ lạnh",
    packaging: "500ml/chai"
  },
  "2-Pentanone": {
    formula: "C₅H₁₀O",
    casNumber: "107-87-9",
    state: PhysicalState.LIQUID,
    category: "Dung môi",
    nfpa: { health: 2, flammability: 3, instability: 0 },
    location: "M.33",
    packaging: "2.5L/chai"
  },
  "Methyl isobutyl ketone": {
    formula: "C₆H₁₂O",
    casNumber: "108-10-1",
    state: PhysicalState.LIQUID,
    category: "Dung môi",
    nfpa: { health: 2, flammability: 3, instability: 0 },
    location: "M.28",
    packaging: "2.5L/chai"
  },
  "Benzaldehyde": {
    formula: "C₇H₆O",
    casNumber: "100-52-7",
    state: PhysicalState.LIQUID,
    category: "Thuốc thử",
    nfpa: { health: 2, flammability: 2, instability: 0 },
    location: "M.5",
    packaging: "500ml/chai"
  },
  "Salicylaldehyde": {
    formula: "C₇H₆O₂",
    casNumber: "90-02-8",
    state: PhysicalState.LIQUID,
    category: "Thuốc thử",
    nfpa: { health: 2, flammability: 2, instability: 0 },
    location: "M.12",
    packaging: "500ml/chai"
  },
  "4-Methoxybenzaldehyde": {
    formula: "C₈H₈O₂",
    casNumber: "123-11-5",
    state: PhysicalState.SOLID,
    category: "Thuốc thử",
    nfpa: { health: 2, flammability: 1, instability: 0 },
    location: "M.6",
    packaging: "100g/chai"
  },
  "Formaldehyde 37%": {
    formula: "CH₂O",
    casNumber: "50-00-0",
    state: PhysicalState.LIQUID,
    category: "Thuốc thử",
    nfpa: { health: 3, flammability: 2, instability: 0 },
    location: "M.30",
    packaging: "2.5L/chai"
  },
  "Formamide": {
    formula: "CH₃NO",
    casNumber: "75-12-7",
    state: PhysicalState.LIQUID,
    category: "Dung môi",
    nfpa: { health: 2, flammability: 1, instability: 0 },
    location: "M.7",
    packaging: "2.5L/chai"
  },
  "N,N-Dimethylformamide (DMF)": {
    formula: "C₃H₇NO",
    casNumber: "68-12-2",
    state: PhysicalState.LIQUID,
    category: "Dung môi",
    nfpa: { health: 2, flammability: 2, instability: 0 },
    location: "M.37",
    packaging: "2.5L/chai"
  },
  "N,N-Dimethylacetamide (DMAc)": {
    formula: "C₄H₉NO",
    casNumber: "127-19-5",
    state: PhysicalState.LIQUID,
    category: "Dung môi",
    nfpa: { health: 2, flammability: 2, instability: 0 },
    location: "M.36",
    packaging: "2.5L/chai"
  },
  "Pyridine": {
    formula: "C₅H₅N",
    casNumber: "110-86-1",
    state: PhysicalState.LIQUID,
    category: "Dung môi",
    nfpa: { health: 2, flammability: 3, instability: 0 },
    location: "M.14",
    packaging: "2.5L/chai"
  },
  "Triethylamine": {
    formula: "C₆H₁₅N",
    casNumber: "121-44-8",
    state: PhysicalState.LIQUID,
    category: "Bazơ",
    nfpa: { health: 3, flammability: 3, instability: 0 },
    location: "M.16",
    packaging: "500ml/chai"
  },
  "Morpholine": {
    formula: "C₄H₉NO",
    casNumber: "110-91-8",
    state: PhysicalState.LIQUID,
    category: "Thuốc thử",
    nfpa: { health: 3, flammability: 2, instability: 0 },
    location: "M.15",
    packaging: "500ml/chai"
  },
  "Hydrochloric acid 37%": {
    formula: "HCl",
    casNumber: "7647-01-0",
    state: PhysicalState.LIQUID,
    category: "Axit",
    nfpa: { health: 3, flammability: 0, instability: 1, special: "COR" },
    location: "C.6",
    packaging: "2.5L/chai"
  },
  "Sulfuric acid 95–97%": {
    formula: "H₂SO₄",
    casNumber: "7664-93-9",
    state: PhysicalState.LIQUID,
    category: "Axit",
    nfpa: { health: 3, flammability: 0, instability: 2, special: "COR" },
    location: "C.4",
    packaging: "2.5L/chai"
  },
  "Nitric acid 65%": {
    formula: "HNO₃",
    casNumber: "7697-37-2",
    state: PhysicalState.LIQUID,
    category: "Axit",
    nfpa: { health: 3, flammability: 0, instability: 2, special: "OX COR" },
    location: "N.15",
    packaging: "2.5L/chai"
  },
  "Perchloric acid 70–72%": {
    formula: "HClO₄",
    casNumber: "7601-90-3",
    state: PhysicalState.LIQUID,
    category: "Axit",
    nfpa: { health: 3, flammability: 0, instability: 3, special: "OX COR" },
    location: "C.7",
    packaging: "500ml/chai"
  },
  "Hydrofluoric acid 48%": {
    formula: "HF",
    casNumber: "7664-39-3",
    state: PhysicalState.LIQUID,
    category: "Axit",
    nfpa: { health: 4, flammability: 0, instability: 1, special: "COR" },
    location: "C.3",
    packaging: "500ml/chai"
  },
  "Orthophosphoric acid 85%": {
    formula: "H₃PO₄",
    casNumber: "7664-38-2",
    state: PhysicalState.LIQUID,
    category: "Axit",
    nfpa: { health: 3, flammability: 0, instability: 1, special: "COR" },
    location: "C.4",
    packaging: "500ml/chai"
  },
  "Phosphorous acid": {
    formula: "H₃PO₃",
    casNumber: "13598-36-2",
    state: PhysicalState.SOLID,
    category: "Axit",
    nfpa: { health: 2, flammability: 0, instability: 1 },
    location: "P.21",
    packaging: "500g/chai"
  },
  "Hydriodic acid 57%": {
    formula: "HI",
    casNumber: "10034-85-2",
    state: PhysicalState.LIQUID,
    category: "Axit",
    nfpa: { health: 3, flammability: 0, instability: 1, special: "COR" },
    location: "D.3",
    packaging: "100ml/chai"
  },
  "Boric acid": {
    formula: "H₃BO₃",
    casNumber: "10043-35-3",
    state: PhysicalState.SOLID,
    category: "Axit",
    nfpa: { health: 1, flammability: 0, instability: 0 },
    location: "Q.28",
    packaging: "500g/chai"
  },
  "Trifluoroacetic acid": {
    formula: "C₂HF₃O₂",
    casNumber: "76-05-1",
    state: PhysicalState.LIQUID,
    category: "Axit",
    nfpa: { health: 3, flammability: 1, instability: 1, special: "COR" },
    location: "N.16",
    packaging: "500ml/chai"
  },
  "Acetic acid (glacial)": {
    formula: "C₂H₄O₂",
    casNumber: "64-19-7",
    state: PhysicalState.LIQUID,
    category: "Axit",
    nfpa: { health: 2, flammability: 2, instability: 0 },
    location: "N.20",
    packaging: "2.5L/chai"
  },
  "Formic acid": {
    formula: "CH₂O₂",
    casNumber: "64-18-6",
    state: PhysicalState.LIQUID,
    category: "Axit",
    nfpa: { health: 2, flammability: 2, instability: 0 },
    location: "N.19",
    packaging: "2.5L/chai"
  },
  "Oxalic acid dihydrate": {
    formula: "C₂H₂O₄·2H₂O",
    casNumber: "6153-56-6",
    state: PhysicalState.SOLID,
    category: "Axit",
    nfpa: { health: 2, flammability: 0, instability: 0 },
    location: "P.37",
    packaging: "500g/chai"
  },
  "Citric acid monohydrate": {
    formula: "C₆H₈O₇·H₂O",
    casNumber: "5949-29-1",
    state: PhysicalState.SOLID,
    category: "Axit",
    nfpa: { health: 1, flammability: 0, instability: 0 },
    location: "G.12",
    packaging: "500g/chai"
  },
  "Tartaric acid": {
    formula: "C₄H₆O₆",
    casNumber: "87-69-4",
    state: PhysicalState.SOLID,
    category: "Axit",
    nfpa: { health: 1, flammability: 0, instability: 0 },
    location: "E.4",
    packaging: "500g/chai"
  },
  "Adipic acid": {
    formula: "C₆H₁₀O₄",
    casNumber: "124-04-9",
    state: PhysicalState.SOLID,
    category: "Axit",
    nfpa: { health: 1, flammability: 0, instability: 0 },
    location: "P.22",
    packaging: "500g/chai"
  },
  "Glycolic acid": {
    formula: "C₂H₄O₃",
    casNumber: "79-14-1",
    state: PhysicalState.SOLID,
    category: "Axit",
    nfpa: { health: 2, flammability: 0, instability: 0 },
    location: "P.24",
    packaging: "500g/chai"
  },
  "Pyruvic acid": {
    formula: "C₃H₄O₃",
    casNumber: "127-17-3",
    state: PhysicalState.LIQUID,
    category: "Axit",
    nfpa: { health: 2, flammability: 1, instability: 0 },
    location: "N.18",
    packaging: "100ml/chai"
  },
  "Thioglycolic acid": {
    formula: "C₂H₄O₂S",
    casNumber: "68-11-1",
    state: PhysicalState.LIQUID,
    category: "Axit",
    nfpa: { health: 3, flammability: 2, instability: 1 },
    location: "N.17",
    packaging: "500ml/chai"
  },
  "Trichloroacetic acid": {
    formula: "C₂HCl₃O₂",
    casNumber: "76-03-9",
    state: PhysicalState.SOLID,
    category: "Axit",
    nfpa: { health: 2, flammability: 1, instability: 0 },
    location: "P.32",
    packaging: "500g/chai"
  },
  "Oleanolic acid": {
    formula: "C₃₀H₄₈O₃",
    casNumber: "508-02-1",
    state: PhysicalState.SOLID,
    category: "Axit",
    nfpa: { health: 1, flammability: 0, instability: 0 },
    location: "P.36",
    packaging: "1g/lọ"
  },
  "Benzoic acid": {
    formula: "C₇H₆O₂",
    casNumber: "65-85-0",
    state: PhysicalState.SOLID,
    category: "Axit",
    nfpa: { health: 1, flammability: 1, instability: 0 },
    location: "A.4",
    packaging: "500g/chai"
  },
  "Salicylic acid": {
    formula: "C₇H₆O₃",
    casNumber: "69-72-7",
    state: PhysicalState.SOLID,
    category: "Axit",
    nfpa: { health: 2, flammability: 1, instability: 0 },
    location: "Q.24",
    packaging: "500g/chai"
  },
  "Sodium hydroxide": {
    formula: "NaOH",
    casNumber: "1310-73-2",
    state: PhysicalState.SOLID,
    category: "Bazơ",
    nfpa: { health: 3, flammability: 0, instability: 1, special: "COR" },
    location: "F.12",
    packaging: "1kg/chai"
  },
  "Potassium hydroxide": {
    formula: "KOH",
    casNumber: "1310-58-3",
    state: PhysicalState.SOLID,
    category: "Bazơ",
    nfpa: { health: 3, flammability: 0, instability: 1, special: "COR" },
    location: "P.43A",
    packaging: "1kg/chai"
  },
  "Ammonia solution 25%": {
    formula: "NH₃",
    casNumber: "1336-21-6",
    state: PhysicalState.LIQUID,
    category: "Bazơ",
    nfpa: { health: 3, flammability: 1, instability: 0, special: "COR" },
    location: "M.22",
    packaging: "1L/chai"
  },
  "Ammonia solution 35%": {
    formula: "NH₃",
    casNumber: "1336-21-6",
    state: PhysicalState.LIQUID,
    category: "Bazơ",
    nfpa: { health: 3, flammability: 1, instability: 0, special: "COR" },
    location: "M.22",
    packaging: "1L/chai"
  },
  "Tetramethylammonium hydroxide 25%": {
    formula: "C₄H₁₃NO",
    casNumber: "75-59-2",
    state: PhysicalState.LIQUID,
    category: "Bazơ",
    nfpa: { health: 3, flammability: 1, instability: 0 },
    location: "M.20",
    packaging: "250ml/chai"
  },
  "Tetra-n-butylammonium hydroxide 20%": {
    formula: "C₁₆H₃₇NO",
    casNumber: "2052-49-5",
    state: PhysicalState.LIQUID,
    category: "Bazơ",
    nfpa: { health: 3, flammability: 1, instability: 0 },
    location: "M.20",
    packaging: "100ml/chai"
  },
  "Tetra-n-butylammonium hydroxide 40%": {
    formula: "C₁₆H₃₇NO",
    casNumber: "2052-49-5",
    state: PhysicalState.LIQUID,
    category: "Bazơ",
    nfpa: { health: 3, flammability: 1, instability: 0 },
    location: "M.20",
    packaging: "100ml/chai"
  },
  "Diethylamine": {
    formula: "C₄H₁₁N",
    casNumber: "109-89-7",
    state: PhysicalState.LIQUID,
    category: "Bazơ",
    nfpa: { health: 3, flammability: 4, instability: 0 },
    location: "M.15",
    packaging: "500ml/chai"
  },
  "Sodium chloride": {
    formula: "NaCl",
    casNumber: "7647-14-5",
    state: PhysicalState.SOLID,
    category: "Thuốc thử",
    nfpa: { health: 0, flammability: 0, instability: 0 },
    location: "E.10",
    packaging: "1kg/chai"
  },
  "Potassium chloride": {
    formula: "KCl",
    casNumber: "7447-40-7",
    state: PhysicalState.SOLID,
    category: "Thuốc thử",
    nfpa: { health: 0, flammability: 0, instability: 0 },
    location: "G.9",
    packaging: "500g/chai"
  },
  "Calcium chloride anhydrous": {
    formula: "CaCl₂",
    casNumber: "10043-52-4",
    state: PhysicalState.SOLID,
    category: "Thuốc thử",
    nfpa: { health: 1, flammability: 0, instability: 0 },
    location: "Tủ ấm low-temp",
    packaging: "500g/chai"
  },
  "Magnesium sulfate heptahydrate": {
    formula: "MgSO₄·7H₂O",
    casNumber: "10034-99-8",
    state: PhysicalState.SOLID,
    category: "Thuốc thử",
    nfpa: { health: 1, flammability: 0, instability: 0 },
    location: "P.6",
    packaging: "500g/chai"
  },
  "Copper(II) sulfate pentahydrate": {
    formula: "CuSO₄·5H₂O",
    casNumber: "7758-99-8",
    state: PhysicalState.SOLID,
    category: "Thuốc thử",
    nfpa: { health: 2, flammability: 0, instability: 0 },
    location: "E.12",
    packaging: "500g/chai"
  },
  "Iron(III) chloride hexahydrate": {
    formula: "FeCl₃·6H₂O",
    casNumber: "10025-77-1",
    state: PhysicalState.SOLID,
    category: "Thuốc thử",
    nfpa: { health: 2, flammability: 0, instability: 0 },
    location: "Q.17",
    packaging: "250g/chai"
  },
  "Potassium nitrate": {
    formula: "KNO₃",
    casNumber: "7757-79-1",
    state: PhysicalState.SOLID,
    category: "Chất oxi hóa",
    nfpa: { health: 1, flammability: 0, instability: 0, special: "OX" },
    location: "E.6",
    packaging: "500g/chai"
  },
  "Potassium permanganate": {
    formula: "KMnO₄",
    casNumber: "7722-64-7",
    state: PhysicalState.SOLID,
    category: "Chất oxi hóa",
    nfpa: { health: 2, flammability: 0, instability: 1, special: "OX" },
    location: "P.38",
    packaging: "500g/chai"
  },
  "Silver nitrate": {
    formula: "AgNO₃",
    casNumber: "7761-88-8",
    state: PhysicalState.SOLID,
    category: "Chất oxi hóa",
    nfpa: { health: 3, flammability: 0, instability: 0, special: "OX" },
    location: "E.1",
    packaging: "100g/lọ"
  },
  "Zinc sulfate heptahydrate": {
    formula: "ZnSO₄·7H₂O",
    casNumber: "7446-20-0",
    state: PhysicalState.SOLID,
    category: "Thuốc thử",
    nfpa: { health: 2, flammability: 0, instability: 0 },
    location: "P.12",
    packaging: "500g/chai"
  },
  "Lead(II) nitrate": {
    formula: "Pb(NO₃)₂",
    casNumber: "10099-74-8",
    state: PhysicalState.SOLID,
    category: "Độc hại",
    nfpa: { health: 3, flammability: 0, instability: 1, special: "OX" },
    location: "Q.22",
    packaging: "250g/chai"
  },
  "Phenolphthalein": {
    formula: "C₂₀H₁₄O₄",
    casNumber: "77-09-8",
    state: PhysicalState.SOLID,
    category: "Thuốc thử",
    nfpa: { health: 2, flammability: 1, instability: 0 },
    location: "P.16",
    packaging: "100g/chai"
  },
  "Methyl orange": {
    formula: "C₁₄H₁₄N₃NaO₃S",
    casNumber: "547-58-0",
    state: PhysicalState.SOLID,
    category: "Thuốc thử",
    nfpa: { health: 1, flammability: 0, instability: 0 },
    location: "P.41",
    packaging: "25g/lọ"
  },
  "Methyl red": {
    formula: "C₁₅H₁₅N₃O₂",
    casNumber: "493-52-7",
    state: PhysicalState.SOLID,
    category: "Thuốc thử",
    nfpa: { health: 2, flammability: 1, instability: 0 },
    location: "P.42",
    packaging: "25g/lọ"
  },
  "Bromothymol blue": {
    formula: "C₂₇H₂₈Br₂O₅S",
    casNumber: "76-59-5",
    state: PhysicalState.SOLID,
    category: "Thuốc thử",
    nfpa: { health: 1, flammability: 0, instability: 0 },
    location: "F.5",
    packaging: "25g/lọ"
  },
  "EDTA disodium salt dihydrate": {
    formula: "C₁₀H₁₄N₂Na₂O₈·2H₂O",
    casNumber: "6381-92-6",
    state: PhysicalState.SOLID,
    category: "Thuốc thử",
    nfpa: { health: 1, flammability: 0, instability: 0 },
    location: "G.4",
    packaging: "500g/chai"
  },
  "Dithizone": {
    formula: "C₁₃H₁₂N₄S",
    casNumber: "60-10-6",
    state: PhysicalState.SOLID,
    category: "Thuốc thử",
    nfpa: { health: 3, flammability: 1, instability: 0 },
    location: "Q.14",
    packaging: "25g/lọ"
  },
  "Ninhydrin": {
    formula: "C₉H₆O₄",
    casNumber: "485-47-2",
    state: PhysicalState.SOLID,
    category: "Thuốc thử",
    nfpa: { health: 2, flammability: 1, instability: 0 },
    location: "Q.17",
    packaging: "25g/lọ"
  },
  "Zinc": {
    formula: "Zn",
    casNumber: "7440-66-6",
    state: PhysicalState.SOLID,
    category: "Khác",
    nfpa: { health: 1, flammability: 0, instability: 0 },
    location: "S.1",
    packaging: "500g/chai"
  },
  "Magnesium": {
    formula: "Mg",
    casNumber: "7439-95-4",
    state: PhysicalState.SOLID,
    category: "Chất dễ cháy",
    nfpa: { health: 1, flammability: 1, instability: 1 },
    location: "F.10",
    packaging: "500g/chai"
  },
  "Mercury(II) chloride": {
    formula: "HgCl₂",
    casNumber: "7487-94-7",
    state: PhysicalState.SOLID,
    category: "Độc hại",
    nfpa: { health: 3, flammability: 0, instability: 0 },
    location: "P.3",
    packaging: "100g/chai"
  },
  "Mercury(II) acetate": {
    formula: "Hg(C₂H₃O₂)₂",
    casNumber: "1600-27-7",
    state: PhysicalState.SOLID,
    category: "Độc hại",
    nfpa: { health: 3, flammability: 0, instability: 0 },
    location: "P.3",
    packaging: "100g/chai"
  },
  "Barium chloride dihydrate": {
    formula: "BaCl₂·2H₂O",
    casNumber: "10326-27-9",
    state: PhysicalState.SOLID,
    category: "Độc hại",
    nfpa: { health: 3, flammability: 0, instability: 0 },
    location: "Q.10",
    packaging: "500g/chai"
  },
  "Antimony(III) chloride": {
    formula: "SbCl₃",
    casNumber: "10025-91-9",
    state: PhysicalState.SOLID,
    category: "Axit",
    nfpa: { health: 3, flammability: 0, instability: 1 },
    location: "P.15",
    packaging: "500g/chai"
  },
  "Titanium(III) chloride 20%": {
    formula: "TiCl₃",
    casNumber: "7705-07-9",
    state: PhysicalState.LIQUID,
    category: "Axit",
    nfpa: { health: 3, flammability: 0, instability: 1 },
    location: "P.20",
    packaging: "100ml/chai"
  },
  "Hexachloroplatinic acid 10%": {
    formula: "H₂PtCl₆",
    casNumber: "16941-12-1",
    state: PhysicalState.LIQUID,
    category: "Axit",
    nfpa: { health: 3, flammability: 0, instability: 0 },
    location: "D.4",
    packaging: "1g/lọ"
  }
};

export const MASTER_CHEMICAL_NAMES = [
  ...Object.keys(CHEMICAL_CATALOG),
  "1,2-Dichloroethane", "1,4-Dioxane", "Benzene", "Diethyl ether", "Dimethylsulfoxide", "Glycerol", "Hydrogen peroxide 30%", "Iodine", "Isooctane", "O-Xylene", "Petroleum ether", "Pyridine"
];
