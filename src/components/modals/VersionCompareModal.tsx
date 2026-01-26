"use client";

import { Modal } from "@/components/ui";
import { CheckCircle, XCircle, Info, Link as LinkIcon } from "lucide-react";
import Link from "next/link";

interface VersionCompareModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// Feature matrix data - Light & Medium: viewable resources only, Max+: full features
const FEATURE_CATEGORIES = [
  {
    name: "Bookmarks & Resources",
    features: [
      { name: "Public bookmarks", light: true, medium: true, max: true, maxPlus: true },
      { name: "Internal bookmarks (FOCUS required)", light: false, medium: true, max: true, maxPlus: true },
      { name: "Suggest new bookmark", light: true, medium: true, max: true, maxPlus: true },
      { name: "Report broken link", light: true, medium: true, max: true, maxPlus: true },
    ],
  },
  {
    name: "Referral Workflows",
    features: [
      { name: "Public workflows (public forms)", light: true, medium: true, max: true, maxPlus: true },
      { name: "Internal workflows (internal SOPs)", light: false, medium: true, max: true, maxPlus: true },
      { name: "Clipboard copy for notes", light: true, medium: true, max: true, maxPlus: true },
      { name: "Push to SystemOne notes", light: false, medium: false, max: false, maxPlus: true },
    ],
  },
  {
    name: "How-To Guides",
    features: [
      { name: "Public guides (generic clinical)", light: true, medium: true, max: true, maxPlus: true },
      { name: "Internal SOPs (trust-specific)", light: false, medium: true, max: true, maxPlus: true },
    ],
  },
  {
    name: "Ward Diary & Tasks",
    features: [
      { name: "Ward tasks", light: false, medium: false, max: true, maxPlus: true },
      { name: "Patient tasks", light: false, medium: false, max: true, maxPlus: true },
      { name: "Appointments", light: false, medium: false, max: true, maxPlus: true },
      { name: "My Tasks view", light: false, medium: false, max: true, maxPlus: true },
      { name: "Calendar view", light: false, medium: false, max: true, maxPlus: true },
      { name: "Sync with SystemOne Tasks", light: false, medium: false, max: false, maxPlus: true },
    ],
  },
  {
    name: "Patient List",
    features: [
      { name: "View patients", light: false, medium: false, max: true, maxPlus: true },
      { name: "Activity log", light: false, medium: false, max: true, maxPlus: true },
      { name: "Discharge flow", light: false, medium: false, max: true, maxPlus: true },
      { name: "SystemOne patient lookup", light: false, medium: false, max: false, maxPlus: true },
    ],
  },
  {
    name: "Authentication & Data",
    features: [
      { name: "Demo login (name/role picker)", light: true, medium: false, max: false, maxPlus: false },
      { name: "Trust authentication", light: false, medium: true, max: true, maxPlus: true },
      { name: "Local storage only", light: true, medium: false, max: false, maxPlus: false },
      { name: "Database persistence", light: false, medium: true, max: true, maxPlus: true },
    ],
  },
];

const FeatureIcon = ({ available }: { available: boolean }) => (
  available ? (
    <CheckCircle className="w-4 h-4 text-green-600" />
  ) : (
    <XCircle className="w-4 h-4 text-gray-300" />
  )
);

export function VersionCompareModal({ isOpen, onClose }: VersionCompareModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Compare Versions">
      <div className="space-y-6">
        {/* Version overview */}
        <div className="grid grid-cols-4 gap-2 text-center">
          <div className="p-3 bg-green-50 rounded-lg border-2 border-green-200">
            <p className="text-2xl mb-1">🌱</p>
            <p className="font-bold text-green-800">Light</p>
            <p className="text-xs text-green-600">Public resources</p>
          </div>
          <div className="p-3 bg-blue-50 rounded-lg border-2 border-blue-200">
            <p className="text-2xl mb-1">🌿</p>
            <p className="font-bold text-blue-800">Medium</p>
            <p className="text-xs text-blue-600">+ Internal content</p>
          </div>
          <div className="p-3 bg-purple-50 rounded-lg border-2 border-purple-200">
            <p className="text-2xl mb-1">🌳</p>
            <p className="font-bold text-purple-800">Max</p>
            <p className="text-xs text-purple-600">+ Diary & Patients</p>
          </div>
          <div className="p-3 bg-amber-50 rounded-lg border-2 border-amber-200">
            <p className="text-2xl mb-1">🚀</p>
            <p className="font-bold text-amber-800">Max+</p>
            <p className="text-xs text-amber-600">+ SystemOne API</p>
          </div>
        </div>

        {/* Feature table */}
        <div className="max-h-[400px] overflow-y-auto">
          <table className="w-full text-sm">
            <thead className="sticky top-0 bg-white">
              <tr className="border-b-2 border-gray-200">
                <th className="text-left py-2 px-2 font-semibold text-gray-700">Feature</th>
                <th className="text-center py-2 px-1 font-semibold text-green-700">🌱</th>
                <th className="text-center py-2 px-1 font-semibold text-blue-700">🌿</th>
                <th className="text-center py-2 px-1 font-semibold text-purple-700">🌳</th>
                <th className="text-center py-2 px-1 font-semibold text-amber-700">🚀</th>
              </tr>
            </thead>
            <tbody>
              {FEATURE_CATEGORIES.map((category) => (
                <>
                  <tr key={category.name} className="bg-gray-50">
                    <td colSpan={5} className="py-2 px-2 font-bold text-gray-800">
                      {category.name}
                    </td>
                  </tr>
                  {category.features.map((feature) => (
                    <tr key={feature.name} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-2 px-2 text-gray-600">{feature.name}</td>
                      <td className="text-center py-2 px-1"><FeatureIcon available={feature.light} /></td>
                      <td className="text-center py-2 px-1"><FeatureIcon available={feature.medium} /></td>
                      <td className="text-center py-2 px-1"><FeatureIcon available={feature.max} /></td>
                      <td className="text-center py-2 px-1"><FeatureIcon available={feature.maxPlus} /></td>
                    </tr>
                  ))}
                </>
              ))}
            </tbody>
          </table>
        </div>

        {/* Demo limitations notice */}
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-amber-800 mb-1">Demo Limitations</p>
              <ul className="text-sm text-amber-700 space-y-1">
                <li>• This is a demonstration with fictional data only</li>
                <li>• No real patient information is stored or displayed</li>
                <li>• All staff names (Staff_A, etc.) are for testing purposes</li>
                <li>• Version switching simulates different deployment tiers</li>
                <li>• Internal phone numbers use placeholders</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Links */}
        <div className="flex items-center justify-between pt-2 border-t border-gray-200">
          <Link
            href="/gdpr"
            className="flex items-center gap-2 text-sm text-indigo-600 hover:text-indigo-800 font-medium"
            onClick={onClose}
          >
            <LinkIcon className="w-4 h-4" />
            GDPR & Data Sources
          </Link>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-semibold transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </Modal>
  );
}
