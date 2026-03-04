"use client";

// Styled React div mockups simulating app screenshots — no image files needed

export function DiaryMockup() {
  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden max-w-md mx-auto">
      <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-3 text-white text-center">
        <p className="font-bold text-sm">Ward Diary — Byron Ward</p>
        <p className="text-xs text-white/70">Week View</p>
      </div>
      <div className="grid grid-cols-3 gap-px bg-gray-200">
        {["Yesterday", "Today", "Tomorrow"].map((day) => (
          <div key={day} className="bg-white p-2">
            <p className="text-xs font-bold text-center text-gray-500 mb-2">{day}</p>
            <div className="space-y-1.5">
              <div className="p-1.5 bg-amber-50 rounded border-l-2 border-amber-400">
                <p className="text-[10px] font-semibold text-amber-800">🌡️ Fridge temps</p>
                <p className="text-[9px] text-amber-600">Early · Routine</p>
              </div>
              <div className="p-1.5 bg-indigo-50 rounded border-l-2 border-indigo-400">
                <p className="text-[10px] font-semibold text-indigo-800">📋 IMHA Referral</p>
                <p className="text-[9px] text-indigo-600">Alex M · Patient Task</p>
              </div>
              {day === "Today" && (
                <div className="p-1.5 bg-green-50 rounded border-l-2 border-green-400">
                  <p className="text-[10px] font-semibold text-green-800">📅 Tribunal</p>
                  <p className="text-[9px] text-green-600">14:00 · Room 3</p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function AddTaskMockup() {
  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden max-w-sm mx-auto">
      <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-3 text-white">
        <p className="font-bold text-sm">Add Patient Task</p>
      </div>
      <div className="p-4 space-y-3">
        <div>
          <label className="text-xs font-semibold text-gray-500">Task Title</label>
          <div className="mt-1 p-2 bg-gray-50 rounded border border-gray-200 text-sm">Chase IMHA referral</div>
        </div>
        <div>
          <label className="text-xs font-semibold text-gray-500">Patient</label>
          <div className="mt-1 p-2 bg-blue-50 rounded border border-blue-200 text-sm text-blue-700">Alex Morgan — Room 4</div>
        </div>
        <div>
          <label className="text-xs font-semibold text-gray-500">Link a Referral</label>
          <div className="mt-1 p-2 bg-indigo-50 rounded border border-indigo-200 text-sm text-indigo-700 flex items-center gap-2">
            <span>📋</span> IMHA / Advocacy Referral
          </div>
        </div>
        <button className="w-full py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg font-semibold text-sm">
          Create Task
        </button>
      </div>
    </div>
  );
}

export function AppointmentMockup() {
  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden max-w-sm mx-auto">
      <div className="bg-gradient-to-r from-purple-500 to-indigo-600 p-3 text-white">
        <p className="font-bold text-sm">Add Appointment</p>
      </div>
      <div className="p-4 space-y-3">
        <div>
          <label className="text-xs font-semibold text-gray-500">Title</label>
          <div className="mt-1 p-2 bg-gray-50 rounded border border-gray-200 text-sm">Section 117 Meeting</div>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-xs font-semibold text-gray-500">Date</label>
            <div className="mt-1 p-2 bg-gray-50 rounded border border-gray-200 text-sm">12 Mar 2026</div>
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-500">Time</label>
            <div className="mt-1 p-2 bg-gray-50 rounded border border-gray-200 text-sm">14:00</div>
          </div>
        </div>
        <div>
          <label className="text-xs font-semibold text-gray-500">Patient</label>
          <div className="mt-1 p-2 bg-blue-50 rounded border border-blue-200 text-sm text-blue-700">Alex Morgan</div>
        </div>
        <div>
          <label className="text-xs font-semibold text-gray-500">Linked Referral</label>
          <div className="mt-1 p-2 bg-indigo-50 rounded border border-indigo-200 text-sm text-indigo-700 flex items-center gap-2">
            <span>📋</span> Section 117 Aftercare
          </div>
        </div>
      </div>
    </div>
  );
}

export function NexusBadgeMockup({ completed = false }: { completed?: boolean }) {
  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden max-w-sm mx-auto">
      <div className={`p-3 ${completed ? "bg-gradient-to-r from-green-500 to-emerald-600" : "bg-gradient-to-r from-amber-500 to-orange-600"} text-white text-center`}>
        <p className="font-bold text-sm">{completed ? "Task Auto-Completed" : "Daily Audit Task"}</p>
      </div>
      <div className="p-4">
        <div className={`p-3 rounded-xl border-2 ${completed ? "border-green-300 bg-green-50" : "border-amber-200 bg-amber-50"}`}>
          <div className="flex items-center justify-between mb-2">
            <span className="font-bold text-sm">🌡️ Fridge temperature check</span>
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${completed ? "bg-green-200 text-green-800" : "bg-amber-200 text-amber-800"}`}>
              {completed ? "✅ Complete" : "⏳ Pending"}
            </span>
          </div>
          <p className="text-xs text-gray-600 mb-2">Early shift · Routine priority</p>
          <div className="flex items-center gap-2">
            <span className="text-xs px-2 py-0.5 bg-purple-100 text-purple-700 rounded-full font-medium flex items-center gap-1">
              🔗 Nexus Linked
            </span>
            {completed && (
              <span className="text-xs text-green-600 font-medium">Completed via Nexus at 08:15</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export function KanbanMockup() {
  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden max-w-lg mx-auto">
      <div className="bg-gradient-to-r from-purple-500 to-indigo-600 p-3 text-white text-center">
        <p className="font-bold text-sm">My Tasks — Kanban Board</p>
      </div>
      <div className="grid grid-cols-3 gap-px bg-gray-200 p-px">
        <div className="bg-gray-50 p-2">
          <p className="text-[10px] font-bold text-center text-gray-500 mb-2">📋 To Do</p>
          <div className="space-y-1.5">
            <div className="p-1.5 bg-white rounded shadow-sm border">
              <p className="text-[10px] font-semibold">Chase dietitian</p>
              <p className="text-[9px] text-gray-500">Jordan T</p>
            </div>
            <div className="p-1.5 bg-white rounded shadow-sm border">
              <p className="text-[10px] font-semibold">Book s117 mtg</p>
              <p className="text-[9px] text-gray-500">Alex M</p>
            </div>
          </div>
        </div>
        <div className="bg-blue-50/50 p-2">
          <p className="text-[10px] font-bold text-center text-blue-500 mb-2">🔄 In Progress</p>
          <div className="space-y-1.5">
            <div className="p-1.5 bg-white rounded shadow-sm border border-blue-200">
              <p className="text-[10px] font-semibold">IMHA referral</p>
              <p className="text-[9px] text-blue-600">Alex M</p>
              <div className="mt-1 flex gap-1">
                <span className="text-[8px] px-1 bg-indigo-100 text-indigo-600 rounded">📋 Linked</span>
              </div>
            </div>
          </div>
        </div>
        <div className="bg-green-50/50 p-2">
          <p className="text-[10px] font-bold text-center text-green-500 mb-2">✅ Done</p>
          <div className="space-y-1.5">
            <div className="p-1.5 bg-white rounded shadow-sm border border-green-200">
              <p className="text-[10px] font-semibold line-through text-gray-400">Fridge temps</p>
              <p className="text-[9px] text-green-600">Nexus ✓</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function GdprMockup() {
  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden max-w-sm mx-auto">
      <div className="bg-gradient-to-r from-slate-600 to-slate-800 p-3 text-white text-center">
        <p className="font-bold text-sm">🔒 Data Storage</p>
      </div>
      <div className="p-4 space-y-3">
        <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-sm font-semibold text-blue-800 mb-1">What we store</p>
          <ul className="text-xs text-blue-700 space-y-1">
            <li>• Patient name & ward</li>
            <li>• Named professional</li>
            <li>• Task titles & dates</li>
          </ul>
        </div>
        <div className="p-3 bg-green-50 rounded-lg border border-green-200">
          <p className="text-sm font-semibold text-green-800 mb-1">On discharge</p>
          <ul className="text-xs text-green-700 space-y-1">
            <li>• All data compiled into single document</li>
            <li>• Stored in patient record</li>
            <li>• Removed from live system</li>
          </ul>
        </div>
        <div className="p-3 bg-amber-50 rounded-lg border border-amber-200">
          <p className="text-xs text-amber-700">
            <strong>No clinical decisions</strong> are made by this tool. It is a reference and task management aid only.
          </p>
        </div>
      </div>
    </div>
  );
}
