"use client";

import { useState } from "react";
import { MainLayout } from "@/components/layout";
import { Card } from "@/components/ui";
import { useReferralLog } from "@/app/referral-log-provider";
import { useApp } from "@/app/providers";
import { ReferralLogStatus } from "@/lib/types";
import {
  ClipboardList,
  Clock,
  CheckCircle2,
  Phone,
  Mail,
  MessageSquare,
  Plus,
  X,
  ChevronDown,
  ChevronUp,
  Trash2,
  Calendar,
  User,
  Building2,
} from "lucide-react";
import Link from "next/link";

const STATUS_CONFIG: Record<ReferralLogStatus, { label: string; color: string; bgColor: string; icon: React.ReactNode }> = {
  sent: { label: "Sent", color: "text-blue-700", bgColor: "bg-blue-100", icon: <Mail className="w-4 h-4" /> },
  awaiting_response: { label: "Awaiting Response", color: "text-amber-700", bgColor: "bg-amber-100", icon: <Clock className="w-4 h-4" /> },
  chased: { label: "Chased", color: "text-orange-700", bgColor: "bg-orange-100", icon: <Phone className="w-4 h-4" /> },
  completed: { label: "Completed", color: "text-green-700", bgColor: "bg-green-100", icon: <CheckCircle2 className="w-4 h-4" /> },
  cancelled: { label: "Cancelled", color: "text-gray-500", bgColor: "bg-gray-100", icon: <X className="w-4 h-4" /> },
};

type FilterStatus = "all" | "pending" | ReferralLogStatus;

