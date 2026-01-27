"use client";

import Link from "next/link";
import { useApp } from "@/app/providers";
import { Menu, X, User, LogOut, CalendarDays, ClipboardList, ChevronDown, Building2, Users, Settings, Bookmark, FileText, BookOpen, LayoutGrid, Pencil, MessageSquare, Check, HelpCircle, Sparkles, Database, CircleHelp, BarChart3 } from "lucide-react";
import { useState, useRef, useEffect } from "react";

export function Header() {
  const { user, setUser, version, setVersion, hasFeature, activeWard, setActiveWard, allWards } = useApp();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [settingsDropdownOpen, setSettingsDropdownOpen] = useState(false);
  const [savedFeedback, setSavedFeedback] = useState<string | null>(null);
  const profileDropdownRef = useRef<HTMLDivElement>(null);
  const settingsDropdownRef = useRef<HTMLDivElement>(null);

  // Handle selection changes with feedback and auto-close
  const handleWardChange = (ward: string) => {
    setActiveWard(ward);
    setSavedFeedback("Ward");
    setTimeout(() => {
      setSavedFeedback(null);
      setProfileDropdownOpen(false);
    }, 800);
  };

  const handleRoleChange = (role: "normal" | "ward_admin" | "contributor" | "senior_admin") => {
    if (user) {
      setUser({ ...user, role });
      setSavedFeedback("Role");
      setTimeout(() => {
        setSavedFeedback(null);
        setProfileDropdownOpen(false);
      }, 800);
    }
  };

  const handleVersionChange = (newVersion: "light" | "medium" | "max" | "max_plus") => {
    setVersion(newVersion);
    setSavedFeedback("Version");
    setTimeout(() => {
      setSavedFeedback(null);
      setProfileDropdownOpen(false);
    }, 800);
  };

  // Mobile handlers
  const handleMobileWardChange = (ward: string) => {
    setActiveWard(ward);
    setSavedFeedback("Ward");
    setTimeout(() => {
      setSavedFeedback(null);
      setMobileMenuOpen(false);
    }, 800);
  };

  const handleMobileRoleChange = (role: "normal" | "ward_admin" | "contributor" | "senior_admin") => {
    if (user) {
      setUser({ ...user, role });
      setSavedFeedback("Role");
      setTimeout(() => {
        setSavedFeedback(null);
        setMobileMenuOpen(false);
      }, 800);
    }
  };

  const handleMobileVersionChange = (newVersion: "light" | "medium" | "max" | "max_plus") => {
    setVersion(newVersion);
    setSavedFeedback("Version");
    setTimeout(() => {
      setSavedFeedback(null);
      setMobileMenuOpen(false);
    }, 800);
  };

  const handleLogout = () => {
    setUser(null);
    setMobileMenuOpen(false);
    setProfileDropdownOpen(false);
  };

  // Close dropdowns when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target as Node)) {
        setProfileDropdownOpen(false);
      }
      if (settingsDropdownRef.current && !settingsDropdownRef.current.contains(event.target as Node)) {
        setSettingsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const versionLabels = {
    light: { label: "Light", icon: "🌱" },
    medium: { label: "Medium", icon: "🌿" },
    max: { label: "Max", icon: "🌳" },
    max_plus: { label: "Max+", icon: "🚀" },
  };

  const roleLabels: Record<string, string> = {
    normal: "Staff",
    ward_admin: "Ward Admin",
    contributor: "Contributor",
    senior_admin: "Senior Admin",
  };

  const showTasks = hasFeature("ward_tasks");
  const showPatients = hasFeature("patient_list");
  const isViewingOtherWard = user && activeWard !== user.ward;
  const canAccessAdmin = user && (user.role === "contributor" || user.role === "senior_admin");

  return (
    <>
      {/* Skip link for accessibility - visible on focus */}
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>

      {/* Header with white/clear background */}
      <header className="bg-white sticky top-0 z-30 shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">

            {/* Logo and title - clickable to home (replaces Home link - item 18a) */}
            <Link href="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center shadow-md group-hover:shadow-lg transition-shadow">
                <span className="text-xl">🏥</span>
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-900 leading-tight group-hover:text-indigo-700 transition-colors">
                  Inpatient Hub
                </h1>
                <p className="text-xs text-gray-500">
                  Ward Resources & Referrals
                </p>
              </div>
            </Link>

            {/* Desktop nav - separate tiles with gaps (item 18c) */}
            <nav className="hidden md:flex items-center gap-2">
              {showTasks && (
                <>
                  <Link
                    href="/tasks"
                    className="px-4 py-2 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold flex items-center gap-2 transition-colors"
                  >
                    <CalendarDays className="w-4 h-4" />
                    Diary
                  </Link>
                  <Link
                    href="/my-tasks"
                    className="px-4 py-2 rounded-lg bg-purple-50 hover:bg-purple-100 text-purple-700 font-semibold flex items-center gap-2 transition-colors"
                  >
                    <ClipboardList className="w-4 h-4" />
                    Tasks
                  </Link>
                </>
              )}
              {showPatients && (
                <Link
                  href="/patients"
                  className="px-4 py-2 rounded-lg bg-teal-50 hover:bg-teal-100 text-teal-700 font-semibold flex items-center gap-2 transition-colors"
                >
                  <Users className="w-4 h-4" />
                  Patients
                </Link>
              )}
              <Link
                href="/bookmarks"
                className="px-4 py-2 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-700 font-semibold flex items-center gap-2 transition-colors"
              >
                <Bookmark className="w-4 h-4" />
                Bookmarks
              </Link>
              <Link
                href="/referrals"
                className="px-4 py-2 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 font-semibold flex items-center gap-2 transition-colors"
              >
                <FileText className="w-4 h-4" />
                Referrals
              </Link>
              <Link
                href="/how-to"
                className="px-4 py-2 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-semibold flex items-center gap-2 transition-colors"
              >
                <BookOpen className="w-4 h-4" />
                Guides
              </Link>

              {/* Settings dropdown */}
              <div className="relative" ref={settingsDropdownRef}>
                <button
                  onClick={() => setSettingsDropdownOpen(!settingsDropdownOpen)}
                  className="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold flex items-center gap-2 transition-colors"
                >
                  <Settings className="w-4 h-4" />
                  Settings
                  <ChevronDown className={`w-4 h-4 transition-transform ${settingsDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {settingsDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden z-50">
                    {/* Intro Guide */}
                    <Link
                      href="/intro-guide"
                      onClick={() => setSettingsDropdownOpen(false)}
                      className="flex items-start gap-3 p-4 hover:bg-gray-50 transition-colors border-b border-gray-100"
                    >
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center flex-shrink-0">
                        <HelpCircle className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">Intro Guide</p>
                        <p className="text-xs text-gray-500 mt-0.5">Learn how to use Inpatient Hub with visual guides and tips</p>
                      </div>
                    </Link>

                    {/* FAQ */}
                    <Link
                      href="/faq"
                      onClick={() => setSettingsDropdownOpen(false)}
                      className="flex items-start gap-3 p-4 hover:bg-gray-50 transition-colors border-b border-gray-100"
                    >
                      <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
                        <CircleHelp className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">FAQ</p>
                        <p className="text-xs text-gray-500 mt-0.5">Frequently asked questions about the app</p>
                      </div>
                    </Link>

                    {/* Feedback */}
                    <Link
                      href="/feedback"
                      onClick={() => setSettingsDropdownOpen(false)}
                      className="flex items-start gap-3 p-4 hover:bg-gray-50 transition-colors border-b border-gray-100"
                    >
                      <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-rose-500 rounded-lg flex items-center justify-center flex-shrink-0">
                        <MessageSquare className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">Feedback</p>
                        <p className="text-xs text-gray-500 mt-0.5">Share ideas, report issues, and help shape this tool during alpha</p>
                      </div>
                    </Link>

                    {/* Data Sources Audit */}
                    <Link
                      href="/data-sources"
                      onClick={() => setSettingsDropdownOpen(false)}
                      className="flex items-start gap-3 p-4 hover:bg-gray-50 transition-colors border-b border-gray-100"
                    >
                      <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Database className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">Data Sources</p>
                        <p className="text-xs text-gray-500 mt-0.5">Audit log showing where all information comes from</p>
                      </div>
                    </Link>

                    {/* Patient Reports - only for Max/Max+ */}
                    {showPatients && (
                      <Link
                        href="/reports"
                        onClick={() => setSettingsDropdownOpen(false)}
                        className="flex items-start gap-3 p-4 hover:bg-gray-50 transition-colors border-b border-gray-100"
                      >
                        <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
                          <BarChart3 className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">Progress Reports</p>
                          <p className="text-xs text-gray-500 mt-0.5">Generate patient progress audits for wards or individuals</p>
                        </div>
                      </Link>
                    )}

                    {/* Editor (Admin) - only for contributors */}
                    {canAccessAdmin && (
                      <Link
                        href="/admin"
                        onClick={() => setSettingsDropdownOpen(false)}
                        className="flex items-start gap-3 p-4 hover:bg-gray-50 transition-colors"
                      >
                        <div className="w-10 h-10 bg-gradient-to-br from-slate-600 to-slate-800 rounded-lg flex items-center justify-center flex-shrink-0">
                          <Pencil className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">Editor</p>
                          <p className="text-xs text-gray-500 mt-0.5">Create and edit referral workflows, how-to guides, and bookmarks</p>
                        </div>
                      </Link>
                    )}
                  </div>
                )}
              </div>
            </nav>

            {/* My Profile dropdown - combines version/role/user/ward (item 18c) */}
            <div className="hidden md:flex items-center gap-2">
              {user ? (
                <div className="relative" ref={profileDropdownRef}>
                  <button
                    onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors font-semibold ${
                      isViewingOtherWard
                        ? 'bg-amber-100 text-amber-800 hover:bg-amber-200'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <User className="w-4 h-4" />
                    <span className="max-w-[120px] truncate">{user.name}</span>
                    <ChevronDown className={`w-4 h-4 transition-transform ${profileDropdownOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {profileDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden z-50">
                      {/* User info header */}
                      <div className="p-4 bg-gradient-to-r from-indigo-500 to-purple-600 text-white">
                        <p className="font-bold text-lg">{user.name}</p>
                        <p className="text-sm text-white/80">{roleLabels[user.role] || user.role}</p>
                      </div>

                      {/* Saved feedback banner */}
                      {savedFeedback && (
                        <div className="p-3 bg-emerald-50 border-b border-emerald-200 flex items-center gap-2 text-emerald-700">
                          <Check className="w-4 h-4" />
                          <span className="text-sm font-medium">{savedFeedback} saved!</span>
                        </div>
                      )}

                      {/* Ward selector */}
                      <div className="p-3 border-b border-gray-100">
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                          <Building2 className="w-3 h-3 inline mr-1" />
                          Viewing Ward
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {allWards.map((ward) => (
                            <button
                              key={ward}
                              onClick={() => handleWardChange(ward)}
                              className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                                activeWard === ward
                                  ? 'bg-indigo-100 text-indigo-700'
                                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                              }`}
                            >
                              {ward}
                              {ward === user.ward && ' ★'}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Role selector (demo mode) */}
                      <div className="p-3 border-b border-gray-100">
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                          <User className="w-3 h-3 inline mr-1" />
                          Demo Role
                        </p>
                        <div className="grid grid-cols-2 gap-1">
                          {(["normal", "ward_admin", "contributor", "senior_admin"] as const).map((role) => (
                            <button
                              key={role}
                              onClick={() => handleRoleChange(role)}
                              className={`px-2 py-1.5 rounded text-xs font-medium transition-colors ${
                                user.role === role
                                  ? 'bg-emerald-100 text-emerald-700'
                                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                              }`}
                            >
                              {roleLabels[role]}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Version selector (item 12 - role/version switcher) */}
                      <div className="p-3 border-b border-gray-100">
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                          <Settings className="w-3 h-3 inline mr-1" />
                          Demo Version
                        </p>
                        <div className="grid grid-cols-2 gap-1">
                          {(Object.entries(versionLabels) as [string, { label: string; icon: string }][]).map(([key, val]) => (
                            <button
                              key={key}
                              onClick={() => handleVersionChange(key as "light" | "medium" | "max" | "max_plus")}
                              className={`px-2 py-1.5 rounded text-xs font-medium transition-colors ${
                                version === key
                                  ? 'bg-purple-100 text-purple-700'
                                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                              }`}
                            >
                              {val.icon} {val.label}
                            </button>
                          ))}
                        </div>
                        <Link
                          href="/versions"
                          onClick={() => setProfileDropdownOpen(false)}
                          className="mt-2 w-full flex items-center justify-center gap-2 px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold transition-colors"
                        >
                          <LayoutGrid className="w-3.5 h-3.5" />
                          Compare All Features
                        </Link>
                      </div>

                      {/* Logout */}
                      <button
                        onClick={handleLogout}
                        className="w-full px-4 py-3 text-left text-sm font-medium text-red-600 hover:bg-red-50 transition-colors flex items-center gap-2"
                      >
                        <LogOut className="w-4 h-4" />
                        Log out
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  href="/login"
                  className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-semibold"
                >
                  <User className="w-4 h-4" />
                  Log In
                </Link>
              )}
            </div>

            {/* Mobile menu button */}
            <button
              className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-700"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-gray-200">
            <nav className="flex flex-col px-4 py-2">
              {showTasks && (
                <>
                  <Link
                    href="/tasks"
                    className="py-3 border-b border-gray-100 font-semibold text-gray-700 flex items-center gap-2"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <CalendarDays className="w-5 h-5 text-indigo-600" />
                    Diary
                  </Link>
                  <Link
                    href="/my-tasks"
                    className="py-3 border-b border-gray-100 font-semibold text-gray-700 flex items-center gap-2"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <ClipboardList className="w-5 h-5 text-purple-600" />
                    Tasks
                  </Link>
                </>
              )}
              {showPatients && (
                <Link
                  href="/patients"
                  className="py-3 border-b border-gray-100 font-semibold text-gray-700 flex items-center gap-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Users className="w-5 h-5 text-teal-600" />
                  Patients
                </Link>
              )}
              <Link
                href="/bookmarks"
                className="py-3 border-b border-gray-100 font-semibold text-gray-700 flex items-center gap-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                <Bookmark className="w-5 h-5 text-amber-600" />
                Bookmarks
              </Link>
              <Link
                href="/referrals"
                className="py-3 border-b border-gray-100 font-semibold text-gray-700 flex items-center gap-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                <FileText className="w-5 h-5 text-rose-600" />
                Referrals
              </Link>
              <Link
                href="/how-to"
                className="py-3 border-b border-gray-100 font-semibold text-gray-700 flex items-center gap-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                <BookOpen className="w-5 h-5 text-emerald-600" />
                Guides
              </Link>

              {/* Settings section */}
              <div className="py-3 border-b border-gray-100">
                <p className="text-xs text-gray-500 mb-2 font-semibold uppercase flex items-center gap-1">
                  <Settings className="w-3 h-3" />
                  Settings
                </p>
                <div className="space-y-2">
                  <Link
                    href="/intro-guide"
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center flex-shrink-0">
                      <HelpCircle className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 text-sm">Intro Guide</p>
                      <p className="text-xs text-gray-500">Learn how to use the app</p>
                    </div>
                  </Link>
                  <Link
                    href="/faq"
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <div className="w-8 h-8 bg-gradient-to-br from-violet-500 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
                      <CircleHelp className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 text-sm">FAQ</p>
                      <p className="text-xs text-gray-500">Common questions answered</p>
                    </div>
                  </Link>
                  <Link
                    href="/feedback"
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <div className="w-8 h-8 bg-gradient-to-br from-pink-500 to-rose-500 rounded-lg flex items-center justify-center flex-shrink-0">
                      <MessageSquare className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 text-sm">Feedback</p>
                      <p className="text-xs text-gray-500">Share ideas and report issues</p>
                    </div>
                  </Link>
                  <Link
                    href="/data-sources"
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Database className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 text-sm">Data Sources</p>
                      <p className="text-xs text-gray-500">Audit log of all information</p>
                    </div>
                  </Link>
                  {showPatients && (
                    <Link
                      href="/reports"
                      className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <div className="w-8 h-8 bg-gradient-to-br from-violet-500 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
                        <BarChart3 className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900 text-sm">Progress Reports</p>
                        <p className="text-xs text-gray-500">Generate patient audits</p>
                      </div>
                    </Link>
                  )}
                  {canAccessAdmin && (
                    <Link
                      href="/admin"
                      className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <div className="w-8 h-8 bg-gradient-to-br from-slate-600 to-slate-800 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Pencil className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900 text-sm">Editor</p>
                        <p className="text-xs text-gray-500">Edit workflows and guides</p>
                      </div>
                    </Link>
                  )}
                </div>
              </div>

              {/* Mobile Saved feedback banner */}
              {savedFeedback && (
                <div className="py-3 px-4 bg-emerald-50 border-b border-emerald-200 flex items-center gap-2 text-emerald-700">
                  <Check className="w-4 h-4" />
                  <span className="text-sm font-medium">{savedFeedback} saved!</span>
                </div>
              )}

              {/* Mobile Ward Switcher */}
              {showTasks && user && (
                <div className="py-3 border-b border-gray-100">
                  <p className="text-xs text-gray-500 mb-2 font-semibold uppercase">View Ward</p>
                  <div className="flex flex-wrap gap-2">
                    {allWards.map((ward) => (
                      <button
                        key={ward}
                        onClick={() => handleMobileWardChange(ward)}
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                          activeWard === ward
                            ? 'bg-indigo-100 text-indigo-700'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        {ward}
                        {ward === user.ward && ' (Home)'}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Mobile Role Switcher */}
              {user && (
                <div className="py-3 border-b border-gray-100">
                  <p className="text-xs text-gray-500 mb-2 font-semibold uppercase">Demo Role</p>
                  <div className="flex flex-wrap gap-2">
                    {(["normal", "ward_admin", "contributor", "senior_admin"] as const).map((role) => (
                      <button
                        key={role}
                        onClick={() => handleMobileRoleChange(role)}
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                          user.role === role
                            ? 'bg-emerald-100 text-emerald-700'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        {roleLabels[role]}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Mobile Version Switcher */}
              {user && (
                <div className="py-3 border-b border-gray-100">
                  <p className="text-xs text-gray-500 font-semibold uppercase mb-2">Demo Version</p>
                  <div className="flex flex-wrap gap-2">
                    {(Object.entries(versionLabels) as [string, { label: string; icon: string }][]).map(([key, val]) => (
                      <button
                        key={key}
                        onClick={() => handleMobileVersionChange(key as "light" | "medium" | "max" | "max_plus")}
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                          version === key
                            ? 'bg-purple-100 text-purple-700'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        {val.icon} {val.label}
                      </button>
                    ))}
                  </div>
                  <Link
                    href="/versions"
                    onClick={() => setMobileMenuOpen(false)}
                    className="mt-3 w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-semibold transition-colors"
                  >
                    <LayoutGrid className="w-4 h-4" />
                    Compare All Features
                  </Link>
                </div>
              )}

              {user ? (
                <div className="py-3 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-bold text-gray-900">{user.name}</p>
                    <p className="text-xs text-gray-500 capitalize">
                      {user.ward} · {user.role.replace("_", " ")}
                    </p>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="px-3 py-1.5 text-sm bg-red-100 rounded-lg hover:bg-red-200 text-red-700 font-semibold"
                  >
                    Log out
                  </button>
                </div>
              ) : (
                <Link
                  href="/login"
                  className="py-3 font-semibold text-indigo-600 flex items-center gap-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <User className="w-5 h-5" />
                  Log In
                </Link>
              )}
            </nav>
          </div>
        )}
      </header>
    </>
  );
}
