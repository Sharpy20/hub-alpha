"use client";

import { useState, useEffect } from "react";
import { MainLayout } from "@/components/layout";
import { useApp } from "@/app/providers";
import { useWardSettings } from "@/app/ward-settings-provider";
import {
  Settings,
  Users,
  Calendar,
  Building2,
  ClipboardCheck,
  Bookmark,
  Plus,
  Trash2,
  Save,
  ChevronRight,
  AlertTriangle,
  Check,
  X,
} from "lucide-react";
import {
  WardSettings,
  PatientEntryMode,
  FieldVisibility,
  RoomConfig,
  DischargeChecklistItem,
  AutoAssignRule,
  TaskCategoryConfig,
  UserRole,
  DEFAULT_WARD_SETTINGS,
} from "@/lib/types";
import { ALERTS_POOL } from "@/lib/data/tasks";
import { toast } from "sonner";

type TabId = "patients" | "tasks" | "shifts" | "layout" | "discharge" | "content";

const TABS: { id: TabId; label: string; icon: React.ReactNode }[] = [
  { id: "patients", label: "Patients", icon: <Users className="w-4 h-4" /> },
  { id: "tasks", label: "Tasks", icon: <ClipboardCheck className="w-4 h-4" /> },
  { id: "shifts", label: "Shifts", icon: <Calendar className="w-4 h-4" /> },
  { id: "layout", label: "Ward Layout", icon: <Building2 className="w-4 h-4" /> },
  { id: "discharge", label: "Discharge", icon: <ChevronRight className="w-4 h-4" /> },
  { id: "content", label: "Pinned Content", icon: <Bookmark className="w-4 h-4" /> },
];

const FIELD_VISIBILITY_OPTIONS: { value: FieldVisibility; label: string }[] = [
  { value: "hidden", label: "Hidden" },
  { value: "optional", label: "Optional" },
  { value: "mandatory", label: "Mandatory" },
];

const PATIENT_ENTRY_MODES: { value: PatientEntryMode; label: string; description: string }[] = [
  { value: "simple", label: "Simple Only", description: "Users can only use simple mode (name only)" },
  { value: "advanced", label: "Advanced Only", description: "Users must fill all visible fields" },
  { value: "choice", label: "User Choice", description: "Users can toggle between simple and advanced" },
];

const ROLES: { value: UserRole; label: string }[] = [
  { value: "normal", label: "Normal User" },
  { value: "ward_admin", label: "Ward Admin" },
  { value: "contributor", label: "Contributor" },
  { value: "senior_admin", label: "Senior Admin" },
];

