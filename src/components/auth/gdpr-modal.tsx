"use client";

import { Modal, ModalActions } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Shield, AlertTriangle } from "lucide-react";

interface GdprModalProps {
  isOpen: boolean;
  onAccept: () => void;
}

export function GdprModal({ isOpen, onAccept }: GdprModalProps) {
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
            <li>All phone numbers and contacts are for demonstration only</li>
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
