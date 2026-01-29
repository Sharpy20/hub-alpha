"use client";

import { useState } from "react";
import { Bot, CheckCircle, Flag, MessageSquare, RefreshCw, X } from "lucide-react";
import { useApp } from "@/app/providers";
import { useVerification, VerifiableContentType } from "@/app/verification-provider";
import Link from "next/link";

interface VerificationBadgeProps {
  contentType: VerifiableContentType;
  contentId: string;
  contentTitle: string;
  size?: "sm" | "md";
}

export function VerificationBadge({
  contentType,
  contentId,
  contentTitle,
  size = "sm",
}: VerificationBadgeProps) {
  const { user } = useApp();
  const { getVerification, verifyContent } = useVerification();
  const [showModal, setShowModal] = useState(false);

  const verification = getVerification(contentType, contentId);
  const canVerify = user?.role === "contributor" || user?.role === "senior_admin";

  const isVerified = verification?.status === "verified";
  const verifiedDate = verification?.verifiedAt
    ? new Date(verification.verifiedAt).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : null;

  const handleVerify = () => {
    if (user) {
      verifyContent(contentType, contentId, user.name);
    }
    setShowModal(false);
  };

  const sizeClasses = size === "sm"
    ? "text-xs px-2 py-0.5 gap-1"
    : "text-sm px-2.5 py-1 gap-1.5";

  const iconSize = size === "sm" ? "w-3 h-3" : "w-4 h-4";

  return (
    <>
      <button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setShowModal(true);
        }}
        className={`inline-flex items-center rounded-full font-medium transition-all hover:opacity-80 ${sizeClasses} ${
          isVerified
            ? "bg-green-100 text-green-700 hover:bg-green-200"
            : "bg-amber-100 text-amber-700 hover:bg-amber-200"
        }`}
        title={isVerified ? `Verified by ${verification?.verifiedBy}` : "AI Generated - Click for options"}
      >
        {isVerified ? (
          <>
            <CheckCircle className={iconSize} />
            <span>Verified: {verifiedDate}</span>
          </>
        ) : (
          <>
            <Bot className={iconSize} />
            <span>AI Generated</span>
          </>
        )}
      </button>

      {/* Modal */}
      {showModal && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setShowModal(false)}
        >
          <div
            className="bg-white rounded-xl shadow-xl max-w-md w-full"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="font-semibold text-gray-900">Content Verification</h3>
              <button
                onClick={() => setShowModal(false)}
                className="p-1 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Content */}
            <div className="p-4 space-y-4">
              {/* Status */}
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">
                  <span className="font-medium">{contentTitle}</span>
                </p>
                <div className="flex items-center gap-2 flex-wrap">
                  {isVerified ? (
                    <>
                      <span className="inline-flex items-center gap-1 text-green-700 bg-green-100 px-2 py-0.5 rounded-full text-xs font-medium">
                        <CheckCircle className="w-3 h-3" />
                        Verified
                      </span>
                      <span className="text-xs text-gray-500">
                        by {verification?.verifiedBy} on {verifiedDate}
                      </span>
                    </>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full text-xs font-medium">
                      <Bot className="w-3 h-3" />
                      AI Generated - Needs Verification
                    </span>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-700">Actions</p>

                {/* Report Problem */}
                <Link
                  href={`/feedback?type=problem&content=${contentType}&id=${contentId}&title=${encodeURIComponent(contentTitle)}`}
                  className="flex items-center gap-3 p-3 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-all no-underline"
                  onClick={() => setShowModal(false)}
                >
                  <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Flag className="w-5 h-5 text-red-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Report a Problem</p>
                    <p className="text-xs text-gray-500">Flag incorrect or outdated information</p>
                  </div>
                </Link>

                {/* Give Feedback */}
                <Link
                  href={`/feedback?type=suggestion&content=${contentType}&id=${contentId}&title=${encodeURIComponent(contentTitle)}`}
                  className="flex items-center gap-3 p-3 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-all no-underline"
                  onClick={() => setShowModal(false)}
                >
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <MessageSquare className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Give Feedback</p>
                    <p className="text-xs text-gray-500">Suggest improvements or additions</p>
                  </div>
                </Link>

                {/* Re-verify (Admin only) */}
                {canVerify && (
                  <button
                    onClick={handleVerify}
                    className="w-full flex items-center gap-3 p-3 bg-white border-2 border-green-200 rounded-lg hover:bg-green-50 hover:border-green-300 transition-all"
                  >
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <RefreshCw className="w-5 h-5 text-green-600" />
                    </div>
                    <div className="text-left">
                      <p className="font-medium text-gray-900">
                        {isVerified ? "Re-verify Now" : "Verify Now"}
                      </p>
                      <p className="text-xs text-gray-500">
                        Confirm this content is accurate
                      </p>
                    </div>
                  </button>
                )}
              </div>

              {!canVerify && (
                <p className="text-xs text-gray-400 text-center pt-2">
                  Only Creator Admins and Senior Admins can verify content
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
