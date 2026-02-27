import { StaffMember, UserRole } from "@/lib/types";

// All 5 wards
export const WARDS = ["Byron", "Shelley", "Keats", "Wordsworth", "Dickinson"] as const;
export type WardName = (typeof WARDS)[number];

// Staff member names for each ward
// First entries are role-based positions, then regular staff follow
const STAFF_LETTERS = ["D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T"];

const generateStaffNames = (wardPrefix: string, wardName: string): string[] => {
  // First entries are the named role positions
  const names = [
    `${wardName} Ward Admin`,
    `${wardName} Senior Admin`,
    `${wardName} Lead`,
    `${wardName} Manager`,
  ];

  // Add the rest of the staff (16 more to reach 20)
  STAFF_LETTERS.slice(0, 16).forEach((letter, i) => {
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

// Role distribution pattern: first four are named roles, rest are normal staff
const getRoleForIndex = (index: number): UserRole => {
  if (index === 0) return "ward_admin";     // "[Ward] Ward Admin"
  if (index === 1) return "senior_admin";   // "[Ward] Senior Admin"
  if (index === 2) return "lead";           // "[Ward] Lead"
  if (index === 3) return "manager";        // "[Ward] Manager"
  return "staff";  // All other staff are regular staff
};

// Some staff members have contributor privileges (granted by ward_admin or manager)
const hasContributorFlag = (index: number): boolean => {
  // Lead and Manager get contributor by default, plus a couple of regular staff
  return index === 2 || index === 3 || index === 6 || index === 10;
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
        isContributor: hasContributorFlag(i) || undefined,
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

// Helper to get leads and managers for a ward
export function getLeadsAndManagers(ward: string): StaffMember[] {
  return DEMO_STAFF.filter(
    (s) => s.ward === ward && s.isActive && (s.role === "lead" || s.role === "manager")
  );
}

// Helper to get eligible ward professionals (staff, lead, manager - not ward_admin or senior_admin)
export function getWardProfessionalCandidates(ward: string): StaffMember[] {
  return DEMO_STAFF.filter(
    (s) => s.ward === ward && s.isActive && (s.role === "staff" || s.role === "lead" || s.role === "manager")
  );
}

// Helper to get staff count per ward
export function getStaffCountByWard(): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const ward of WARDS) {
    counts[ward] = getStaffByWard(ward).length;
  }
  return counts;
}
