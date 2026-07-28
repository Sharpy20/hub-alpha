import { StaffMember, UserRole } from "@/lib/types";

// All 5 wards
export const WARDS = ["Byron", "Shelley", "Keats", "Wordsworth", "Dickinson"] as const;
export type WardName = (typeof WARDS)[number];

// DEMO NAMING THEME - everything in the demo comes from English literature, so
// that nobody can mistake demo data for a real roster or a real patient list:
//   Wards       poets            (Byron, Shelley, Keats, Wordsworth, Dickinson)
//   Staff       Jane Austen      (this file)
//   Patients    other classic novels - Brontes, Eliot, Gaskell, Hardy, Dickens
//   Consultants doctors from novels
// The patient and consultant halves live in src/lib/data/tasks/index.ts.
// Keep any new name inside the theme. Deliberately avoided: villains, characters
// defined by madness or asylums, and Dickens' joke names.
//
// 5 per ward (Mike: 5 max per ward). Role is assigned by INDEX in
// getRoleForIndex below: 0 Ward Admin, 1 Senior Admin, 2 Lead, 3 Manager,
// 4 Staff. Consultants are separate so the ward staff list stays
// nurse/leadership only.
export const STAFF_NAMES: Record<string, string[]> = {
  Byron: ["Charlotte Lucas", "George Knightley", "Elinor Dashwood", "Henry Tilney", "Anne Elliot"],
  Shelley: ["Harriet Smith", "Frederick Wentworth", "Emma Woodhouse", "Edmund Bertram", "Fanny Price"],
  Keats: ["Mary Musgrove", "Fitzwilliam Darcy", "Elizabeth Bennet", "Edward Ferrars", "Catherine Morland"],
  Wordsworth: ["Lucy Steele", "Charles Bingley", "Jane Fairfax", "Robert Martin", "Sophia Croft"],
  Dickinson: ["Augusta Weston", "Frank Churchill", "Julia Yates", "Christopher Brandon", "Isabella Thorpe"],
};

// Role distribution pattern: first four are named roles, rest are normal staff
const getRoleForIndex = (index: number): UserRole => {
  if (index === 0) return "ward_admin";     // "[Ward] Ward Admin"
  if (index === 1) return "senior_admin";   // "[Ward] Senior Admin"
  if (index === 2) return "lead";           // "[Ward] Lead"
  if (index === 3) return "manager";        // "[Ward] Manager"
  return "staff";  // All other staff are regular staff
};

// Some staff members have contributor privileges (granted by ward_admin or manager).
// Lead (2) and Manager (3) get it by default. Indexes 6 and 10 are leftovers from
// the old 20-per-ward roster - with 5 staff per ward they never match.
const hasContributorFlag = (index: number): boolean => {
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
        isActive: i !== 8, // leftover from the 20-per-ward roster - index 8 never occurs with 5 staff, so everyone is active
        isContributor: hasContributorFlag(i) || undefined,
      });
      idCounter++;
    }
  }

  return staff;
};

// All staff across all wards (currently 25 total: 5 per ward x 5 wards,
// driven by STAFF_NAMES above - Mike capped it at 5 per ward)
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
