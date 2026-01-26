"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useApp, UserRole } from "@/app/providers";
import { MainLayout } from "@/components/layout";
import { Button, Card, CardContent } from "@/components/ui";
import { WARDS } from "@/lib/types";
import { User, Building2, Shield, Info, Sparkles } from "lucide-react";

const ROLES: { value: UserRole; label: string; description: string; icon: string; gradient: string }[] = [
  {
    value: "normal",
    label: "Normal User",
    description: "View content, add tasks, suggest links",
    icon: "👤",
    gradient: "from-blue-500 to-blue-700",
  },
  {
    value: "ward_admin",
    label: "Ward Admin",
    description: "Manage ward, approve discharges, view logs",
    icon: "🏥",
    gradient: "from-purple-500 to-purple-700",
  },
  {
    value: "contributor",
    label: "Contributor",
    description: "Create and edit workflows and guides",
    icon: "✍️",
    gradient: "from-amber-500 to-amber-700",
  },
  {
    value: "senior_admin",
    label: "Senior Admin",
    description: "Full access, user management, approvals",
    icon: "👑",
    gradient: "from-rose-500 to-rose-700",
  },
];

const WARD_ICONS: Record<string, string> = {
  byron: "📝",
  shelley: "🌊",
  keats: "🌹",
  wordsworth: "🏔️",
  dickinson: "🦋",
};

export default function LoginPage() {
  const router = useRouter();
  const { setUser } = useApp();
  const [name, setName] = useState("");
  const [role, setRole] = useState<UserRole>("normal");
  const [ward, setWard] = useState("byron");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      setUser({
        name: name.trim(),
        role,
        ward,
      });
      router.push("/");
    }
  };

  return (
    <MainLayout>
      <div className="max-w-lg mx-auto mt-4">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 rounded-2xl p-6 mb-6 text-white">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center">
              <User className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2">
                Demo Login
                <Sparkles className="w-5 h-5" />
              </h1>
              <p className="text-white/80">Enter your details to explore the demo</p>
            </div>
          </div>
        </div>

        <Card className="overflow-hidden">
          <div className="h-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Ward selection - FIRST */}
              <div>
                <label className="block text-sm font-bold text-gray-800 mb-2">
                  <Building2 className="w-4 h-4 inline mr-1" />
                  1. Select Your Ward
                </label>
                <p className="text-xs text-gray-500 mb-3">Just pick one - it&apos;s only a demo!</p>
                <div className="grid grid-cols-5 gap-2">
                  {WARDS.map((w) => (
                    <label
                      key={w.id}
                      className={`flex flex-col items-center gap-1 p-3 border-2 rounded-xl cursor-pointer transition-all ${
                        ward === w.id
                          ? "border-purple-500 bg-purple-50 shadow-md"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <input
                        type="radio"
                        name="ward"
                        value={w.id}
                        checked={ward === w.id}
                        onChange={(e) => setWard(e.target.value)}
                        className="sr-only"
                      />
                      <span className="text-2xl">{WARD_ICONS[w.id] || "🏥"}</span>
                      <p className={`text-xs font-bold text-center ${ward === w.id ? "text-purple-700" : "text-gray-600"}`}>
                        {w.name.replace(" Ward", "")}
                      </p>
                    </label>
                  ))}
                </div>
              </div>

              {/* Name input - SECOND */}
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-bold text-gray-800 mb-2"
                >
                  <User className="w-4 h-4 inline mr-1" />
                  2. Your Name
                </label>
                <p className="text-xs text-gray-500 mb-2">Just pick one - it&apos;s only a demo!</p>
                <input
                  type="text"
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your name"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-lg"
                  required
                />
              </div>

              {/* Role selection - THIRD */}
              <div>
                <label className="block text-sm font-bold text-gray-800 mb-3">
                  <Shield className="w-4 h-4 inline mr-1" />
                  3. Select Your Role
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {ROLES.map((r) => (
                    <label
                      key={r.value}
                      className={`flex flex-col items-center gap-2 p-4 border-2 rounded-xl cursor-pointer transition-all ${
                        role === r.value
                          ? `border-transparent bg-gradient-to-br ${r.gradient} text-white shadow-lg scale-[1.02]`
                          : "border-gray-200 hover:border-gray-300 bg-white"
                      }`}
                    >
                      <input
                        type="radio"
                        name="role"
                        value={r.value}
                        checked={role === r.value}
                        onChange={(e) => setRole(e.target.value as UserRole)}
                        className="sr-only"
                      />
                      <span className="text-3xl">{r.icon}</span>
                      <div className="text-center">
                        <p className="font-bold text-sm">{r.label}</p>
                        <p className={`text-xs mt-1 ${role === r.value ? "text-white/80" : "text-gray-500"}`}>
                          {r.description}
                        </p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Info notice */}
              <div className="flex items-start gap-3 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
                <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-blue-800">
                  In the live version, access will require approval from your ward administrator.
                </p>
              </div>

              {/* Submit button */}
              <Button
                type="submit"
                className="w-full py-4 text-lg bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 hover:from-indigo-700 hover:via-purple-700 hover:to-pink-600"
                size="lg"
              >
                <Sparkles className="w-5 h-5 mr-2" />
                Enter Demo
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
