"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useApp, STYLE_THEMES, type StyleTheme, type ColorMode } from "@/app/providers";
import { Menu, X, User, LogOut, CalendarDays, ChevronDown, Building2, Users, Link2, FileText, Pencil, MessageSquare, Check, HelpCircle, Sparkles, Database, CircleHelp, BarChart3, ArrowLeft, Play, Brain, Map } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useTour } from "@/app/tour-provider";
import { getStaffByWard } from "@/lib/data/staff";
import { useIsV2, useV2Href } from "@/lib/hooks/useV2";
import { GlobalSearch } from "./global-search";

export function Header() {
  const router = useRouter();
  const { user, setUser, activeWard, setActiveWard, allWards, styleTheme, setStyleTheme, colorMode, setColorMode } = useApp();
  const isV2 = useIsV2();
  const link = useV2Href();
  const availableRoles = (isV2
    ? (["staff", "senior_admin"] as const)
    : (["staff", "lead", "manager", "ward_admin", "senior_admin"] as const));
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [settingsDropdownOpen, setSettingsDropdownOpen] = useState(false);
  const [helpMode, setHelpMode] = useState(false);
  const [savedFeedback, setSavedFeedback] = useState<string | null>(null);
  const [showUserPicker, setShowUserPicker] = useState(false);
  const profileDropdownRef = useRef<HTMLDivElement>(null);
  const settingsDropdownRef = useRef<HTMLDivElement>(null);

  const handleWardChange = (ward: string) => {
    setActiveWard(ward);
    setSavedFeedback("Ward");
    setTimeout(() => {
      setSavedFeedback(null);
      setProfileDropdownOpen(false);
    }, 800);
  };

  const handleRoleChange = (role: "staff" | "lead" | "manager" | "ward_admin" | "senior_admin") => {
    if (user) {
      setUser({ ...user, role });
      setSavedFeedback("Role");
      setTimeout(() => {
        setSavedFeedback(null);
        setProfileDropdownOpen(false);
      }, 800);
    }
  };

  // v2 demo roles are just Staff / Editor. "Editor" = staff with content
  // editing (the isContributor flag); there are no admin roles in v2.
  const handleEditorChange = (isEditor: boolean) => {
    if (user) {
      setUser({ ...user, role: "staff", isContributor: isEditor });
      setSavedFeedback("Role");
      setTimeout(() => {
        setSavedFeedback(null);
        setProfileDropdownOpen(false);
        setMobileMenuOpen(false);
      }, 800);
    }
  };

  const handleMobileWardChange = (ward: string) => {
    setActiveWard(ward);
    setSavedFeedback("Ward");
    setTimeout(() => {
      setSavedFeedback(null);
      setMobileMenuOpen(false);
    }, 800);
  };

  const handleMobileRoleChange = (role: "staff" | "lead" | "manager" | "ward_admin" | "senior_admin") => {
    if (user) {
      setUser({ ...user, role });
      setSavedFeedback("Role");
      setTimeout(() => {
        setSavedFeedback(null);
        setMobileMenuOpen(false);
      }, 800);
    }
  };

  const handleLogout = () => {
    setUser(null);
    setMobileMenuOpen(false);
    setProfileDropdownOpen(false);
    localStorage.removeItem("wardhub_user");
    localStorage.removeItem("wardhub_gdpr");
    localStorage.removeItem("wardhub_active_ward");
    // Patient-identifying stores must not outlive the session on a shared ward computer
    localStorage.removeItem("wardhub-referral-logs");
    localStorage.removeItem("wardhub_care_tracker_v2");
    router.push(link("/login"));
  };

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

  const roleLabels: Record<string, string> = {
    staff: "Staff",
    lead: "Lead",
    manager: "Manager",
    ward_admin: "Ward Admin",
    senior_admin: "Senior Admin",
  };

  const { startTour, tourDismissed, hasBeenStarted } = useTour();
  const shouldPulse = !tourDismissed && !hasBeenStarted;
  const isViewingOtherWard = user && activeWard !== user.ward;
  const canAccessAdmin = !!user;

  return (
    <>
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>

      <header className="bg-white sticky top-0 z-30 shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">

            {/* Logo - wardHub branding */}
            <Link href={link("/")} className="flex items-center gap-2 group">
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center shadow-md group-hover:shadow-lg transition-shadow">
                <span className="text-xl">&#x1F3E5;</span>
              </div>
              <div className="leading-none">
                <p className="text-xs font-bold text-gray-500 group-hover:text-indigo-500 transition-colors">ward</p>
                <p className="text-xl font-black text-gray-900 group-hover:text-indigo-700 transition-colors -mt-0.5">Hub</p>
              </div>
            </Link>

            {/* Interactive Demo Tour button */}
            <button
              onClick={startTour}
              aria-label="Start interactive demo tour"
              className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-amber-400 to-orange-500 text-white rounded-lg font-bold text-sm shadow-md hover:shadow-lg hover:scale-105 transition-all ${shouldPulse ? "animate-pulse hover:animate-none" : ""}`}
            >
              <Sparkles className="w-4 h-4" />
              <span className="hidden lg:inline">Interactive Demo</span>
            </button>
            <button
              onClick={startTour}
              aria-label="Start interactive demo tour"
              className="sm:hidden w-9 h-9 bg-gradient-to-r from-amber-400 to-orange-500 text-white rounded-lg flex items-center justify-center shadow-md"
            >
              <Sparkles className="w-4 h-4" />
            </button>

            {/* Global search (guides + links). Ctrl/Cmd+K anywhere. */}
            <GlobalSearch />

            {/* Desktop nav */}
            <nav className="hidden md:flex items-center gap-3">
              {helpMode ? (
                <>
                  {/* Help mode toolbar */}
                  <div className="flex items-center gap-1 p-1 bg-blue-50 rounded-xl border border-blue-200">
                    <button
                      onClick={() => setHelpMode(false)}
                      className="px-3 py-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold flex items-center gap-1.5 transition-colors text-sm"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      Back
                    </button>
                    <button
                      onClick={() => { startTour(); setHelpMode(false); }}
                      className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-amber-400 to-orange-500 text-white font-semibold flex items-center gap-1.5 transition-colors text-sm hover:shadow-md"
                    >
                      <Play className="w-4 h-4" />
                      Interactive Demo
                    </button>
                    <Link href={link("/intro-guide")} onClick={() => setHelpMode(false)} className="px-3 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold flex items-center gap-1.5 transition-colors text-sm no-underline">
                      <HelpCircle className="w-4 h-4" />
                      Intro Guide
                    </Link>
                    <Link href={link("/faq")} onClick={() => setHelpMode(false)} className="px-3 py-1.5 rounded-lg bg-violet-50 hover:bg-violet-100 text-violet-700 font-semibold flex items-center gap-1.5 transition-colors text-sm no-underline">
                      <CircleHelp className="w-4 h-4" />
                      FAQ
                    </Link>
                    <Link href={link("/feedback")} onClick={() => setHelpMode(false)} className="px-3 py-1.5 rounded-lg bg-pink-50 hover:bg-pink-100 text-pink-700 font-semibold flex items-center gap-1.5 transition-colors text-sm no-underline">
                      <MessageSquare className="w-4 h-4" />
                      Feedback
                    </Link>
                  </div>

                  {/* Bouncing arrow pointing at Demo Mode */}
                  <span className="text-xs text-indigo-600 font-medium">Try different roles!</span>
                  <span className="text-indigo-500 text-lg animate-[bounce-right_1s_infinite]">&rarr;</span>
                </>
              ) : (
                <>
                  {/* Normal nav items */}
                  <div className="flex items-center gap-1 p-1 bg-slate-100/50 rounded-xl border border-slate-200">
                    {!isV2 && (
                      <Link href={link("/tasks")} className="px-3 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold flex items-center gap-1.5 transition-colors text-sm">
                        <CalendarDays className="w-4 h-4" />
                        Diary
                      </Link>
                    )}
                    <Link href={link("/links")} className="px-3 py-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-700 font-semibold flex items-center gap-1.5 transition-colors text-sm">
                      <Link2 className="w-4 h-4" />
                      Links
                    </Link>
                    <Link href={link("/guides")} className="px-3 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 font-semibold flex items-center gap-1.5 transition-colors text-sm">
                      <FileText className="w-4 h-4" />
                      Guides
                    </Link>
                    {!isV2 && (
                      <Link href={link("/patients")} className="px-3 py-1.5 rounded-lg bg-teal-50 hover:bg-teal-100 text-teal-700 font-semibold flex items-center gap-1.5 transition-colors text-sm">
                        <Users className="w-4 h-4" />
                        Patients
                      </Link>
                    )}
                  </div>

                  {/* More dropdown */}
                  <div className="relative" ref={settingsDropdownRef}>
                    <button
                      onClick={() => setSettingsDropdownOpen(!settingsDropdownOpen)}
                      aria-label="More options menu"
                      aria-expanded={settingsDropdownOpen}
                      className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold flex items-center gap-1.5 transition-colors text-sm"
                    >
                      More
                      <ChevronDown className={`w-4 h-4 transition-transform ${settingsDropdownOpen ? "rotate-180" : ""}`} aria-hidden="true" />
                    </button>

                    {settingsDropdownOpen && (
                      <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden z-50">
                        <Link href={link("/quiz")} onClick={() => setSettingsDropdownOpen(false)} className="flex items-start gap-3 p-4 hover:bg-gray-50 transition-colors border-b border-gray-100">
                          <div className="w-10 h-10 bg-gradient-to-br from-fuchsia-500 to-purple-700 rounded-lg flex items-center justify-center flex-shrink-0"><Brain className="w-5 h-5 text-white" /></div>
                          <div><p className="font-semibold text-gray-900">Quiz</p><p className="text-xs text-gray-500 mt-0.5">Just-for-fun knowledge refresher - nothing tracked</p></div>
                        </Link>
                        <Link href={link("/service-map")} onClick={() => setSettingsDropdownOpen(false)} className="flex items-start gap-3 p-4 hover:bg-gray-50 transition-colors border-b border-gray-100">
                          <div className="w-10 h-10 bg-gradient-to-br from-sky-500 to-blue-700 rounded-lg flex items-center justify-center flex-shrink-0"><Map className="w-5 h-5 text-white" /></div>
                          <div><p className="font-semibold text-gray-900">Service Map <span className="text-[10px] font-bold uppercase text-amber-700 bg-amber-100 rounded px-1.5 py-0.5 ml-1">Prototype</span></p><p className="text-xs text-gray-500 mt-0.5">Which community services a person may be eligible for</p></div>
                        </Link>
                        {!isV2 && (
                          <Link href={link("/staff")} onClick={() => setSettingsDropdownOpen(false)} className="flex items-start gap-3 p-4 hover:bg-gray-50 transition-colors border-b border-gray-100">
                            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-700 rounded-lg flex items-center justify-center flex-shrink-0"><Users className="w-5 h-5 text-white" /></div>
                            <div><p className="font-semibold text-gray-900">Staff</p><p className="text-xs text-gray-500 mt-0.5">Staff directory and ward assignments</p></div>
                          </Link>
                        )}
                        {!isV2 && (
                          <Link href={link("/dev-panel?section=data-sources")} onClick={() => setSettingsDropdownOpen(false)} className="flex items-start gap-3 p-4 hover:bg-gray-50 transition-colors border-b border-gray-100">
                            <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center flex-shrink-0"><Database className="w-5 h-5 text-white" /></div>
                            <div><p className="font-semibold text-gray-900">Data Sources</p><p className="text-xs text-gray-500 mt-0.5">Audit log showing where all information comes from</p></div>
                          </Link>
                        )}
                        {!isV2 && (
                          <Link href={link("/reports")} onClick={() => setSettingsDropdownOpen(false)} className="flex items-start gap-3 p-4 hover:bg-gray-50 transition-colors border-b border-gray-100">
                            <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0"><BarChart3 className="w-5 h-5 text-white" /></div>
                            <div><p className="font-semibold text-gray-900">Progress Reports</p><p className="text-xs text-gray-500 mt-0.5">Generate patient progress audits</p></div>
                          </Link>
                        )}
                        {canAccessAdmin && (
                          <Link href={link("/admin")} onClick={() => setSettingsDropdownOpen(false)} className="flex items-start gap-3 p-4 hover:bg-gray-50 transition-colors">
                            <div className="w-10 h-10 bg-gradient-to-br from-slate-600 to-slate-800 rounded-lg flex items-center justify-center flex-shrink-0"><Pencil className="w-5 h-5 text-white" /></div>
                            <div><p className="font-semibold text-gray-900">Editor</p><p className="text-xs text-gray-500 mt-0.5">{user?.isContributor ? "Create and edit content" : "Request creator privileges"}</p></div>
                          </Link>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Help button */}
                  <button
                    onClick={() => setHelpMode(true)}
                    className="px-3 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold flex items-center gap-1.5 transition-colors text-sm border border-blue-200"
                  >
                    <HelpCircle className="w-4 h-4" />
                    Help
                  </button>
                </>
              )}
            </nav>

            {/* My Profile dropdown */}
            <div className="hidden md:flex items-center gap-2">
              {user ? (
                <div className="relative" ref={profileDropdownRef}>
                  <button
                    onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                    aria-label="My profile menu"
                    aria-expanded={profileDropdownOpen}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors font-semibold ${
                      isViewingOtherWard
                        ? "bg-amber-100 text-amber-800 hover:bg-amber-200"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    <Sparkles className="w-4 h-4" aria-hidden="true" />
                    <span className="max-w-[120px] truncate">Demo Mode</span>
                    <ChevronDown className={`w-4 h-4 transition-transform ${profileDropdownOpen ? "rotate-180" : ""}`} aria-hidden="true" />
                  </button>

                  {profileDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden z-50">
                      <div className="p-4 bg-gradient-to-r from-indigo-500 to-purple-600 text-white">
                        <p className="font-bold text-lg">{user.name}</p>
                        <p className="text-sm text-white/80">{isV2 ? (user.isContributor ? "Editor" : "Staff") : (roleLabels[user.role] || user.role)}</p>
                      </div>

                      {savedFeedback && (
                        <div className="p-3 bg-emerald-50 border-b border-emerald-200 flex items-center gap-2 text-emerald-700">
                          <Check className="w-4 h-4" />
                          <span className="text-sm font-medium">{savedFeedback} saved!</span>
                        </div>
                      )}

                      {!isV2 && (
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
                                    ? "bg-indigo-100 text-indigo-700"
                                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                                }`}
                              >
                                {ward}
                                {ward === user.ward && " \u2605"}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="p-3 border-b border-gray-100">
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                          <User className="w-3 h-3 inline mr-1" />
                          Demo Role
                        </p>
                        {isV2 ? (
                          <div className="grid gap-1 grid-cols-2">
                            <button
                              onClick={() => handleEditorChange(false)}
                              className={`px-2 py-1.5 rounded text-xs font-medium transition-colors ${
                                !user.isContributor
                                  ? "bg-emerald-100 text-emerald-700"
                                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                              }`}
                            >
                              Staff
                            </button>
                            <button
                              onClick={() => handleEditorChange(true)}
                              className={`px-2 py-1.5 rounded text-xs font-medium transition-colors ${
                                user.isContributor
                                  ? "bg-emerald-100 text-emerald-700"
                                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                              }`}
                            >
                              Editor
                            </button>
                          </div>
                        ) : (
                          <div className="grid gap-1 grid-cols-3">
                            {availableRoles.map((role) => (
                              <button
                                key={role}
                                onClick={() => handleRoleChange(role)}
                                className={`px-2 py-1.5 rounded text-xs font-medium transition-colors ${
                                  user.role === role
                                    ? "bg-emerald-100 text-emerald-700"
                                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                                }`}
                              >
                                {roleLabels[role]}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Specific User picker */}
                      <div className="p-3 border-b border-gray-100">
                        <button
                          onClick={() => setShowUserPicker(!showUserPicker)}
                          className="w-full flex items-center justify-between text-xs font-semibold text-gray-400 uppercase tracking-wider"
                        >
                          <span className="flex items-center gap-1">
                            <Users className="w-3 h-3" />
                            Specific User
                          </span>
                          <ChevronDown className={`w-3 h-3 transition-transform ${showUserPicker ? "rotate-180" : ""}`} />
                        </button>
                        {showUserPicker && (
                          <div className="mt-2 max-h-48 overflow-y-auto space-y-0.5">
                            {getStaffByWard(activeWard.charAt(0).toUpperCase() + activeWard.slice(1))
                              .filter((staff) => (isV2 ? staff.role === "staff" : true))
                              .map((staff) => (
                              <button
                                key={staff.id}
                                onClick={() => {
                                  setUser({ ...user, name: staff.name, role: staff.role, isContributor: staff.isContributor });
                                  setSavedFeedback("User");
                                  setShowUserPicker(false);
                                }}
                                className={`w-full px-2 py-1.5 rounded text-left text-xs transition-colors flex items-center justify-between ${
                                  user.name === staff.name
                                    ? "bg-indigo-100 text-indigo-700"
                                    : "hover:bg-gray-100 text-gray-700"
                                }`}
                              >
                                <span className="font-medium truncate">{staff.name}</span>
                                <span className="text-[10px] text-gray-400 ml-2 flex-shrink-0 italic">{roleLabels[staff.role]}</span>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Dark mode toggle */}
                      <div className="p-3 border-b border-gray-100">
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                          💡 Appearance
                        </p>
                        <div className="grid grid-cols-3 gap-1">
                          {([
                            { key: "light" as ColorMode, label: "Light", icon: "☀️" },
                            { key: "dark" as ColorMode, label: "Dark", icon: "🌙" },
                            { key: "system" as ColorMode, label: "Auto", icon: "💻" },
                          ]).map((opt) => (
                            <button
                              key={opt.key}
                              onClick={() => {
                                setColorMode(opt.key);
                                setSavedFeedback("Mode");
                              }}
                              className={`p-1.5 rounded text-center transition-all ${
                                colorMode === opt.key
                                  ? "bg-indigo-100 text-indigo-700 ring-2 ring-indigo-400"
                                  : "bg-gray-50 text-gray-600 hover:bg-gray-100"
                              }`}
                            >
                              <span className="text-base block">{opt.icon}</span>
                              <span className="text-[9px] font-medium">{opt.label}</span>
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Style theme picker */}
                      <div className="p-3 border-b border-gray-100">
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                          🎨 Style Theme (Diary)
                        </p>
                        <div className="grid grid-cols-5 gap-1">
                          {(Object.entries(STYLE_THEMES) as [StyleTheme, typeof STYLE_THEMES[StyleTheme]][]).map(([key, config]) => (
                            <button
                              key={key}
                              onClick={() => {
                                setStyleTheme(key);
                                setSavedFeedback("Theme");
                              }}
                              className={`p-1.5 rounded text-center transition-all ${
                                styleTheme === key
                                  ? "bg-indigo-100 text-indigo-700 ring-2 ring-indigo-400"
                                  : "bg-gray-50 text-gray-600 hover:bg-gray-100"
                              }`}
                              title={config.description}
                            >
                              <span className="text-base block">{config.icon}</span>
                              <span className="text-[9px] font-medium leading-tight block">{config.label}</span>
                            </button>
                          ))}
                        </div>
                      </div>

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
                  href={link("/login")}
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
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-gray-200">
            <nav className="flex flex-col px-4 py-2">
              {!isV2 && (
                <Link href={link("/tasks")} className="py-3 border-b border-gray-100 font-semibold text-gray-700 flex items-center gap-2" onClick={() => setMobileMenuOpen(false)}>
                  <CalendarDays className="w-5 h-5 text-indigo-600" /> Diary
                </Link>
              )}
              <Link href={link("/links")} className="py-3 border-b border-gray-100 font-semibold text-gray-700 flex items-center gap-2" onClick={() => setMobileMenuOpen(false)}>
                <Link2 className="w-5 h-5 text-amber-600" /> Links
              </Link>
              <Link href={link("/guides")} className="py-3 border-b border-gray-100 font-semibold text-gray-700 flex items-center gap-2" onClick={() => setMobileMenuOpen(false)}>
                <FileText className="w-5 h-5 text-rose-600" /> Guides
              </Link>
              {!isV2 && (
                <Link href={link("/patients")} className="py-3 border-b border-gray-100 font-semibold text-gray-700 flex items-center gap-2" onClick={() => setMobileMenuOpen(false)}>
                  <Users className="w-5 h-5 text-teal-600" /> Patients
                </Link>
              )}

              <div className="py-3 border-b border-gray-100">
                <p className="text-xs text-gray-500 mb-2 font-semibold uppercase">More</p>
                <div className="space-y-2">
                  <Link href={link("/quiz")} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors" onClick={() => setMobileMenuOpen(false)}>
                    <div className="w-8 h-8 bg-gradient-to-br from-fuchsia-500 to-purple-700 rounded-lg flex items-center justify-center flex-shrink-0"><Brain className="w-4 h-4 text-white" /></div>
                    <div><p className="font-semibold text-gray-900 text-sm">Quiz</p><p className="text-xs text-gray-500">Just-for-fun refresher, nothing tracked</p></div>
                  </Link>
                  <Link href={link("/service-map")} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors" onClick={() => setMobileMenuOpen(false)}>
                    <div className="w-8 h-8 bg-gradient-to-br from-sky-500 to-blue-700 rounded-lg flex items-center justify-center flex-shrink-0"><Map className="w-4 h-4 text-white" /></div>
                    <div><p className="font-semibold text-gray-900 text-sm">Service Map <span className="text-[10px] font-bold uppercase text-amber-700">(Prototype)</span></p><p className="text-xs text-gray-500">Services a person may be eligible for</p></div>
                  </Link>
                  {!isV2 && (
                    <Link href={link("/staff")} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors" onClick={() => setMobileMenuOpen(false)}>
                      <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-purple-700 rounded-lg flex items-center justify-center flex-shrink-0"><Users className="w-4 h-4 text-white" /></div>
                      <div><p className="font-semibold text-gray-900 text-sm">Staff</p><p className="text-xs text-gray-500">Staff directory and ward assignments</p></div>
                    </Link>
                  )}
                  {!isV2 && (
                    <Link href={link("/dev-panel?section=data-sources")} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors" onClick={() => setMobileMenuOpen(false)}>
                      <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center flex-shrink-0"><Database className="w-4 h-4 text-white" /></div>
                      <div><p className="font-semibold text-gray-900 text-sm">Data Sources</p><p className="text-xs text-gray-500">Audit log of all information</p></div>
                    </Link>
                  )}
                  {!isV2 && (
                    <Link href={link("/reports")} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors" onClick={() => setMobileMenuOpen(false)}>
                      <div className="w-8 h-8 bg-gradient-to-br from-violet-500 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0"><BarChart3 className="w-4 h-4 text-white" /></div>
                      <div><p className="font-semibold text-gray-900 text-sm">Progress Reports</p><p className="text-xs text-gray-500">Generate patient audits</p></div>
                    </Link>
                  )}
                  {canAccessAdmin && (
                    <Link href={link("/admin")} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors" onClick={() => setMobileMenuOpen(false)}>
                      <div className="w-8 h-8 bg-gradient-to-br from-slate-600 to-slate-800 rounded-lg flex items-center justify-center flex-shrink-0"><Pencil className="w-4 h-4 text-white" /></div>
                      <div><p className="font-semibold text-gray-900 text-sm">Editor</p><p className="text-xs text-gray-500">{user?.isContributor ? "Edit guides and content" : "Request creator privileges"}</p></div>
                    </Link>
                  )}
                </div>
              </div>

              <div className="py-3 border-b border-gray-100">
                <p className="text-xs text-gray-500 mb-2 font-semibold uppercase">Help</p>
                <div className="space-y-2">
                  <button onClick={() => { startTour(); setMobileMenuOpen(false); }} className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors text-left">
                    <div className="w-8 h-8 bg-gradient-to-br from-amber-400 to-orange-500 rounded-lg flex items-center justify-center flex-shrink-0"><Play className="w-4 h-4 text-white" /></div>
                    <div><p className="font-semibold text-gray-900 text-sm">Interactive Demo</p><p className="text-xs text-gray-500">Guided tour of wardHub</p></div>
                  </button>
                  <Link href={link("/intro-guide")} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors" onClick={() => setMobileMenuOpen(false)}>
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center flex-shrink-0"><HelpCircle className="w-4 h-4 text-white" /></div>
                    <div><p className="font-semibold text-gray-900 text-sm">Intro Guide</p><p className="text-xs text-gray-500">Visual walkthrough</p></div>
                  </Link>
                  <Link href={link("/faq")} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors" onClick={() => setMobileMenuOpen(false)}>
                    <div className="w-8 h-8 bg-gradient-to-br from-violet-500 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0"><CircleHelp className="w-4 h-4 text-white" /></div>
                    <div><p className="font-semibold text-gray-900 text-sm">FAQ</p><p className="text-xs text-gray-500">Common questions</p></div>
                  </Link>
                  <Link href={link("/feedback")} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors" onClick={() => setMobileMenuOpen(false)}>
                    <div className="w-8 h-8 bg-gradient-to-br from-pink-500 to-rose-500 rounded-lg flex items-center justify-center flex-shrink-0"><MessageSquare className="w-4 h-4 text-white" /></div>
                    <div><p className="font-semibold text-gray-900 text-sm">Feedback</p><p className="text-xs text-gray-500">Share ideas and report issues</p></div>
                  </Link>
                </div>
              </div>

              {savedFeedback && (
                <div className="py-3 px-4 bg-emerald-50 border-b border-emerald-200 flex items-center gap-2 text-emerald-700">
                  <Check className="w-4 h-4" />
                  <span className="text-sm font-medium">{savedFeedback} saved!</span>
                </div>
              )}

              {user && !isV2 && (
                <div className="py-3 border-b border-gray-100">
                  <p className="text-xs text-gray-500 mb-2 font-semibold uppercase">View Ward</p>
                  <div className="flex flex-wrap gap-2">
                    {allWards.map((ward) => (
                      <button
                        key={ward}
                        onClick={() => handleMobileWardChange(ward)}
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                          activeWard === ward
                            ? "bg-indigo-100 text-indigo-700"
                            : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                        }`}
                      >
                        {ward}
                        {ward === user.ward && " (Home)"}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {user && (
                <div className="py-3 border-b border-gray-100">
                  <p className="text-xs text-gray-500 mb-2 font-semibold uppercase">Demo Role</p>
                  <div className="flex flex-wrap gap-2">
                    {isV2 ? (
                      <>
                        <button
                          onClick={() => handleEditorChange(false)}
                          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                            !user.isContributor
                              ? "bg-emerald-100 text-emerald-700"
                              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                          }`}
                        >
                          Staff
                        </button>
                        <button
                          onClick={() => handleEditorChange(true)}
                          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                            user.isContributor
                              ? "bg-emerald-100 text-emerald-700"
                              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                          }`}
                        >
                          Editor
                        </button>
                      </>
                    ) : (
                      availableRoles.map((role) => (
                        <button
                          key={role}
                          onClick={() => handleMobileRoleChange(role)}
                          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                            user.role === role
                              ? "bg-emerald-100 text-emerald-700"
                              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                          }`}
                        >
                          {roleLabels[role]}
                        </button>
                      ))
                    )}
                  </div>
                </div>
              )}

              {user ? (
                <div className="py-3 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-bold text-gray-900">{user.name}</p>
                    <p className="text-xs text-gray-500 capitalize">
                      {user.ward} &middot; {user.role.replace("_", " ")}
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
                  href={link("/login")}
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
