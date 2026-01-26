import { StaffMember, UserRole } from "@/lib/types";

// All 5 wards
export const WARDS = ["Byron", "Shelley", "Keats", "Wordsworth", "Dickinson"] as const;
export type WardName = (typeof WARDS)[number];

// Staff member names for each ward
// First entry is always the Ward Admin, then other staff follow
const STAFF_LETTERS = ["B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T"];

const generateStaffNames = (wardPrefix: string, wardName: string): string[] => {
  // First entry is the Ward Admin
  const names = [`${wardName} Ward Admin`];

  // Add the rest of the staff
  STAFF_LETTERS.forEach((letter, i) => {
    // Make some doctors (indices 2, 5 in the letter array - typically senior positions)
    if (i === 2 || i === 5) {
      names.push(`Dr. ${wardPrefix}_${letter}`);
    } else {
      names.push(`Staff_${wardPrefix}_${letter}`);
    }
  });

  return names;
};

export const STAFF_NAMES: Record<string, string[]> = {
  Byron: generateStaffNames("BY", "Byron"),
  Shelley: generateStaffNames("SH", "Shelley"),
  Keats: generateStaffNames("KE", "Keats"),
  Wordsworth: generateStaffNames("WO", "Wordsworth"),
  Dickinson: generateStaffNames("DI", "Dickinson"),
};

// Role distribution pattern: first is ward_admin, then mix of other roles
const getRoleForIndex = (index: number): UserRole => {
  if (index === 0) return "ward_admin"; // First staff member is always ward admin
  if (index < 3) return "senior_admin";
  if (index < 6) return "ward_admin";
  if (index < 9) return "contributor";
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
        isActive: i !== 8, // Index 8 is inactive
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
