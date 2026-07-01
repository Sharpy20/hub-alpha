import { StaffMember, UserRole } from "@/lib/types";

// All 5 wards
export const WARDS = ["Byron", "Shelley", "Keats", "Wordsworth", "Dickinson"] as const;
export type WardName = (typeof WARDS)[number];

// Real (fictional) staff names - 5 per ward for now (Mike: 5 max per ward).
// Role is assigned by INDEX in getRoleForIndex below: 0 Ward Admin, 1 Senior
// Admin, 2 Lead, 3 Manager, 4 Staff. Consultants are separate (CONSULTANTS in
// tasks/index.ts) so the ward staff list stays nurse/leadership only.
export const STAFF_NAMES: Record<string, string[]> = {
  Byron: ["Karen Whitfield", "Paul Roberts", "Emma Docherty", "James Okafor", "Sophie Bennett"],
  Shelley: ["Lisa Hammond", "David Chen", "Grace Adeyemi", "Tom Fielding", "Hannah Price"],
  Keats: ["Marie Dawson", "Steven Blake", "Priya Nair", "Chris O'Neill", "Amy Sutton"],
  Wordsworth: ["Janet Cole", "Mohammed Iqbal", "Rebecca Lloyd", "Gary Simmons", "Olivia Reid"],
  Dickinson: ["Susan Frost", "Daniel Osei", "Chloe Barnes", "Neil Patterson", "Jack Merton"],
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
