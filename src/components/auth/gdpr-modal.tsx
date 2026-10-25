"use client";

import { Modal, ModalActions } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Shield, AlertTriangle } from "lucide-react";
import { useIsV3 } from "@/lib/hooks/useV2";

interface GdprModalProps {
  isOpen: boolean;
  onAccept: () => void;
}

export function GdprModal({ isOpen, onAccept }: GdprModalProps) {
  const isV3 = useIsV3();

  // 3.0 holds no patient or staff data, so its notice says what it does hold.
  if (isV3) {
    return (
      <Modal isOpen={isOpen} onClose={() => {}} title="Before you start" size="md" showClose={false}>
        <div className="space-y-4 text-nhs-dark-grey">
          <p className="font-semibold text-nhs-black flex items-center gap-2">
            <Shield className="w-5 h-5 text-nhs-blue" />
            wardHub 3.0 is the guides edition
          </p>
          <ul className="list-disc list-inside space-y-2 text-sm ml-2">
            <li>It holds no patient or staff data, and nobody signs in.</li>
            <li><strong>Do not type patient information</strong> into the editor or anywhere else on this site.</li>
            <li>Anything you change, such as a draft guide or a saved link, stays in this browser.</li>
            <li>The site sets one cookie, to remember that you entered the password.</li>
            <li>Every guide is a draft until it is signed off. Check it against Trust policy before you rely on it.</li>
          </ul>
        </div>
        <ModalActions>
          <Button onClick={onAccept} size="lg">
            I Understand
          </Button>
        </ModalActions>
      </Modal>
    );
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {}} // Cannot close without accepting
      title="GDPR Notice"
      size="md"
      showClose={false}
    >
      <div className="space-y-4">
        <div className="flex items-start gap-3 p-4 bg-nhs-yellow/20 rounded-lg">
          <AlertTriangle className="w-6 h-6 text-nhs-orange flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-nhs-black">Demo Version Notice</p>
            <p className="text-sm text-nhs-dark-grey mt-1">
              This demo contains only public-facing information and fictional test data.
            </p>
          </div>
        </div>

        <div className="space-y-3 text-nhs-dark-grey">
          <p className="font-semibold text-nhs-black flex items-center gap-2">
            <Shield className="w-5 h-5 text-nhs-blue" />
            Important Information
          </p>

          <ul className="list-disc list-inside space-y-2 text-sm ml-2">
            <li>All patient information shown is <strong>fictional test data</strong></li>
            <li><strong>DO NOT</strong> enter real patient information</li>
            <li>Public helplines and services shown are real; Trust-internal numbers are hidden in demo mode</li>
            <li>This is not connected to any NHS clinical systems</li>
          </ul>
        </div>

        <div className="p-4 bg-nhs-pale-grey rounded-lg">
          <p className="text-sm font-semibold text-nhs-black mb-2">
            In the live version:
          </p>
          <ul className="list-disc list-inside space-y-1 text-sm text-nhs-dark-grey">
            <li>Access will be restricted to approved Trust staff</li>
            <li>All data will be handled in accordance with NHS data protection policies</li>
            <li>Audit logs will be maintained for compliance</li>
          </ul>
        </div>
      </div>

      <ModalActions>
        <Button onClick={onAccept} size="lg">
          I Understand
        </Button>
      </ModalActions>
    </Modal>
  );
}
