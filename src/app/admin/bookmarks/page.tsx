"use client";

import { MainLayout } from "@/components/layout";
import { useApp } from "@/app/providers";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Bookmark,
  Plus,
  Pencil,
  Trash2,
  X,
  Check,
  ExternalLink,
  Phone,
  Shield,
  Search,
  Save,
} from "lucide-react";
import { bookmarks as initialBookmarks, getCategories } from "@/lib/data/bookmarks";
import { Bookmark as BookmarkType } from "@/lib/types";
import { ConfirmDialog } from "@/components/ui";

export default function AdminBookmarksPage() {
  const { user } = useApp();
  const router = useRouter();
  const [bookmarks, setBookmarks] = useState<BookmarkType[]>(initialBookmarks);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [editingBookmark, setEditingBookmark] = useState<BookmarkType | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean; bookmarkId: string | null }>({
    isOpen: false,
    bookmarkId: null,
  });

  const categories = getCategories();
  const isSeniorAdmin = user?.role === "senior_admin";

  // Redirect if not contributor or senior_admin
  useEffect(() => {
    if (user && user.role !== "contributor" && user.role !== "senior_admin") {
      router.push("/");
    }
  }, [user, router]);

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem("inpatient_hub_bookmarks");
    if (saved) {
      try {
        setBookmarks(JSON.parse(saved));
      } catch {
        // Use default bookmarks
      }
    }
  }, []);

  // Save to localStorage
  const saveBookmarks = (newBookmarks: BookmarkType[]) => {
    setBookmarks(newBookmarks);
    localStorage.setItem("inpatient_hub_bookmarks", JSON.stringify(newBookmarks));
    setSaveMessage("Saved!");
    setTimeout(() => setSaveMessage(null), 2000);
  };

  // Filter bookmarks
  const filteredBookmarks = bookmarks.filter((b) => {
    const matchesSearch =
      b.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === "all" || b.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  // Group by category
  const bookmarksByCategory = filteredBookmarks.reduce((acc, bookmark) => {
    if (!acc[bookmark.category]) {
      acc[bookmark.category] = [];
    }
    acc[bookmark.category].push(bookmark);
    return acc;
  }, {} as Record<string, BookmarkType[]>);

  // Handle save bookmark
  const handleSaveBookmark = (bookmark: BookmarkType) => {
    let newBookmarks: BookmarkType[];
    if (isAddingNew) {
      newBookmarks = [...bookmarks, { ...bookmark, id: `bookmark-${Date.now()}` }];
    } else {
      newBookmarks = bookmarks.map((b) => (b.id === bookmark.id ? bookmark : b));
    }
    saveBookmarks(newBookmarks);
    setEditingBookmark(null);
    setIsAddingNew(false);
  };

  // Handle delete
  const handleDeleteBookmark = (id: string) => {
    setDeleteConfirm({ isOpen: true, bookmarkId: id });
  };

  const confirmDeleteBookmark = () => {
    if (deleteConfirm.bookmarkId) {
      saveBookmarks(bookmarks.filter((b) => b.id !== deleteConfirm.bookmarkId));
    }
    setDeleteConfirm({ isOpen: false, bookmarkId: null });
  };

  // New bookmark template
  const newBookmarkTemplate: BookmarkType = {
    id: "",
    title: "",
    icon: "🔗",
    url: "",
    category: categories[0] || "Crisis Support",
    requiresFocus: false,
    description: "",
  };

  if (!user || (user.role !== "contributor" && user.role !== "senior_admin")) {
    return (
      <MainLayout>
        <div className="text-center py-20">
          <Shield className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
          <p className="text-gray-500">
            You need Creator Admin or Senior Admin permissions to access this page.
          </p>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/admin"
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Manage Bookmarks</h1>
              <p className="text-gray-500">
                {bookmarks.length} bookmarks across {categories.length} categories
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {saveMessage && (
              <span className="flex items-center gap-2 text-emerald-600 font-medium">
                <Check className="w-4 h-4" />
                {saveMessage}
              </span>
            )}
            <button
              onClick={() => {
                setIsAddingNew(true);
                setEditingBookmark(newBookmarkTemplate);
              }}
              className="flex items-center gap-2 px-4 py-2 bg-amber-500 text-white rounded-xl font-semibold hover:bg-amber-600 transition-colors"
            >
              <Plus className="w-5 h-5" />
              Add Bookmark
            </button>
          </div>
        </div>

        {/* Permission notice */}
        {!isSeniorAdmin && (
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start gap-3">
            <Shield className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-blue-800">Contributor Access</p>
              <p className="text-sm text-blue-700">
                You can edit bookmark titles, URLs, descriptions, and icons. Only Senior Admins can change categories or delete bookmarks.
              </p>
            </div>
          </div>
        )}

        {/* Search and filter */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search bookmarks..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
          >
            <option value="all">All Categories</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        {/* Bookmarks by category */}
        <div className="space-y-6">
          {Object.entries(bookmarksByCategory).map(([category, categoryBookmarks]) => (
            <div key={category}>
              <h2 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                <Bookmark className="w-5 h-5 text-amber-600" />
                {category}
                <span className="text-sm font-normal text-gray-500">
                  ({categoryBookmarks.length})
                </span>
              </h2>
              <div className="space-y-2">
                {categoryBookmarks.map((bookmark) => (
                  <div
                    key={bookmark.id}
                    className="bg-white border border-gray-200 rounded-xl p-4 flex items-center gap-4 hover:border-gray-300 transition-colors"
                  >
                    <span className="text-2xl">{bookmark.icon}</span>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900">{bookmark.title}</h3>
                      <p className="text-sm text-gray-500 truncate">{bookmark.description}</p>
                      <div className="flex items-center gap-3 mt-1 text-xs text-gray-400">
                        <span className="flex items-center gap-1">
                          <ExternalLink className="w-3 h-3" />
                          {bookmark.url === "#" ? "FOCUS link" : bookmark.url.replace(/^https?:\/\//, "").split("/")[0]}
                        </span>
                        {bookmark.phone && (
                          <span className="flex items-center gap-1">
                            <Phone className="w-3 h-3" />
                            {bookmark.phone}
                          </span>
                        )}
                        {bookmark.requiresFocus && (
                          <span className="px-1.5 py-0.5 bg-blue-100 text-blue-700 rounded">
                            FOCUS
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setIsAddingNew(false);
                          setEditingBookmark(bookmark);
                        }}
                        className="p-2 text-gray-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                        title="Edit"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      {isSeniorAdmin && (
                        <button
                          onClick={() => handleDeleteBookmark(bookmark.id)}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {filteredBookmarks.length === 0 && (
          <div className="text-center py-12">
            <Bookmark className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <p className="text-lg font-medium text-gray-700">No bookmarks found</p>
            <p className="text-gray-500 mt-2 max-w-sm mx-auto">
              {searchTerm
                ? `No bookmarks match "${searchTerm}". Try a different search term.`
                : filterCategory !== "all"
                ? "No bookmarks in this category."
                : "No bookmarks have been added yet."}
            </p>
            {(searchTerm || filterCategory !== "all") && (
              <button
                onClick={() => {
                  setSearchTerm("");
                  setFilterCategory("all");
                }}
                className="mt-4 px-4 py-2 bg-amber-500 text-white rounded-lg text-sm font-medium hover:bg-amber-600 transition-colors"
              >
                Clear Filters
              </button>
            )}
          </div>
        )}
      </div>

      {/* Edit/Add Modal */}
      {editingBookmark && (
        <BookmarkEditModal
          bookmark={editingBookmark}
          isNew={isAddingNew}
          categories={categories}
          canEditCategory={isSeniorAdmin}
          onSave={handleSaveBookmark}
          onClose={() => {
            setEditingBookmark(null);
            setIsAddingNew(false);
          }}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={deleteConfirm.isOpen}
        title="Delete Bookmark?"
        message="This action cannot be undone. The bookmark will be permanently removed."
        variant="danger"
        confirmLabel="Delete"
        cancelLabel="Cancel"
        onConfirm={confirmDeleteBookmark}
        onCancel={() => setDeleteConfirm({ isOpen: false, bookmarkId: null })}
      />
    </MainLayout>
  );
}

// Edit Modal Component
function BookmarkEditModal({
  bookmark,
  isNew,
  categories,
  canEditCategory,
  onSave,
  onClose,
}: {
  bookmark: BookmarkType;
  isNew: boolean;
  categories: string[];
  canEditCategory: boolean;
  onSave: (bookmark: BookmarkType) => void;
  onClose: () => void;
}) {
  const [formData, setFormData] = useState<BookmarkType>(bookmark);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.url) {
      alert("Title and URL are required");
      return;
    }
    onSave(formData);
  };

  const commonEmojis = ["🔗", "📞", "💚", "🧠", "🏥", "💻", "📧", "📝", "💰", "📅", "📚", "📋", "💊", "⚖️", "🗣️", "💜", "🛡️", "👶", "📹", "🏠", "☎️"];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">
            {isNew ? "Add New Bookmark" : "Edit Bookmark"}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Icon */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Icon
            </label>
            <div className="flex flex-wrap gap-2 mb-2">
              {commonEmojis.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => setFormData({ ...formData, icon: emoji })}
                  className={`w-10 h-10 text-xl rounded-lg border-2 transition-colors ${
                    formData.icon === emoji
                      ? "border-amber-500 bg-amber-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  {emoji}
                </button>
              ))}
            </div>
            <input
              type="text"
              value={formData.icon}
              onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
              className="w-20 px-3 py-2 border border-gray-200 rounded-lg text-center text-xl"
              placeholder="🔗"
            />
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Title *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
              required
            />
          </div>

          {/* URL */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              URL *
            </label>
            <input
              type="text"
              value={formData.url}
              onChange={(e) => setFormData({ ...formData, url: e.target.value })}
              className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
              placeholder="https://..."
              required
            />
            <p className="text-xs text-gray-500 mt-1">Use # for internal FOCUS links</p>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <input
              type="text"
              value={formData.description || ""}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          {/* Phone */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Phone Number (optional)
            </label>
            <input
              type="text"
              value={formData.phone || ""}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
              placeholder="0800 123 4567"
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Category
              {!canEditCategory && (
                <span className="text-xs text-gray-400 ml-2">(Senior Admin only)</span>
              )}
            </label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              disabled={!canEditCategory}
              className={`w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 ${
                !canEditCategory ? "bg-gray-100 cursor-not-allowed" : ""
              }`}
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Requires FOCUS */}
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="requiresFocus"
              checked={formData.requiresFocus}
              onChange={(e) => setFormData({ ...formData, requiresFocus: e.target.checked })}
              className="w-5 h-5 rounded border-gray-300 text-amber-600 focus:ring-amber-500"
            />
            <label htmlFor="requiresFocus" className="text-sm text-gray-700">
              Requires FOCUS login (Trust network only)
            </label>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2.5 bg-amber-500 text-white rounded-xl font-semibold hover:bg-amber-600 transition-colors flex items-center justify-center gap-2"
            >
              <Save className="w-4 h-4" />
              {isNew ? "Add Bookmark" : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
