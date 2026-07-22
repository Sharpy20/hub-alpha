"use client";

import { useMemo } from "react";
import Link from "next/link";
import { MainLayout } from "@/components/layout";
import { Card, CardContent } from "@/components/ui";
import { useTasks } from "@/app/tasks-provider";
import { DEMO_PATIENTS } from "@/lib/data/tasks";
import { WARDS, DiaryTask } from "@/lib/types";
import {
  Building2,
  AlertTriangle,
  Users,
  Clock,
  UserX,
  ArrowRight,
  ListTodo,
} from "lucide-react";

// Types use lowercase ward id ("byron"); patient/task data uses capitalised ("Byron").
const wardDataName = (wardId: string) =>
  wardId.charAt(0).toUpperCase() + wardId.slice(1);

const isOutstanding = (t: DiaryTask) =>
  t.status !== "completed" && t.status !== "cancelled";

const patientIdOf = (t: DiaryTask): string | undefined =>
  t.type === "patient" || t.type === "appointment" ? t.patientId : undefined;

export default function TrustOverviewPage() {
  const { tasks } = useTasks();

  const data = useMemo(() => {
    const barrierTasks = tasks.filter((t) => isOutstanding(t) && t.blocksDischarge);

    const perWard = WARDS.map((w) => {
      const dn = wardDataName(w.id);
      const activePatients = DEMO_PATIENTS.filter(
        (p) => p.ward === dn && p.status !== "discharged"
      );
      const wardBarriers = barrierTasks.filter((t) => t.ward === dn);
      const blockedIds = new Set(
        wardBarriers.map(patientIdOf).filter(Boolean) as string[]
      );
      const overdue = wardBarriers.filter((t) => t.status === "overdue").length;
      return {
        ward: w,
        activeCount: activePatients.length,
        blockedCount: blockedIds.size,
        barrierCount: wardBarriers.length,
        overdue,
      };
    }).sort((a, b) => b.barrierCount - a.barrierCount);

    const totalActive = perWard.reduce((s, w) => s + w.activeCount, 0);
    const totalBlocked = perWard.reduce((s, w) => s + w.blockedCount, 0);
    const totalBarriers = barrierTasks.length;
    const totalOverdue = perWard.reduce((s, w) => s + w.overdue, 0);
    const maxBarriers = Math.max(1, ...perWard.map((w) => w.barrierCount));

    // Most common barriers trust-wide, grouped by task title
    const byTitle = new Map<string, number>();
    barrierTasks.forEach((t) =>
      byTitle.set(t.title, (byTitle.get(t.title) ?? 0) + 1)
    );
    const commonBarriers = [...byTitle.entries()]
      .map(([title, count]) => ({ title, count }))
      .sort((a, b) => b.count - a.count);

    // Blocked patients, with the tasks holding them up
    const blockedMap = new Map<
      string,
      { name: string; ward: string; titles: string[] }
    >();
    barrierTasks.forEach((t) => {
      const pid = patientIdOf(t);
      if (!pid) return;
      const patient = DEMO_PATIENTS.find((p) => p.id === pid);
      const name =
        patient?.name ??
        (t.type === "patient" || t.type === "appointment" ? t.patientName : undefined) ??
        "Unknown patient";
      const entry = blockedMap.get(pid) ?? { name, ward: t.ward, titles: [] };
      entry.titles.push(t.title);
      blockedMap.set(pid, entry);
    });
    const blockedPatients = [...blockedMap.values()].sort((a, b) =>
      a.ward.localeCompare(b.ward)
    );

    return {
      perWard,
      totalActive,
      totalBlocked,
      totalBarriers,
      totalOverdue,
      maxBarriers,
      commonBarriers,
      blockedPatients,
    };
  }, [tasks]);

  return (
    <MainLayout>
      <div className="space-y-6 max-w-7xl mx-auto">
        {/* Hero */}
        <div className="bg-gradient-to-r from-violet-600 to-purple-700 rounded-2xl p-6 text-white">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
              <Building2 className="w-9 h-9 text-white" />
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-bold">Trust Overview</h1>
              <p className="text-white/80 mt-1">
                Discharge barriers across every ward, in one place.
              </p>
              <p className="text-white/60 text-xs mt-2">
                Demo data. A trust-wide roll-up of the barrier flags set on the wards.
              </p>
            </div>
          </div>

          {/* Headline tiles */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6">
            <StatTile
              icon={<Users className="w-5 h-5" />}
              label="Active patients"
              value={data.totalActive}
            />
            <StatTile
              icon={<UserX className="w-5 h-5" />}
              label="Patients blocked"
              value={data.totalBlocked}
              emphasis={data.totalBlocked > 0}
            />
            <StatTile
              icon={<AlertTriangle className="w-5 h-5" />}
              label="Open barriers"
              value={data.totalBarriers}
              emphasis={data.totalBarriers > 0}
            />
            <StatTile
              icon={<Clock className="w-5 h-5" />}
              label="Overdue barriers"
              value={data.totalOverdue}
              emphasis={data.totalOverdue > 0}
            />
          </div>
        </div>

        {/* Per-ward barriers */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <Building2 className="w-5 h-5 text-violet-600" />
                Barriers by ward
              </h2>
              <span className="text-xs text-gray-500">Worst first</span>
            </div>

            <div className="space-y-3">
              {data.perWard.map((w) => (
                <div
                  key={w.ward.id}
                  className={`rounded-xl border p-4 ${
                    w.barrierCount > 0
                      ? "border-amber-200 bg-amber-50"
                      : "border-gray-200 bg-white"
                  }`}
                >
                  <div className="flex items-center justify-between gap-4 flex-wrap">
                    <div className="flex items-center gap-3 min-w-[180px]">
                      <span className="font-bold text-gray-900">{w.ward.name}</span>
                      {w.overdue > 0 && (
                        <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-red-100 text-red-700">
                          {w.overdue} overdue
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-6 text-sm">
                      <span className="text-gray-600">
                        <span className="font-bold text-gray-900">{w.activeCount}</span> active
                      </span>
                      <span className="text-gray-600">
                        <span className="font-bold text-gray-900">{w.blockedCount}</span> blocked
                      </span>
                      <span
                        className={
                          w.barrierCount > 0
                            ? "text-amber-800 font-semibold"
                            : "text-gray-500"
                        }
                      >
                        🚧 {w.barrierCount} barrier{w.barrierCount === 1 ? "" : "s"}
                      </span>
                    </div>
                  </div>
                  {/* proportional bar */}
                  <div className="mt-3 h-2 rounded-full bg-gray-200 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-amber-500"
                      style={{
                        width: `${(w.barrierCount / data.maxBarriers) * 100}%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Most common barriers */}
          <Card>
            <CardContent className="p-6">
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2 mb-4">
                <ListTodo className="w-5 h-5 text-violet-600" />
                Most common barriers
              </h2>
              {data.commonBarriers.length === 0 ? (
                <p className="text-gray-500 text-sm">No open discharge barriers.</p>
              ) : (
                <div className="space-y-2">
                  {data.commonBarriers.map((b) => (
                    <div
                      key={b.title}
                      className="flex items-center justify-between gap-3 p-3 rounded-lg bg-gray-50"
                    >
                      <span className="text-sm font-medium text-gray-800">{b.title}</span>
                      <span className="text-xs font-bold px-2 py-1 rounded-full bg-amber-100 text-amber-800 flex-shrink-0">
                        x{b.count}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Blocked patients */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <UserX className="w-5 h-5 text-violet-600" />
                  Blocked patients
                </h2>
                <Link
                  href="/reports"
                  className="text-xs font-semibold text-violet-600 hover:text-violet-800 flex items-center gap-1"
                >
                  Full report <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
              {data.blockedPatients.length === 0 ? (
                <p className="text-gray-500 text-sm">No patients currently blocked.</p>
              ) : (
                <div className="space-y-2">
                  {data.blockedPatients.map((p, i) => (
                    <div key={i} className="p-3 rounded-lg bg-gray-50">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-gray-900 text-sm">{p.name}</span>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-violet-100 text-violet-700">
                          {p.ward}
                        </span>
                      </div>
                      <div className="mt-1 text-xs text-gray-600">
                        {p.titles.join("  ·  ")}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
}

function StatTile({
  icon,
  label,
  value,
  emphasis = false,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  emphasis?: boolean;
}) {
  return (
    <div
      className={`rounded-xl p-3 text-center ${
        emphasis ? "bg-white text-violet-800" : "bg-white/10 text-white"
      }`}
    >
      <div className="flex items-center justify-center gap-1.5 opacity-90">
        {icon}
      </div>
      <div className="text-2xl font-bold mt-1">{value}</div>
      <div className="text-xs opacity-80 mt-0.5">{label}</div>
    </div>
  );
}
