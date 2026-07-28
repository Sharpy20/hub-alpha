import fs from "fs";
import path from "path";
import { DEMO_PATIENTS } from "@/lib/data/tasks";

/**
 * Mike's rule, 28 July 2026: MHA legal status, clinical alerts and diagnoses do
 * not belong anywhere in wardHub.
 *
 * The reason is not only information governance. Getting patient name, ward and
 * task name approved is already hard, and every extra clinical field invites the
 * two questions nobody can answer for a tool that is not the clinical record:
 * who keeps it up to date, and what happens when a staff member acts on it after
 * it has gone stale? A wrong MHA status on a ward list is a wrong intervention.
 *
 * The single exception: a value the user types to complete a guide and generate
 * a personalised case note may live in page memory while that guide is open. It
 * must never be written to a patient record, persisted, or shown anywhere else.
 * /welcome and /service-map do this correctly - React state, no localStorage,
 * no network.
 *
 * These tests exist so the fields cannot drift back in unnoticed. If one fails,
 * that is the point. Do not relax it without Mike saying so.
 */

const SRC = path.join(process.cwd(), "src");

const walk = (dir: string, out: string[] = []): string[] => {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, out);
    else if (/\.(ts|tsx)$/.test(entry.name)) out.push(full);
  }
  return out;
};

// The guide-completion exception, plus this test file itself.
const ALLOWED = [
  path.join("lib", "data", "welcome", "risk-screen.ts"), // profile builder, memory only
  path.join("lib", "data", "service-map.ts"), // service finder, memory only
  path.join("app", "welcome", "page.tsx"),
  path.join("app", "service-map", "page.tsx"),
  path.join("__tests__", "no-special-category-data.test.ts"),
  path.join("lib", "data", "quiz"), // question text about alerts, not patient data
  path.join("app", "dev-panel", "page.tsx"), // documents the removal
];

const isAllowed = (file: string) => ALLOWED.some((a) => file.includes(a));

describe("no special category data on the patient record", () => {
  it("the Patient type has no legalStatus, alerts or diagnoses field", () => {
    const types = fs.readFileSync(path.join(SRC, "lib", "types", "index.ts"), "utf8");
    const patientBlock = types.slice(
      types.indexOf("export interface Patient {"),
      types.indexOf("}", types.indexOf("export interface Patient {"))
    );
    expect(patientBlock).not.toMatch(/legalStatus/);
    expect(patientBlock).not.toMatch(/\balerts\b/);
    expect(patientBlock).not.toMatch(/diagnoses/);
  });

  it("no demo patient carries a legal status, alert or diagnosis", () => {
    expect(DEMO_PATIENTS.length).toBeGreaterThan(0);
    for (const patient of DEMO_PATIENTS) {
      const keys = Object.keys(patient);
      expect(keys).not.toContain("legalStatus");
      expect(keys).not.toContain("alerts");
      expect(keys).not.toContain("diagnoses");
    }
  });

  it("no source file outside the guide-completion exception references them", () => {
    const offenders: string[] = [];
    for (const file of walk(SRC)) {
      if (isAllowed(file)) continue;
      const body = fs.readFileSync(file, "utf8");
      // patient.alerts / ALERTS_POOL / legalStatus / LegalStatus / patient.diagnoses
      if (/legalStatus|LegalStatus|LEGAL_STATUS|ALERTS_POOL|\.alerts\b|customAlerts/.test(body)) {
        offenders.push(path.relative(SRC, file));
      }
    }
    expect(offenders).toEqual([]);
  });

  it("the ward settings cannot make them configurable again", () => {
    const types = fs.readFileSync(path.join(SRC, "lib", "types", "index.ts"), "utf8");
    const block = types.slice(
      types.indexOf("export interface PatientFieldSettings {"),
      types.indexOf("}", types.indexOf("export interface PatientFieldSettings {"))
    );
    expect(block).not.toMatch(/legalStatus/);
    expect(block).not.toMatch(/alerts/);
  });
});
