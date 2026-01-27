"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock, AlertCircle } from "lucide-react";

export default function PasswordPage() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/auth/verify-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      const data = await response.json();

      if (data.success) {
        router.push("/");
        router.refresh();
      } else {
        setError(data.error || "Incorrect password");
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-nhs-pale-grey to-white flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-lg shadow-lg p-8">
          {/* Logo/Title */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-nhs-blue/10 mb-4">
              <Lock className="w-8 h-8 text-nhs-blue" />
            </div>
            <h1 className="text-2xl font-bold text-nhs-blue">Inpatient Hub</h1>
            <p className="text-nhs-dark-grey mt-2">
              Early Testing Access
            </p>
          </div>

          {/* Password Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-nhs-dark-grey mb-1"
              >
                Access Password
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border border-nhs-mid-grey rounded-md focus:outline-none focus:ring-2 focus:ring-nhs-blue focus:border-transparent"
                placeholder="Enter password"
                required
                autoFocus
              />
            </div>

            {error && (
              <div className="flex items-center gap-2 text-nhs-red text-sm">
                <AlertCircle className="w-4 h-4" />
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !password}
              className="w-full py-3 px-4 bg-nhs-blue text-white font-semibold rounded-md hover:bg-nhs-dark-blue transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Checking..." : "Enter"}
            </button>
          </form>

          {/* Info */}
          <p className="text-center text-sm text-nhs-mid-grey mt-6">
            This site is in early testing. Contact Mike for access.
          </p>
        </div>
      </div>
    </div>
  );
}