export default function ReferralLogPage() {
  const { user } = useApp();
  const { referralLogs, updateReferralLog, addChaseToLog, deleteReferralLog } = useReferralLog();
  const [filterStatus, setFilterStatus] = useState<FilterStatus>("pending");
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null);
  const [chaseModalLogId, setChaseModalLogId] = useState<string | null>(null);
  const [chaseMethod, setChaseMethod] = useState<"phone" | "email" | "other">("phone");
  const [chaseNotes, setChaseNotes] = useState("");

  const filteredLogs = referralLogs.filter((log) => {
    if (filterStatus === "all") return true;
    if (filterStatus === "pending") {
      return log.status === "sent" || log.status === "awaiting_response" || log.status === "chased";
    }
    return log.status === filterStatus;
  });

  const pendingCount = referralLogs.filter(
    (log) => log.status === "sent" || log.status === "awaiting_response" || log.status === "chased"
  ).length;

  const handleAddChase = (logId: string) => {
    if (!chaseNotes.trim()) return;
    addChaseToLog(logId, {
      date: new Date().toISOString(),
      method: chaseMethod,
      notes: chaseNotes,
      chasedBy: user?.name || "Unknown",
    });
    setChaseModalLogId(null);
    setChaseNotes("");
    setChaseMethod("phone");
  };

  const handleMarkComplete = (logId: string) => {
    updateReferralLog(logId, {
      status: "completed",
      completedDate: new Date().toISOString(),
    });
  };

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
                <ClipboardList className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Referral Chase Log</h1>
                <p className="text-gray-600">Track and follow up on sent referrals</p>
              </div>
            </div>
            {pendingCount > 0 && (
              <div className="bg-amber-100 text-amber-700 px-4 py-2 rounded-xl font-semibold">
                {pendingCount} pending
              </div>
            )}
          </div>
        </div>

        {/* Filter tabs */}
        <div className="flex flex-wrap gap-2 mb-6">
          <button
            onClick={() => setFilterStatus("pending")}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filterStatus === "pending"
                ? "bg-amber-100 text-amber-700"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            Pending ({pendingCount})
          </button>
          <button
            onClick={() => setFilterStatus("all")}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filterStatus === "all"
                ? "bg-indigo-100 text-indigo-700"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            All ({referralLogs.length})
          </button>
          <button
            onClick={() => setFilterStatus("completed")}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filterStatus === "completed"
                ? "bg-green-100 text-green-700"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            Completed
          </button>
        </div>

        {/* Referral logs list */}
        {filteredLogs.length === 0 ? (
          <Card className="p-8 text-center">
            <div className="text-5xl mb-4">📋</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No referrals logged</h3>
            <p className="text-gray-600 mb-4">
              {filterStatus === "pending"
                ? "No pending referrals to follow up on."
                : "Complete a referral workflow to log it here for tracking."}
            </p>
            <Link
              href="/referrals"
              className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Start a Referral
            </Link>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredLogs.map((log) => {
              const statusConfig = STATUS_CONFIG[log.status];
              const isExpanded = expandedLogId === log.id;

              return (
                <Card key={log.id} className="overflow-hidden">
                  {/* Main row */}
                  <div
                    className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                    onClick={() => setExpandedLogId(isExpanded ? null : log.id)}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 ${statusConfig.bgColor} rounded-lg flex items-center justify-center ${statusConfig.color}`}>
                        {statusConfig.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-gray-900">{log.workflowTitle}</h3>
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusConfig.bgColor} ${statusConfig.color}`}>
                            {statusConfig.label}
                          </span>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-500 mt-1">
                          {log.patientName && (
                            <span className="flex items-center gap-1">
                              <User className="w-3 h-3" />
                              {log.patientName}
                            </span>
                          )}
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {new Date(log.sentDate).toLocaleDateString("en-GB")}
                          </span>
                          <span className="flex items-center gap-1">
                            <Building2 className="w-3 h-3" />
                            {log.sentTo}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {log.chaseHistory.length > 0 && (
                          <span className="text-xs text-gray-500">
                            {log.chaseHistory.length} chase{log.chaseHistory.length !== 1 ? "s" : ""}
                          </span>
                        )}
                        {isExpanded ? (
                          <ChevronUp className="w-5 h-5 text-gray-400" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-gray-400" />
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Expanded details */}
                  {isExpanded && (
                    <div className="border-t border-gray-100 p-4 bg-gray-50">
                      {/* Notes */}
                      {log.notes && (
                        <div className="mb-4">
                          <p className="text-sm text-gray-600">{log.notes}</p>
                        </div>
                      )}

                      {/* Chase history */}
                      {log.chaseHistory.length > 0 && (
                        <div className="mb-4">
                          <h4 className="text-sm font-semibold text-gray-700 mb-2">Chase History</h4>
                          <div className="space-y-2">
                            {log.chaseHistory.map((chase) => (
                              <div key={chase.id} className="flex items-start gap-3 text-sm bg-white rounded-lg p-3">
                                <div className="w-6 h-6 bg-orange-100 rounded flex items-center justify-center">
                                  {chase.method === "phone" ? (
                                    <Phone className="w-3 h-3 text-orange-600" />
                                  ) : chase.method === "email" ? (
                                    <Mail className="w-3 h-3 text-orange-600" />
                                  ) : (
                                    <MessageSquare className="w-3 h-3 text-orange-600" />
                                  )}
                                </div>
                                <div className="flex-1">
                                  <p className="text-gray-800">{chase.notes}</p>
                                  <p className="text-xs text-gray-500 mt-1">
                                    {new Date(chase.date).toLocaleDateString("en-GB")} by {chase.chasedBy}
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Actions */}
                      {log.status !== "completed" && log.status !== "cancelled" && (
                        <div className="flex gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setChaseModalLogId(log.id);
                            }}
                            className="flex items-center gap-2 px-3 py-2 bg-orange-100 text-orange-700 rounded-lg font-medium hover:bg-orange-200 transition-colors text-sm"
                          >
                            <Phone className="w-4 h-4" />
                            Log Chase
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleMarkComplete(log.id);
                            }}
                            className="flex items-center gap-2 px-3 py-2 bg-green-100 text-green-700 rounded-lg font-medium hover:bg-green-200 transition-colors text-sm"
                          >
                            <CheckCircle2 className="w-4 h-4" />
                            Mark Complete
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              if (confirm("Delete this referral log?")) {
                                deleteReferralLog(log.id);
                              }
                            }}
                            className="flex items-center gap-2 px-3 py-2 bg-red-100 text-red-700 rounded-lg font-medium hover:bg-red-200 transition-colors text-sm"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </Card>
              );
            })}
          </div>
        )}

        {/* Link back to referrals */}
        <div className="mt-6 text-center">
          <Link href="/referrals" className="text-indigo-600 hover:text-indigo-800 font-medium">
            ← Back to Referrals
          </Link>
        </div>
      </div>

      {/* Chase Modal */}
      {chaseModalLogId && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
          onClick={() => setChaseModalLogId(null)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Log chase up"
            className="bg-white rounded-2xl w-full max-w-md overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-gradient-to-r from-orange-500 to-amber-600 p-4 text-white">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold">Log Chase Up</h2>
                  <p className="text-sm text-white/80">Record follow-up contact</p>
                </div>
              </div>
            </div>

            <div className="p-4 space-y-4">
              {/* Method */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Method</label>
                <div className="flex gap-2">
                  {(["phone", "email", "other"] as const).map((method) => (
                    <button
                      key={method}
                      onClick={() => setChaseMethod(method)}
                      className={`flex-1 py-2 px-3 rounded-lg font-medium transition-all ${
                        chaseMethod === method
                          ? "bg-orange-100 text-orange-700 border-2 border-orange-300"
                          : "bg-gray-100 text-gray-600 border-2 border-transparent hover:bg-gray-200"
                      }`}
                    >
                      {method.charAt(0).toUpperCase() + method.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
                <textarea
                  value={chaseNotes}
                  onChange={(e) => setChaseNotes(e.target.value)}
                  placeholder="e.g., Spoke to receptionist, referral received and being processed..."
                  rows={3}
                  className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="p-4 bg-gray-50 border-t border-gray-200 flex gap-3">
              <button
                onClick={() => setChaseModalLogId(null)}
                className="flex-1 px-4 py-3 bg-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleAddChase(chaseModalLogId)}
                disabled={!chaseNotes.trim()}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-orange-500 to-amber-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Save Chase
              </button>
            </div>
          </div>
        </div>
      )}
    </MainLayout>
  );
}