export default function WardSettingsPage() {
  const { user, hasFeature, activeWard } = useApp();
  const { getWardSettings, updateWardSettings } = useWardSettings();
  const [activeTab, setActiveTab] = useState<TabId>("patients");
  const [localSettings, setLocalSettings] = useState<WardSettings | null>(null);
  const [hasChanges, setHasChanges] = useState(false);

  // Load settings when ward changes
  useEffect(() => {
    const settings = getWardSettings(activeWard);
    setLocalSettings(settings);
    setHasChanges(false);
  }, [activeWard, getWardSettings]);

  // Check if user has admin access
  const isAdmin = user?.role === "ward_admin" || user?.role === "senior_admin";

  if (!hasFeature("ward_tasks")) {
    return (
      <MainLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-6">
            <Settings className="w-10 h-10 text-gray-400" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Ward Settings</h1>
          <p className="text-gray-600 max-w-md">
            Ward settings are available in Max and Max+ versions only.
          </p>
        </div>
      </MainLayout>
    );
  }

  if (!isAdmin) {
    return (
      <MainLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
          <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mb-6">
            <AlertTriangle className="w-10 h-10 text-amber-500" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Admin Access Required</h1>
          <p className="text-gray-600 max-w-md">
            Only Ward Admins and Senior Admins can access ward settings.
          </p>
        </div>
      </MainLayout>
    );
  }

  if (!localSettings) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      </MainLayout>
    );
  }

  const updateLocal = (updates: Partial<WardSettings>) => {
    setLocalSettings((prev) => prev ? { ...prev, ...updates } : prev);
    setHasChanges(true);
  };

  const handleSave = () => {
    if (localSettings) {
      updateWardSettings(activeWard, localSettings);
      setHasChanges(false);
      toast.success("Ward settings saved");
    }
  };

  const handleReset = () => {
    setLocalSettings({ ...DEFAULT_WARD_SETTINGS, wardId: activeWard.toLowerCase() });
    setHasChanges(true);
    toast.info("Settings reset to defaults (save to apply)");
  };

  // Render tab content
  const renderTabContent = () => {
    switch (activeTab) {
      case "patients":
        return <PatientsTab settings={localSettings} updateSettings={updateLocal} />;
      case "tasks":
        return <TasksTab settings={localSettings} updateSettings={updateLocal} />;
      case "shifts":
        return <ShiftsTab settings={localSettings} updateSettings={updateLocal} />;
      case "layout":
        return <LayoutTab settings={localSettings} updateSettings={updateLocal} />;
      case "discharge":
        return <DischargeTab settings={localSettings} updateSettings={updateLocal} />;
      case "content":
        return <ContentTab settings={localSettings} updateSettings={updateLocal} />;
      default:
        return null;
    }
  };

  return (
    <MainLayout>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
                <Settings className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Ward Settings</h1>
                <p className="text-gray-600">{activeWard.charAt(0).toUpperCase() + activeWard.slice(1)} Ward</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={handleReset}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Reset to Defaults
              </button>
              <button
                onClick={handleSave}
                disabled={!hasChanges}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl font-semibold transition-all ${
                  hasChanges
                    ? "bg-green-500 text-white hover:bg-green-600"
                    : "bg-gray-200 text-gray-400 cursor-not-allowed"
                }`}
              >
                <Save className="w-4 h-4" />
                Save Changes
              </button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium whitespace-nowrap transition-all ${
                activeTab === tab.id
                  ? "bg-indigo-100 text-indigo-700"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          {renderTabContent()}
        </div>
      </div>
    </MainLayout>
  );
}

// ============================================
// TAB COMPONENTS
// ============================================

function PatientsTab({
  settings,
  updateSettings,
}: {
  settings: WardSettings;
  updateSettings: (updates: Partial<WardSettings>) => void;
}) {
  const [newAlert, setNewAlert] = useState("");

  const addCustomAlert = () => {
    if (newAlert.trim() && !settings.customAlerts.includes(newAlert.trim())) {
      updateSettings({
        customAlerts: [...settings.customAlerts, newAlert.trim()],
      });
      setNewAlert("");
    }
  };

  const removeCustomAlert = (alert: string) => {
    updateSettings({
      customAlerts: settings.customAlerts.filter((a) => a !== alert),
    });
  };

  return (
    <div className="space-y-8">
      {/* Entry Mode */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Patient Entry Mode</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {PATIENT_ENTRY_MODES.map((mode) => (
            <button
              key={mode.value}
              onClick={() => updateSettings({ patientEntryMode: mode.value })}
              className={`p-4 rounded-xl border-2 text-left transition-all ${
                settings.patientEntryMode === mode.value
                  ? "border-indigo-500 bg-indigo-50"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold text-gray-900">{mode.label}</span>
                {settings.patientEntryMode === mode.value && (
                  <Check className="w-5 h-5 text-indigo-600" />
                )}
              </div>
              <p className="text-sm text-gray-600">{mode.description}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Field Visibility */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Field Visibility (Advanced Mode)</h3>
        <div className="space-y-3">
          {(["room", "bed", "legalStatus", "alerts"] as const).map((field) => (
            <div key={field} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
              <span className="font-medium text-gray-700 capitalize">
                {field === "legalStatus" ? "MHA Status" : field}
              </span>
              <div className="flex gap-2">
                {FIELD_VISIBILITY_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() =>
                      updateSettings({
                        patientFields: { ...settings.patientFields, [field]: opt.value },
                      })
                    }
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                      settings.patientFields[field] === opt.value
                        ? "bg-indigo-500 text-white"
                        : "bg-white text-gray-600 border border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Custom Alerts */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Custom Alerts for Ward</h3>
        <p className="text-sm text-gray-600 mb-4">
          Add ward-specific alerts in addition to the standard alerts.
        </p>

        {/* Add new alert */}
        <div className="flex gap-2 mb-4">
          <input
            type="text"
            value={newAlert}
            onChange={(e) => setNewAlert(e.target.value)}
            placeholder="Enter custom alert..."
            className="flex-1 p-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:outline-none"
            onKeyDown={(e) => e.key === "Enter" && addCustomAlert()}
          />
          <button
            onClick={addCustomAlert}
            disabled={!newAlert.trim()}
            className="px-4 py-2 bg-indigo-500 text-white rounded-xl font-medium hover:bg-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>

        {/* Custom alerts list */}
        {settings.customAlerts.length > 0 && (
          <div className="space-y-2 mb-4">
            <p className="text-sm font-medium text-gray-700">Custom alerts:</p>
            <div className="flex flex-wrap gap-2">
              {settings.customAlerts.map((alert) => (
                <span
                  key={alert}
                  className="flex items-center gap-2 px-3 py-1.5 bg-amber-100 text-amber-800 rounded-full text-sm"
                >
                  {alert}
                  <button
                    onClick={() => removeCustomAlert(alert)}
                    className="hover:text-red-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Standard alerts (read-only) */}
        <div>
          <p className="text-sm font-medium text-gray-700 mb-2">Standard alerts (always available):</p>
          <div className="flex flex-wrap gap-2">
            {ALERTS_POOL.map((alert) => (
              <span
                key={alert}
                className="px-3 py-1.5 bg-gray-100 text-gray-600 rounded-full text-sm"
              >
                {alert}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function TasksTab({
  settings,
  updateSettings,
}: {
  settings: WardSettings;
  updateSettings: (updates: Partial<WardSettings>) => void;
}) {
  const toggleCategory = (category: string, field: "enabled" | "carryOver") => {
    updateSettings({
      taskCategories: settings.taskCategories.map((cat) =>
        cat.category === category ? { ...cat, [field]: !cat[field] } : cat
      ),
    });
  };

  const addAutoAssignRule = () => {
    const newRule: AutoAssignRule = {
      id: `rule-${Date.now()}`,
      taskType: "patient",
      assignTo: "named_nurse",
    };
    updateSettings({
      autoAssignRules: [...settings.autoAssignRules, newRule],
    });
  };

  const updateAutoAssignRule = (id: string, updates: Partial<AutoAssignRule>) => {
    updateSettings({
      autoAssignRules: settings.autoAssignRules.map((rule) =>
        rule.id === id ? { ...rule, ...updates } : rule
      ),
    });
  };

  const removeAutoAssignRule = (id: string) => {
    updateSettings({
      autoAssignRules: settings.autoAssignRules.filter((rule) => rule.id !== id),
    });
  };

  return (
    <div className="space-y-8">
      {/* Task Categories */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Task Categories</h3>
        <div className="space-y-2">
          {settings.taskCategories.map((cat) => (
            <div
              key={cat.category}
              className="flex items-center justify-between p-4 bg-gray-50 rounded-xl"
            >
              <span className="font-medium text-gray-700 capitalize">{cat.category}</span>
              <div className="flex items-center gap-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={cat.enabled}
                    onChange={() => toggleCategory(cat.category, "enabled")}
                    className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="text-sm text-gray-600">Enabled</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={cat.carryOver}
                    onChange={() => toggleCategory(cat.category, "carryOver")}
                    className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="text-sm text-gray-600">Carry Over</span>
                </label>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Task Field Requirements */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Task Field Requirements</h3>
        <div className="space-y-3">
          {(["patientLink", "priority", "category"] as const).map((field) => (
            <div key={field} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
              <span className="font-medium text-gray-700">
                {field === "patientLink" ? "Link to Patient" : field.charAt(0).toUpperCase() + field.slice(1)}
              </span>
              <div className="flex gap-2">
                {FIELD_VISIBILITY_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() =>
                      updateSettings({
                        taskFieldRequirements: { ...settings.taskFieldRequirements, [field]: opt.value },
                      })
                    }
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                      settings.taskFieldRequirements[field] === opt.value
                        ? "bg-indigo-500 text-white"
                        : "bg-white text-gray-600 border border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Auto-Assign Rules */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Auto-Assign Rules</h3>
          <button
            onClick={addAutoAssignRule}
            className="flex items-center gap-2 px-3 py-2 bg-indigo-100 text-indigo-700 rounded-lg font-medium hover:bg-indigo-200"
          >
            <Plus className="w-4 h-4" />
            Add Rule
          </button>
        </div>

        {settings.autoAssignRules.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No auto-assign rules configured</p>
        ) : (
          <div className="space-y-3">
            {settings.autoAssignRules.map((rule) => (
              <div key={rule.id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                <select
                  value={rule.taskType}
                  onChange={(e) => updateAutoAssignRule(rule.id, { taskType: e.target.value as "patient" | "appointment" })}
                  className="p-2 border border-gray-200 rounded-lg"
                >
                  <option value="patient">Patient Tasks</option>
                  <option value="appointment">Appointments</option>
                </select>
                <span className="text-gray-500">assign to</span>
                <select
                  value={rule.assignTo}
                  onChange={(e) => updateAutoAssignRule(rule.id, { assignTo: e.target.value as AutoAssignRule["assignTo"] })}
                  className="p-2 border border-gray-200 rounded-lg"
                >
                  <option value="named_nurse">Named Nurse</option>
                  <option value="consultant">Consultant</option>
                  <option value="creator">Task Creator</option>
                  <option value="unassigned">Leave Unassigned</option>
                </select>
                <button
                  onClick={() => removeAutoAssignRule(rule.id)}
                  className="p-2 text-red-500 hover:bg-red-100 rounded-lg ml-auto"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function ShiftsTab({
  settings,
  updateSettings,
}: {
  settings: WardSettings;
  updateSettings: (updates: Partial<WardSettings>) => void;
}) {
  const updateShiftTime = (shift: "early" | "late" | "night", field: "start" | "end", value: string) => {
    updateSettings({
      shifts: {
        ...settings.shifts,
        [shift]: { ...settings.shifts[shift], [field]: value },
      },
    });
  };

  return (
    <div className="space-y-8">
      {/* Shift Times */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Shift Times</h3>
        <div className="space-y-4">
          {(["early", "late", "night"] as const).map((shift) => (
            <div key={shift} className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
              <div className="w-24">
                <span className="font-medium text-gray-700 capitalize">{shift}</span>
              </div>
              <div className="flex items-center gap-2">
                <label className="text-sm text-gray-600">Start:</label>
                <input
                  type="time"
                  value={settings.shifts[shift].start}
                  onChange={(e) => updateShiftTime(shift, "start", e.target.value)}
                  className="p-2 border border-gray-200 rounded-lg"
                />
              </div>
              <div className="flex items-center gap-2">
                <label className="text-sm text-gray-600">End:</label>
                <input
                  type="time"
                  value={settings.shifts[shift].end}
                  onChange={(e) => updateShiftTime(shift, "end", e.target.value)}
                  className="p-2 border border-gray-200 rounded-lg"
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Shift Defaults Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <p className="text-sm text-blue-700">
          <strong>Shift Task Defaults:</strong> Configure which recurring tasks appear by default for each shift.
          This feature will be available in a future update.
        </p>
      </div>
    </div>
  );
}

function LayoutTab({
  settings,
  updateSettings,
}: {
  settings: WardSettings;
  updateSettings: (updates: Partial<WardSettings>) => void;
}) {
  const [newRoomName, setNewRoomName] = useState("");
  const [newRoomBeds, setNewRoomBeds] = useState("A,B");

  const addRoom = () => {
    if (newRoomName.trim()) {
      const newRoom: RoomConfig = {
        id: `room-${Date.now()}`,
        name: newRoomName.trim(),
        beds: newRoomBeds.split(",").map((b) => b.trim()).filter(Boolean),
      };
      updateSettings({
        rooms: [...settings.rooms, newRoom],
      });
      setNewRoomName("");
      setNewRoomBeds("A,B");
    }
  };

  const removeRoom = (id: string) => {
    updateSettings({
      rooms: settings.rooms.filter((r) => r.id !== id),
    });
  };

  return (
    <div className="space-y-8">
      {/* Capacity */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Ward Capacity</h3>
        <div className="flex items-center gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Total Beds</label>
            <input
              type="number"
              value={settings.capacity}
              onChange={(e) => updateSettings({ capacity: parseInt(e.target.value) || 0 })}
              className="w-24 p-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:outline-none"
              min={1}
            />
          </div>
          <label className="flex items-center gap-2 cursor-pointer mt-6">
            <input
              type="checkbox"
              checked={settings.showCapacityOnList}
              onChange={(e) => updateSettings({ showCapacityOnList: e.target.checked })}
              className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
            />
            <span className="text-sm text-gray-600">Show capacity on patient list</span>
          </label>
        </div>
      </div>

      {/* Rooms */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Room Configuration</h3>

        {/* Add new room */}
        <div className="flex gap-2 mb-4">
          <input
            type="text"
            value={newRoomName}
            onChange={(e) => setNewRoomName(e.target.value)}
            placeholder="Room name (e.g., Room 101)"
            className="flex-1 p-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:outline-none"
          />
          <input
            type="text"
            value={newRoomBeds}
            onChange={(e) => setNewRoomBeds(e.target.value)}
            placeholder="Beds (comma separated)"
            className="w-40 p-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:outline-none"
          />
          <button
            onClick={addRoom}
            disabled={!newRoomName.trim()}
            className="px-4 py-2 bg-indigo-500 text-white rounded-xl font-medium hover:bg-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>

        {/* Rooms list */}
        {settings.rooms.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No rooms configured. Add rooms above.</p>
        ) : (
          <div className="space-y-2">
            {settings.rooms.map((room) => (
              <div key={room.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                <div>
                  <span className="font-medium text-gray-700">{room.name}</span>
                  <span className="text-gray-500 ml-2">
                    Beds: {room.beds.length > 0 ? room.beds.join(", ") : "None"}
                  </span>
                </div>
                <button
                  onClick={() => removeRoom(room.id)}
                  className="p-2 text-red-500 hover:bg-red-100 rounded-lg"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function DischargeTab({
  settings,
  updateSettings,
}: {
  settings: WardSettings;
  updateSettings: (updates: Partial<WardSettings>) => void;
}) {
  const [newItemLabel, setNewItemLabel] = useState("");

  const addChecklistItem = () => {
    if (newItemLabel.trim()) {
      const newItem: DischargeChecklistItem = {
        id: `dc-${Date.now()}`,
        label: newItemLabel.trim(),
        required: false,
      };
      updateSettings({
        dischargeChecklist: [...settings.dischargeChecklist, newItem],
      });
      setNewItemLabel("");
    }
  };

  const toggleItemRequired = (id: string) => {
    updateSettings({
      dischargeChecklist: settings.dischargeChecklist.map((item) =>
        item.id === id ? { ...item, required: !item.required } : item
      ),
    });
  };

  const removeChecklistItem = (id: string) => {
    updateSettings({
      dischargeChecklist: settings.dischargeChecklist.filter((item) => item.id !== id),
    });
  };

  const toggleRole = (roleList: "dischargeInitiateRoles" | "dischargeApproveRoles", role: UserRole) => {
    const currentRoles = settings[roleList];
    const newRoles = currentRoles.includes(role)
      ? currentRoles.filter((r) => r !== role)
      : [...currentRoles, role];
    updateSettings({ [roleList]: newRoles });
  };

  return (
    <div className="space-y-8">
      {/* Discharge Checklist */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Discharge Checklist</h3>

        {/* Add new item */}
        <div className="flex gap-2 mb-4">
          <input
            type="text"
            value={newItemLabel}
            onChange={(e) => setNewItemLabel(e.target.value)}
            placeholder="Add checklist item..."
            className="flex-1 p-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:outline-none"
            onKeyDown={(e) => e.key === "Enter" && addChecklistItem()}
          />
          <button
            onClick={addChecklistItem}
            disabled={!newItemLabel.trim()}
            className="px-4 py-2 bg-indigo-500 text-white rounded-xl font-medium hover:bg-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>

        {/* Checklist items */}
        <div className="space-y-2">
          {settings.dischargeChecklist.map((item) => (
            <div key={item.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
              <span className="font-medium text-gray-700">{item.label}</span>
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={item.required}
                    onChange={() => toggleItemRequired(item.id)}
                    className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="text-sm text-gray-600">Required</span>
                </label>
                <button
                  onClick={() => removeChecklistItem(item.id)}
                  className="p-2 text-red-500 hover:bg-red-100 rounded-lg"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Role Permissions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Who Can Initiate Discharge</h3>
          <div className="space-y-2">
            {ROLES.map((role) => (
              <label key={role.value} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.dischargeInitiateRoles.includes(role.value)}
                  onChange={() => toggleRole("dischargeInitiateRoles", role.value)}
                  className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />
                <span className="text-gray-700">{role.label}</span>
              </label>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Who Can Approve Discharge</h3>
          <div className="space-y-2">
            {ROLES.map((role) => (
              <label key={role.value} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.dischargeApproveRoles.includes(role.value)}
                  onChange={() => toggleRole("dischargeApproveRoles", role.value)}
                  className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />
                <span className="text-gray-700">{role.label}</span>
              </label>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function ContentTab({
  settings,
  updateSettings,
}: {
  settings: WardSettings;
  updateSettings: (updates: Partial<WardSettings>) => void;
}) {
  const [newLinkTitle, setNewLinkTitle] = useState("");
  const [newLinkUrl, setNewLinkUrl] = useState("");
  const [newLinkIcon, setNewLinkIcon] = useState("🔗");

  const addQuickLink = () => {
    if (newLinkTitle.trim() && newLinkUrl.trim()) {
      updateSettings({
        customQuickLinks: [
          ...settings.customQuickLinks,
          {
            id: `link-${Date.now()}`,
            title: newLinkTitle.trim(),
            url: newLinkUrl.trim(),
            icon: newLinkIcon,
          },
        ],
      });
      setNewLinkTitle("");
      setNewLinkUrl("");
      setNewLinkIcon("🔗");
    }
  };

  const removeQuickLink = (id: string) => {
    updateSettings({
      customQuickLinks: settings.customQuickLinks.filter((link) => link.id !== id),
    });
  };

  return (
    <div className="space-y-8">
      {/* Pinned Workflows */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Pinned Referral Workflows</h3>
        <p className="text-sm text-gray-600 mb-4">
          Select workflows to pin to the ward&apos;s home page quick actions.
        </p>
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <p className="text-sm text-blue-700">
            Workflow pinning will be available once workflows are loaded. For now, workflows appear in the standard order.
          </p>
        </div>
      </div>

      {/* Custom Quick Links */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Custom Quick Links</h3>
        <p className="text-sm text-gray-600 mb-4">
          Add ward-specific links that will appear in quick actions.
        </p>

        {/* Add new link */}
        <div className="flex gap-2 mb-4">
          <input
            type="text"
            value={newLinkIcon}
            onChange={(e) => setNewLinkIcon(e.target.value)}
            className="w-16 p-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:outline-none text-center text-xl"
            maxLength={2}
          />
          <input
            type="text"
            value={newLinkTitle}
            onChange={(e) => setNewLinkTitle(e.target.value)}
            placeholder="Link title"
            className="flex-1 p-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:outline-none"
          />
          <input
            type="text"
            value={newLinkUrl}
            onChange={(e) => setNewLinkUrl(e.target.value)}
            placeholder="URL"
            className="flex-1 p-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:outline-none"
          />
          <button
            onClick={addQuickLink}
            disabled={!newLinkTitle.trim() || !newLinkUrl.trim()}
            className="px-4 py-2 bg-indigo-500 text-white rounded-xl font-medium hover:bg-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>

        {/* Quick links list */}
        {settings.customQuickLinks.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No custom quick links. Add some above.</p>
        ) : (
          <div className="space-y-2">
            {settings.customQuickLinks.map((link) => (
              <div key={link.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{link.icon}</span>
                  <div>
                    <span className="font-medium text-gray-700">{link.title}</span>
                    <p className="text-sm text-gray-500 truncate max-w-xs">{link.url}</p>
                  </div>
                </div>
                <button
                  onClick={() => removeQuickLink(link.id)}
                  className="p-2 text-red-500 hover:bg-red-100 rounded-lg"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
