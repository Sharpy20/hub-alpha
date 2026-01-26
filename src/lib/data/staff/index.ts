import { StaffMember, UserRole } from "@/lib/types";

// All 5 wards
export const WARDS = ["Byron", "Shelley", "Keats", "Wordsworth", "Dickinson"] as const;
export type WardName = (typeof WARDS)[number];

// Staff member names for each ward (20 per ward: Staff_A through Staff_T)
// Using simple demo names for clarity in testing
const STAFF_LETTERS = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T"];

const generateStaffNames = (wardPrefix: string): string[] => {
  return STAFF_LETTERS.map((letter, i) => {
    // Make some doctors (indices 3, 6 - typically senior positions)
    if (i === 3 || i === 6) {
      return `Dr. ${wardPrefix}_${letter}`;
    }
    return `Staff_${wardPrefix}_${letter}`;
  });
};

export const STAFF_NAMES: Record<string, string[]> = {
  Byron: generateStaffNames("BY"),
  Shelley: generateStaffNames("SH"),
  Keats: generateStaffNames("KE"),
  Wordsworth: generateStaffNames("WO"),
  Dickinson: generateStaffNames("DI"),
};

// Role distribution pattern: roughly 60% normal, 15% ward_admin, 15% contributor, 10% senior_admin
const getRoleForIndex = (index: number): UserRole => {
  if (index < 2) return "senior_admin";
  if (index < 5) return "ward_admin";
  if (index < 8) return "contributor";
  return "normal";
};

// Generate staff for all wards
const generateAllStaff = (): StaffMember[] => {
  const staff: StaffMember[] = [];
  let idCounter = 1;

  for (const ward of WARDS) {
    const names = STAFF_NAMES[ward];
    for (let i = 0; i < names.length; i++) {
      staff.push({
        id: `s${idCounter}`,
        name: names[i],
        role: getRoleForIndex(i),
        ward,
        isActive: i !== 7, // Index 7 is inactive (e.g., Claire Adams in Byron)
      });
      idCounter++;
    }
  }

  return staff;
};

// All staff across all wards (100 total: 20 × 5 wards)
export const DEMO_STAFF: StaffMember[] = generateAllStaff();

// Helper to get staff by ward
export function getStaffByWard(ward: string): StaffMember[] {
  return DEMO_STAFF.filter((s) => s.ward === ward && s.isActive);
}

// Helper to get all active staff
export function getActiveStaff(): StaffMember[] {
  return DEMO_STAFF.filter((s) => s.isActive);
}

// Helper to get staff by name
export function getStaffByName(name: string): StaffMember | undefined {
  return DEMO_STAFF.find((s) => s.name === name);
}

// Helper to get staff by ID
export function getStaffById(id: string): StaffMember | undefined {
  return DEMO_STAFF.find((s) => s.id === id);
}

// Helper to get all wards
export function getAllWards(): readonly string[] {
  return WARDS;
}

// Helper to get staff count per ward
export function getStaffCountByWard(): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const ward of WARDS) {
    counts[ward] = getStaffByWard(ward).length;
  }
  return counts;
}
