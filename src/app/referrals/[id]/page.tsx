"use client";

import { MainLayout } from "@/components/layout";
import { Button, Card, CardContent, Badge } from "@/components/ui";
import { useParams, useRouter } from "next/navigation";
import { useApp } from "@/app/providers";
import { useTasks } from "@/app/tasks-provider";
import {
  CheckCircle,
  FileText,
  Eye,
  BookOpen,
  Send,
  Clipboard,
  Calendar,
  Shield,
  ArrowLeft,
  ArrowRight,
  Check,
  Copy,
  Download,
  Monitor,
  ExternalLink,
  Phone,
  Mail,
  Pencil,
  UserPlus,
} from "lucide-react";
import { useCanEdit } from "@/lib/hooks/useCanEdit";
import { PatientPickerModal } from "@/components/modals";
import { Patient } from "@/lib/types";
import Link from "next/link";
import { useState } from "react";

// Workflow data with all referral types
const WORKFLOWS: Record<string, WorkflowData> = {
  "imha-advocacy": {
    id: "imha-advocacy",
    title: "IMHA / Advocacy Referral",
    description: "Independent Mental Health Advocate for detained patients",
    icon: "🗣️",
    gradient: "from-indigo-500 to-indigo-700",
    steps: [
      {
        id: "criteria",
        type: "criteria",
        title: "Confirm Criteria",
        content: "The patient is detained under the Mental Health Act and would benefit from independent advocacy support. This includes Section 2, Section 3, or CTO patients.",
        checkboxLabel: "I confirm the patient meets criteria for IMHA referral",
      },
      {
        id: "consent",
        type: "consent",
        title: "Patient Consent",
        content: "Have you asked the patient if they consent to an IMHA referral? (This is asked on the referral form - select as a reminder before proceeding)",
      },
      {
        id: "section",
        type: "section",
        title: "Legal Status",
        content: "What is the patient's current legal status under the Mental Health Act?",
      },
      {
        id: "area",
        type: "area",
        title: "Select Area",
        content: "Which area is the patient from? This determines which advocacy service to use.",
      },
      {
        id: "forms",
        type: "forms",
        title: "Download Forms & Guides",
        content: "Download the appropriate form for your selected area.",
        forms: {
          blank: [
            { label: "Derby City IMHA Form 2025 (POhWER)", url: "#", icon: "📄", area: "city" },
            { label: "Derbyshire County IMHA Form (Cloverleaf)", url: "#", icon: "📄", area: "county" },
          ],
          wagoll: [
            { label: "IMHA Referral Example (WAGOLL)", url: "#", note: "Example only - do not submit" },
          ],
          systemOne: [
            { label: "SystemOne Referral Guide", url: "#" },
          ],
          otherGuides: [
            { label: "IMHA Service Information", url: "#" },
            { label: "POhWER Advocacy Leaflet", url: "#", area: "city" },
            { label: "Cloverleaf Advocacy Leaflet", url: "#", area: "county" },
          ],
        },
      },
      {
        id: "submission",
        type: "submission",
        title: "Submit Referral",
        content: "Send the completed referral to the advocacy service:",
        methods: [
          { type: "email", label: "Derby City Advocacy (POhWER)", value: "derbyadvocacy@pohwer.net", area: "city" },
          { type: "phone", label: "POhWER Helpline", value: "0300 456 2370", area: "city" },
          { type: "email", label: "Derbyshire County (Cloverleaf)", value: "referrals@cloverleaf-advocacy.co.uk", area: "county" },
          { type: "phone", label: "Cloverleaf Helpline", value: "0300 012 4563", area: "county" },
        ],
      },
      {
        id: "casenote",
        type: "casenote",
        title: "Case Note Entry",
        content: "Copy this text to add to the patient's case notes:",
        clipboardText: "", // Will be generated dynamically
        isDynamic: true,
      },
      {
        id: "reminder",
        type: "reminder",
        title: "Job Diary",
        content: "Don't forget to update your job diary with this task.",
        checkboxLabel: "I have added/updated my job diary",
      },
      {
        id: "gdpr",
        type: "gdpr",
        title: "GDPR Reminder",
        content: "Data protection best practice: Delete the completed referral form from your computer if it is no longer needed. Do not store patient data locally.",
      },
    ],
  },
  "picu": {
    id: "picu",
    title: "PICU Referral",
    description: "Psychiatric Intensive Care Unit transfer request",
    icon: "🏥",
    gradient: "from-rose-500 to-rose-700",
    steps: [
      {
        id: "criteria",
        type: "criteria",
        title: "Confirm Criteria",
        content: "The patient presents a significant risk that cannot be safely managed on an open/acute ward. Consider: severe aggression, absconding risk, self-harm requiring enhanced observation.",
        checkboxLabel: "I confirm the patient meets PICU referral criteria",
      },
      {
        id: "forms",
        type: "forms",
        title: "Download Forms & Guides",
        content: "Download the appropriate forms and guides for your referral.",
        forms: {
          blank: [
            { label: "PICU Bed Request Form", url: "#", icon: "📄" },
            { label: "DHCFT PICU Referral", url: "#", icon: "📄" },
          ],
          wagoll: [
            { label: "PICU Referral Example (WAGOLL)", url: "#", note: "Example - shows required detail level" },
          ],
          systemOne: [
            { label: "SystemOne PICU Template", url: "#" },
          ],
          otherGuides: [
            { label: "PICU Admission Criteria", url: "#" },
            { label: "Transfer Checklist", url: "#" },
          ],
        },
      },
      {
        id: "submission",
        type: "submission",
        title: "Submit Referral",
        content: "Contact the PICU team for bed availability and submit referral:",
        methods: [
          { type: "phone", label: "PICU Direct Line", value: "01234 567890" },
          { type: "email", label: "PICU Coordinator", value: "picu.referrals@nhs.net" },
        ],
      },
      {
        id: "casenote",
        type: "casenote",
        title: "Case Note Entry",
        content: "Copy this text to add to the patient's case notes:",
        clipboardText: "PICU referral submitted on [DATE]. Patient requires transfer due to [CLINICAL REASONS]. Referral sent to [PICU NAME] via [METHOD]. Awaiting bed availability.",
      },
      {
        id: "reminder",
        type: "reminder",
        title: "Job Diary",
        content: "Add PICU follow-up to your job diary.",
        checkboxLabel: "I have added/updated my job diary",
      },
      {
        id: "gdpr",
        type: "gdpr",
        title: "GDPR Reminder",
        content: "Ensure all patient identifiable information is handled securely during transfer.",
      },
    ],
  },
  "safeguarding": {
    id: "safeguarding",
    title: "Safeguarding Adults",
    description: "Report safeguarding concerns - Derby City or County",
    icon: "🛡️",
    gradient: "from-red-600 to-red-800",
    steps: [
      {
        id: "criteria",
        type: "criteria",
        title: "Confirm Criteria",
        content: "An adult at risk (18+) who has care and support needs, is experiencing or at risk of abuse or neglect, and is unable to protect themselves because of those needs.",
        checkboxLabel: "I confirm this meets adult safeguarding criteria",
      },
      {
        id: "forms",
        type: "forms",
        title: "Download Forms & Guides",
        content: "Download the appropriate forms and guides for your area.",
        forms: {
          blank: [
            { label: "Derby City SAR Form", url: "#", icon: "📄" },
            { label: "Derbyshire County SAR Form", url: "#", icon: "📄" },
          ],
          wagoll: [
            { label: "Safeguarding Referral Example", url: "#", note: "Example - note level of detail required" },
          ],
          systemOne: [
            { label: "SystemOne Safeguarding Alert", url: "#" },
          ],
          otherGuides: [
            { label: "Types of Abuse Guide", url: "#" },
            { label: "DHCFT Safeguarding Policy", url: "#" },
            { label: "Making Safeguarding Personal", url: "#" },
          ],
        },
      },
      {
        id: "submission",
        type: "submission",
        title: "Submit Referral",
        content: "Submit to the appropriate local authority:",
        methods: [
          { type: "phone", label: "Derby City (Call Derbyshire)", value: "01onal 629 533190" },
          { type: "email", label: "Derby City Email", value: "safeguardingadultsreferral@derby.gov.uk" },
          { type: "phone", label: "Derbyshire County", value: "01629 533190" },
        ],
      },
      {
        id: "casenote",
        type: "casenote",
        title: "Case Note Entry",
        content: "Copy this text to add to the patient's case notes:",
        clipboardText: "Adult Safeguarding concern raised to [DERBY CITY/DERBYSHIRE COUNTY] on [DATE]. Concern relates to [TYPE OF ABUSE]. Referral sent via [METHOD]. Reference number: [IF GIVEN]. Patient [WAS/WAS NOT] informed of referral.",
      },
      {
        id: "reminder",
        type: "reminder",
        title: "Job Diary",
        content: "Add follow-up to track safeguarding outcome.",
        checkboxLabel: "I have added/updated my job diary",
      },
      {
        id: "gdpr",
        type: "gdpr",
        title: "GDPR Reminder",
        content: "Safeguarding overrides normal confidentiality - ensure senior staff are aware of the referral.",
      },
    ],
  },
  "dietitian": {
    id: "dietitian",
    title: "Dietitian Referral",
    description: "Nutritional assessment and support",
    icon: "🥗",
    gradient: "from-green-500 to-green-700",
    steps: [
      {
        id: "criteria",
        type: "criteria",
        title: "Confirm Criteria",
        content: "Patient requires nutritional assessment - consider: poor appetite, significant weight change, swallowing difficulties, specific dietary requirements, or eating disorder concerns.",
        checkboxLabel: "I confirm the patient would benefit from dietitian input",
      },
      {
        id: "forms",
        type: "forms",
        title: "Download Forms & Guides",
        content: "Download the appropriate forms and guides for your referral.",
        forms: {
          blank: [
            { label: "DHCFT Dietitian Referral Form", url: "#", icon: "📄" },
          ],
          wagoll: [
            { label: "Dietitian Referral Example", url: "#", note: "Include MUST score and weight history" },
          ],
          systemOne: [
            { label: "SystemOne Dietitian Referral", url: "#" },
          ],
          otherGuides: [
            { label: "MUST Assessment Guide", url: "#" },
            { label: "Nutrition Screening Tool", url: "#" },
          ],
        },
      },
      {
        id: "submission",
        type: "submission",
        title: "Submit Referral",
        content: "Submit to the dietetics team:",
        methods: [
          { type: "email", label: "Dietetics Team", value: "dietetics.referrals@nhs.net" },
          { type: "phone", label: "Dietetics Dept", value: "01234 567891" },
        ],
      },
      {
        id: "casenote",
        type: "casenote",
        title: "Case Note Entry",
        content: "Copy this text to add to the patient's case notes:",
        clipboardText: "Dietitian referral submitted on [DATE]. Patient referred due to [REASON]. Current MUST score: [SCORE]. Weight on admission: [WEIGHT]. Referral sent via [METHOD].",
      },
      {
        id: "reminder",
        type: "reminder",
        title: "Job Diary",
        content: "Add dietitian review follow-up to your diary.",
        checkboxLabel: "I have added/updated my job diary",
      },
      {
        id: "gdpr",
        type: "gdpr",
        title: "GDPR Reminder",
        content: "Delete the completed referral form from your downloads folder.",
      },
    ],
  },
  "safeguarding-children": {
    id: "safeguarding-children",
    title: "Safeguarding Children",
    description: "Starting Point referrals for child concerns",
    icon: "👶",
    gradient: "from-pink-500 to-pink-700",
    steps: [
      {
        id: "criteria",
        type: "criteria",
        title: "Confirm Criteria",
        content: "Concerns about a child (under 18) who may be at risk of harm, neglect, or abuse. This includes children of patients where parenting capacity is affected.",
        checkboxLabel: "I confirm there are child safeguarding concerns that require referral",
      },
      {
        id: "forms",
        type: "forms",
        title: "Download Forms & Guides",
        content: "Download the appropriate forms for Starting Point.",
        forms: {
          blank: [
            { label: "Starting Point Referral Form", url: "#", icon: "📄" },
          ],
          wagoll: [
            { label: "Children's Safeguarding Example", url: "#", note: "Note the level of detail required" },
          ],
          systemOne: [
            { label: "SystemOne Child Alert", url: "#" },
          ],
          otherGuides: [
            { label: "Signs of Abuse in Children", url: "#" },
            { label: "DHCFT Think Family Policy", url: "#" },
            { label: "Parental Mental Health Guide", url: "#" },
          ],
        },
      },
      {
        id: "submission",
        type: "submission",
        title: "Submit Referral",
        content: "Contact Starting Point immediately:",
        methods: [
          { type: "phone", label: "Starting Point (24hr)", value: "01onal 629 533190" },
          { type: "email", label: "Non-urgent referrals", value: "starting.point@derbyshire.gov.uk" },
        ],
      },
      {
        id: "casenote",
        type: "casenote",
        title: "Case Note Entry",
        content: "Document the safeguarding referral in notes:",
        clipboardText: "Child safeguarding concern referred to Starting Point on [DATE]. Concern relates to [CHILD NAME/DOB]. Nature of concern: [DETAILS]. Referral made via [PHONE/EMAIL]. Reference: [IF GIVEN]. Parent [WAS/WAS NOT] informed.",
      },
      {
        id: "reminder",
        type: "reminder",
        title: "Job Diary",
        content: "Add follow-up for Starting Point feedback.",
        checkboxLabel: "I have added/updated my job diary",
      },
      {
        id: "gdpr",
        type: "gdpr",
        title: "GDPR Reminder",
        content: "Safeguarding children overrides normal confidentiality rules. Ensure senior staff and safeguarding lead are aware.",
      },
    ],
  },
  "homeless-discharge": {
    id: "homeless-discharge",
    title: "Housing / Duty to Refer",
    description: "Homeless discharge and accommodation support",
    icon: "🏠",
    gradient: "from-orange-500 to-orange-700",
    steps: [
      {
        id: "criteria",
        type: "criteria",
        title: "Confirm Criteria",
        content: "Patient is homeless or at risk of homelessness within 56 days and consents to referral. This is a statutory Duty to Refer requirement for NHS bodies.",
        checkboxLabel: "I confirm the patient meets homeless referral criteria and consents",
      },
      {
        id: "forms",
        type: "forms",
        title: "Download Forms & Guides",
        content: "Download the Duty to Refer forms.",
        forms: {
          blank: [
            { label: "Derby City Duty to Refer", url: "#", icon: "📄" },
            { label: "Derbyshire County Duty to Refer", url: "#", icon: "📄" },
          ],
          wagoll: [
            { label: "Housing Referral Example", url: "#", note: "Include discharge date and needs" },
          ],
          systemOne: [
            { label: "SystemOne Housing Template", url: "#" },
          ],
          otherGuides: [
            { label: "Duty to Refer Guidance", url: "#" },
            { label: "Housing Options Leaflet", url: "#" },
          ],
        },
      },
      {
        id: "submission",
        type: "submission",
        title: "Submit Referral",
        content: "Submit to the local authority housing team:",
        methods: [
          { type: "email", label: "Derby City Housing", value: "housing.options@derby.gov.uk" },
          { type: "phone", label: "Derby Housing Line", value: "01332 640000" },
          { type: "email", label: "County Housing", value: "housing@derbyshire.gov.uk" },
        ],
      },
      {
        id: "casenote",
        type: "casenote",
        title: "Case Note Entry",
        content: "Document the housing referral:",
        clipboardText: "Duty to Refer (housing) referral submitted on [DATE] to [DERBY/COUNTY]. Patient consent obtained. Expected discharge: [DATE]. Current accommodation status: [DETAILS]. Reference: [IF GIVEN].",
      },
      {
        id: "reminder",
        type: "reminder",
        title: "Job Diary",
        content: "Add follow-up for housing assessment outcome.",
        checkboxLabel: "I have added/updated my job diary",
      },
      {
        id: "gdpr",
        type: "gdpr",
        title: "GDPR Reminder",
        content: "Patient consent is required for Duty to Refer. Document consent in notes.",
      },
    ],
  },
  "social-care": {
    id: "social-care",
    title: "Social Care",
    description: "Adult social care assessments and support",
    icon: "👥",
    gradient: "from-amber-500 to-amber-700",
    steps: [
      {
        id: "criteria",
        type: "criteria",
        title: "Confirm Criteria",
        content: "Patient may have care and support needs that require social care assessment. Consider: personal care, mobility, daily living activities, carers assessment.",
        checkboxLabel: "I confirm the patient may benefit from social care assessment",
      },
      {
        id: "forms",
        type: "forms",
        title: "Download Forms & Guides",
        content: "Download social care referral forms.",
        forms: {
          blank: [
            { label: "Derby City ASC Referral", url: "#", icon: "📄" },
            { label: "Derbyshire County ASC Referral", url: "#", icon: "📄" },
          ],
          wagoll: [
            { label: "Social Care Referral Example", url: "#", note: "Include functional abilities and needs" },
          ],
          systemOne: [
            { label: "SystemOne Social Care Template", url: "#" },
          ],
          otherGuides: [
            { label: "Care Act Eligibility Guide", url: "#" },
            { label: "Carers Assessment Info", url: "#" },
          ],
        },
      },
      {
        id: "submission",
        type: "submission",
        title: "Submit Referral",
        content: "Submit to adult social care:",
        methods: [
          { type: "phone", label: "Call Derbyshire", value: "01629 533190" },
          { type: "email", label: "Derby City ASC", value: "adultsocialcare@derby.gov.uk" },
        ],
      },
      {
        id: "casenote",
        type: "casenote",
        title: "Case Note Entry",
        content: "Document the social care referral:",
        clipboardText: "Adult Social Care referral submitted on [DATE] to [DERBY/COUNTY]. Referral reason: [NEEDS IDENTIFIED]. Referral sent via [METHOD]. Reference: [IF GIVEN].",
      },
      {
        id: "reminder",
        type: "reminder",
        title: "Job Diary",
        content: "Add follow-up for social care assessment.",
        checkboxLabel: "I have added/updated my job diary",
      },
      {
        id: "gdpr",
        type: "gdpr",
        title: "GDPR Reminder",
        content: "Ensure patient is aware of and consents to social care referral where possible.",
      },
    ],
  },
  "tissue-viability": {
    id: "tissue-viability",
    title: "Tissue Viability",
    description: "Wound care and pressure ulcer concerns",
    icon: "🩹",
    gradient: "from-teal-500 to-teal-700",
    steps: [
      {
        id: "criteria",
        type: "criteria",
        title: "Confirm Criteria",
        content: "Patient has a wound requiring specialist assessment, pressure damage (category 2+), or is at high risk of pressure injury (Waterlow 15+).",
        checkboxLabel: "I confirm tissue viability referral criteria are met",
      },
      {
        id: "forms",
        type: "forms",
        title: "Download Forms & Guides",
        content: "Download tissue viability referral forms.",
        forms: {
          blank: [
            { label: "TV Referral Form", url: "#", icon: "📄" },
          ],
          wagoll: [
            { label: "TV Referral Example", url: "#", note: "Include wound measurements and photos" },
          ],
          systemOne: [
            { label: "SystemOne Wound Template", url: "#" },
          ],
          otherGuides: [
            { label: "Pressure Ulcer Classification", url: "#" },
            { label: "Waterlow Assessment Guide", url: "#" },
            { label: "Wound Photography Policy", url: "#" },
          ],
        },
      },
      {
        id: "submission",
        type: "submission",
        title: "Submit Referral",
        content: "Contact the Tissue Viability service:",
        methods: [
          { type: "email", label: "TV Team", value: "tissueviability@nhs.net" },
          { type: "phone", label: "TV Nurse Ext", value: "Ext. 5678" },
        ],
      },
      {
        id: "casenote",
        type: "casenote",
        title: "Case Note Entry",
        content: "Document the TV referral:",
        clipboardText: "Tissue Viability referral submitted on [DATE]. Wound location: [SITE]. Category: [GRADE]. Waterlow score: [SCORE]. Photos attached: [YES/NO]. Referral sent via [METHOD].",
      },
      {
        id: "reminder",
        type: "reminder",
        title: "Job Diary",
        content: "Add follow-up for TV review.",
        checkboxLabel: "I have added/updated my job diary",
      },
      {
        id: "gdpr",
        type: "gdpr",
        title: "GDPR Reminder",
        content: "Wound photos should be taken with trust equipment and stored appropriately.",
      },
    ],
  },
  "dental": {
    id: "dental",
    title: "Dental Referral",
    description: "Dental care access for inpatients",
    icon: "🦷",
    gradient: "from-cyan-500 to-cyan-700",
    steps: [
      {
        id: "criteria",
        type: "criteria",
        title: "Confirm Criteria",
        content: "Patient has dental pain, dental infection, or requires dental assessment for care planning purposes.",
        checkboxLabel: "I confirm the patient requires dental referral",
      },
      {
        id: "forms",
        type: "forms",
        title: "Download Forms & Guides",
        content: "Download dental referral information.",
        forms: {
          blank: [
            { label: "Special Care Dentistry Referral", url: "#", icon: "📄" },
          ],
          wagoll: [
            { label: "Dental Referral Example", url: "#", note: "Include MH history and capacity" },
          ],
          systemOne: [
            { label: "SystemOne Dental Notes", url: "#" },
          ],
          otherGuides: [
            { label: "Emergency Dental Access", url: "#" },
            { label: "Oral Health Assessment Guide", url: "#" },
          ],
        },
      },
      {
        id: "submission",
        type: "submission",
        title: "Submit Referral",
        content: "Submit to dental services:",
        methods: [
          { type: "phone", label: "Special Care Dental", value: "01234 567892" },
          { type: "email", label: "Dental Referrals", value: "dental.referrals@nhs.net" },
        ],
      },
      {
        id: "casenote",
        type: "casenote",
        title: "Case Note Entry",
        content: "Document the dental referral:",
        clipboardText: "Dental referral submitted on [DATE]. Reason for referral: [SYMPTOMS]. Capacity for consent: [YES/NO]. Referral sent to Special Care Dentistry via [METHOD].",
      },
      {
        id: "reminder",
        type: "reminder",
        title: "Job Diary",
        content: "Add follow-up for dental appointment.",
        checkboxLabel: "I have added/updated my job diary",
      },
      {
        id: "gdpr",
        type: "gdpr",
        title: "GDPR Reminder",
        content: "Delete referral form from downloads after submission.",
      },
    ],
  },
  "physio": {
    id: "physio",
    title: "Physiotherapy",
    description: "Physical therapy and mobility assessment",
    icon: "🏃",
    gradient: "from-emerald-500 to-emerald-700",
    steps: [
      {
        id: "criteria",
        type: "criteria",
        title: "Confirm Criteria",
        content: "Patient has mobility concerns, falls history, physical deconditioning, or requires mobility assessment for discharge planning.",
        checkboxLabel: "I confirm the patient would benefit from physiotherapy input",
      },
      {
        id: "forms",
        type: "forms",
        title: "Download Forms & Guides",
        content: "Download physiotherapy referral forms.",
        forms: {
          blank: [
            { label: "Physio Referral Form", url: "#", icon: "📄" },
          ],
          wagoll: [
            { label: "Physio Referral Example", url: "#", note: "Include falls history and mobility level" },
          ],
          systemOne: [
            { label: "SystemOne Physio Template", url: "#" },
          ],
          otherGuides: [
            { label: "Falls Risk Assessment", url: "#" },
            { label: "Mobility Assessment Guide", url: "#" },
          ],
        },
      },
      {
        id: "submission",
        type: "submission",
        title: "Submit Referral",
        content: "Submit to physiotherapy:",
        methods: [
          { type: "email", label: "Physio Team", value: "physio.referrals@nhs.net" },
          { type: "phone", label: "Physio Dept", value: "Ext. 4567" },
        ],
      },
      {
        id: "casenote",
        type: "casenote",
        title: "Case Note Entry",
        content: "Document the physio referral:",
        clipboardText: "Physiotherapy referral submitted on [DATE]. Reason: [MOBILITY CONCERNS]. Falls in last 12 months: [NUMBER]. Current mobility: [LEVEL]. Referral sent via [METHOD].",
      },
      {
        id: "reminder",
        type: "reminder",
        title: "Job Diary",
        content: "Add follow-up for physio assessment.",
        checkboxLabel: "I have added/updated my job diary",
      },
      {
        id: "gdpr",
        type: "gdpr",
        title: "GDPR Reminder",
        content: "Delete referral form from downloads after submission.",
      },
    ],
  },
  "ot": {
    id: "ot",
    title: "Occupational Therapy",
    description: "OT assessment and functional review",
    icon: "🧩",
    gradient: "from-violet-500 to-violet-700",
    steps: [
      {
        id: "criteria",
        type: "criteria",
        title: "Confirm Criteria",
        content: "Patient requires functional assessment, ADL support, equipment needs, or OT input for discharge planning and community living skills.",
        checkboxLabel: "I confirm the patient would benefit from OT assessment",
      },
      {
        id: "forms",
        type: "forms",
        title: "Download Forms & Guides",
        content: "Download OT referral forms.",
        forms: {
          blank: [
            { label: "OT Referral Form", url: "#", icon: "📄" },
          ],
          wagoll: [
            { label: "OT Referral Example", url: "#", note: "Include current functional level" },
          ],
          systemOne: [
            { label: "SystemOne OT Template", url: "#" },
          ],
          otherGuides: [
            { label: "Functional Assessment Guide", url: "#" },
            { label: "OT Services Overview", url: "#" },
          ],
        },
      },
      {
        id: "submission",
        type: "submission",
        title: "Submit Referral",
        content: "Submit to OT team:",
        methods: [
          { type: "email", label: "OT Team", value: "ot.referrals@nhs.net" },
          { type: "phone", label: "Ward OT", value: "Ext. 3456" },
        ],
      },
      {
        id: "casenote",
        type: "casenote",
        title: "Case Note Entry",
        content: "Document the OT referral:",
        clipboardText: "Occupational Therapy referral submitted on [DATE]. Reason: [FUNCTIONAL CONCERNS]. Goals: [DISCHARGE PLANNING/ADL SUPPORT/EQUIPMENT]. Referral sent via [METHOD].",
      },
      {
        id: "reminder",
        type: "reminder",
        title: "Job Diary",
        content: "Add follow-up for OT assessment.",
        checkboxLabel: "I have added/updated my job diary",
      },
      {
        id: "gdpr",
        type: "gdpr",
        title: "GDPR Reminder",
        content: "Delete referral form from downloads after submission.",
      },
    ],
  },
  "speech-therapy": {
    id: "speech-therapy",
    title: "Speech & Language",
    description: "SALT assessment and swallowing review",
    icon: "💬",
    gradient: "from-purple-500 to-purple-700",
    steps: [
      {
        id: "criteria",
        type: "criteria",
        title: "Confirm Criteria",
        content: "Patient has swallowing difficulties (dysphagia), communication difficulties, or requires SALT assessment for safe oral intake.",
        checkboxLabel: "I confirm the patient requires SALT assessment",
      },
      {
        id: "forms",
        type: "forms",
        title: "Download Forms & Guides",
        content: "Download SALT referral forms.",
        forms: {
          blank: [
            { label: "SALT Referral Form", url: "#", icon: "📄" },
          ],
          wagoll: [
            { label: "SALT Referral Example", url: "#", note: "Include swallowing observations" },
          ],
          systemOne: [
            { label: "SystemOne SALT Template", url: "#" },
          ],
          otherGuides: [
            { label: "Dysphagia Screening Guide", url: "#" },
            { label: "Modified Diet Textures", url: "#" },
            { label: "Choking Risk Signs", url: "#" },
          ],
        },
      },
      {
        id: "submission",
        type: "submission",
        title: "Submit Referral",
        content: "Submit to SALT team:",
        methods: [
          { type: "email", label: "SALT Team", value: "salt.referrals@nhs.net" },
          { type: "phone", label: "SALT Urgent", value: "Ext. 2345" },
        ],
      },
      {
        id: "casenote",
        type: "casenote",
        title: "Case Note Entry",
        content: "Document the SALT referral:",
        clipboardText: "Speech and Language Therapy referral submitted on [DATE]. Reason: [SWALLOWING/COMMUNICATION CONCERNS]. Current diet: [TEXTURE]. Concerns observed: [DETAILS]. Referral sent via [METHOD].",
      },
      {
        id: "reminder",
        type: "reminder",
        title: "Job Diary",
        content: "Add follow-up for SALT assessment.",
        checkboxLabel: "I have added/updated my job diary",
      },
      {
        id: "gdpr",
        type: "gdpr",
        title: "GDPR Reminder",
        content: "Delete referral form from downloads after submission.",
      },
    ],
  },
  "edt": {
    id: "edt",
    title: "Early Discharge Team",
    description: "EDT referral for discharge planning support",
    icon: "🚪",
    gradient: "from-sky-500 to-sky-700",
    steps: [
      {
        id: "criteria",
        type: "criteria",
        title: "Confirm Criteria",
        content: "Patient is approaching discharge and requires coordination support. EDT can help with complex discharges involving housing, social care, or multi-agency coordination.",
        checkboxLabel: "I confirm the patient would benefit from EDT involvement",
      },
      {
        id: "forms",
        type: "forms",
        title: "Download Forms & Guides",
        content: "Download EDT referral documentation.",
        forms: {
          blank: [
            { label: "EDT Referral Prompt", url: "#", icon: "📄" },
          ],
          wagoll: [],
          systemOne: [
            { label: "SystemOne EDT Template", url: "#" },
          ],
          otherGuides: [
            { label: "EDT Flow Chart", url: "#" },
            { label: "Discharge Planning Checklist", url: "#" },
          ],
        },
      },
      {
        id: "submission",
        type: "submission",
        title: "Submit Referral",
        content: "Contact the Early Discharge Team:",
        methods: [
          { type: "email", label: "EDT Referrals", value: "edt.referrals@example.nhs.net" },
          { type: "phone", label: "EDT Office", value: "01onal 234 5678" },
        ],
      },
      {
        id: "casenote",
        type: "casenote",
        title: "Case Note Entry",
        content: "Document the EDT referral:",
        clipboardText: "Early Discharge Team referral submitted on [DATE]. Patient requires EDT support for [HOUSING/SOCIAL CARE/MULTI-AGENCY COORDINATION]. Estimated discharge date: [DATE]. Referral sent via [METHOD].",
      },
      {
        id: "reminder",
        type: "reminder",
        title: "Job Diary",
        content: "Add EDT follow-up to your job diary.",
        checkboxLabel: "I have added/updated my job diary",
      },
      {
        id: "gdpr",
        type: "gdpr",
        title: "GDPR Reminder",
        content: "Delete referral documentation when no longer needed.",
      },
    ],
  },
  "erp": {
    id: "erp",
    title: "Emotional Regulation (ERP/DBT)",
    description: "DBT skills and emotional regulation pathway",
    icon: "🧠",
    gradient: "from-fuchsia-500 to-fuchsia-700",
    steps: [
      {
        id: "criteria",
        type: "criteria",
        title: "Confirm Criteria",
        content: "Patient would benefit from Dialectical Behaviour Therapy (DBT) skills training or Structured Clinical Management (SCM). Consider for patients with emotional dysregulation, self-harm, or personality disorder presentations.",
        checkboxLabel: "I confirm the patient meets criteria for ERP/DBT pathway",
      },
      {
        id: "forms",
        type: "forms",
        title: "Download Forms & Guides",
        content: "Download ERP referral forms and patient information.",
        forms: {
          blank: [
            { label: "ERP Referral Form v5", url: "#", icon: "📄" },
            { label: "SV2 Referral Form", url: "#", icon: "📄" },
          ],
          wagoll: [
            { label: "ERP Referral Example", url: "#", note: "Include history and current presentation" },
          ],
          systemOne: [],
          otherGuides: [
            { label: "DBT Patient Leaflet", url: "#" },
            { label: "SCM Patient Leaflet", url: "#" },
            { label: "Coping with Emotions Leaflet", url: "#" },
          ],
        },
      },
      {
        id: "submission",
        type: "submission",
        title: "Submit Referral",
        content: "Submit to the ERP team:",
        methods: [
          { type: "email", label: "ERP Referrals", value: "erp.referrals@example.nhs.net" },
        ],
      },
      {
        id: "casenote",
        type: "casenote",
        title: "Case Note Entry",
        content: "Document the ERP referral:",
        clipboardText: "Emotional Regulation Programme (ERP) referral submitted on [DATE]. Patient referred for [DBT/SCM] pathway. Presentation: [EMOTIONAL DYSREGULATION/SELF-HARM/OTHER]. Referral sent via email.",
      },
      {
        id: "reminder",
        type: "reminder",
        title: "Job Diary",
        content: "Add ERP follow-up to track assessment date.",
        checkboxLabel: "I have added/updated my job diary",
      },
      {
        id: "gdpr",
        type: "gdpr",
        title: "GDPR Reminder",
        content: "Delete completed referral form from your computer.",
      },
    ],
  },
  "ctr-dsp": {
    id: "ctr-dsp",
    title: "CTR / DSP Review",
    description: "Care Treatment Review and Dynamic Support Plan for ASD/LD patients",
    icon: "📋",
    gradient: "from-lime-600 to-lime-800",
    steps: [
      {
        id: "criteria",
        type: "criteria",
        title: "Confirm Criteria",
        content: "MANDATORY for all patients with Autism Spectrum Disorder (ASD) or Learning Disability (LD). Care Treatment Reviews (CTR) and Dynamic Support Plans (DSP) are required to ensure appropriate care and reduce length of stay.",
        checkboxLabel: "I confirm the patient has ASD or LD and requires CTR/DSP",
      },
      {
        id: "consent",
        type: "consent",
        title: "Patient/Carer Consent",
        content: "Complete the DSP consent form with the patient or their carer/representative. An Easy Read version is available.",
      },
      {
        id: "forms",
        type: "forms",
        title: "Download Forms & Guides",
        content: "Download CTR/DSP referral forms and consent documentation.",
        forms: {
          blank: [
            { label: "JUCD CTR/DSP Referral Form", url: "#", icon: "📄" },
            { label: "DSP Consent Form", url: "#", icon: "📄" },
            { label: "DSP Consent Form (Easy Read)", url: "#", icon: "📄" },
          ],
          wagoll: [
            { label: "DSP Example", url: "#", note: "Shows required level of detail" },
          ],
          systemOne: [],
          otherGuides: [
            { label: "DSP Consent Form Guidance", url: "#" },
            { label: "CTR Process Overview", url: "#" },
            { label: "Keyworking Guidance", url: "#" },
          ],
        },
      },
      {
        id: "submission",
        type: "submission",
        title: "Submit Referral",
        content: "Submit to the JUCD Keyworking Team:",
        methods: [
          { type: "email", label: "JUCD Keyworking", value: "keyworking@example.nhs.net" },
          { type: "phone", label: "Keyworking Team", value: "01onal 234 5678" },
        ],
      },
      {
        id: "casenote",
        type: "casenote",
        title: "Case Note Entry",
        content: "Document the CTR/DSP referral:",
        clipboardText: "CTR/DSP referral submitted to JUCD Keyworking Team on [DATE]. Patient has [AUTISM/LEARNING DISABILITY]. DSP consent [OBTAINED/PENDING]. Referral form completed and sent via [METHOD]. Awaiting keyworker allocation.",
      },
      {
        id: "reminder",
        type: "reminder",
        title: "Job Diary",
        content: "CTR reviews have specific timescales - add diary entries for follow-up.",
        checkboxLabel: "I have added/updated my job diary for CTR timescales",
      },
      {
        id: "gdpr",
        type: "gdpr",
        title: "GDPR Reminder",
        content: "Consent forms contain sensitive data - store securely and delete local copies after upload to clinical system.",
      },
    ],
  },
  "benefits-review": {
    id: "benefits-review",
    title: "Benefits Review",
    description: "DWP benefits review and welfare rights support",
    icon: "💷",
    gradient: "from-yellow-600 to-yellow-800",
    steps: [
      {
        id: "criteria",
        type: "criteria",
        title: "Confirm Criteria",
        content: "Patient may need support with benefits claims, DWP assessments, or welfare rights advice. Consider for patients with changes in circumstances, approaching discharge, or financial concerns.",
        checkboxLabel: "I confirm the patient would benefit from welfare rights support",
      },
      {
        id: "forms",
        type: "forms",
        title: "Download Forms & Guides",
        content: "Download benefits review referral information.",
        forms: {
          blank: [
            { label: "Benefits Review Referral", url: "#", icon: "📄" },
          ],
          wagoll: [],
          systemOne: [],
          otherGuides: [
            { label: "Welfare Rights Contact List", url: "#" },
            { label: "Benefits During Hospital Stay", url: "#" },
          ],
        },
      },
      {
        id: "submission",
        type: "submission",
        title: "Submit Referral",
        content: "Contact welfare rights services:",
        methods: [
          { type: "phone", label: "Citizens Advice", value: "0800 144 8848" },
          { type: "email", label: "Trust Welfare Rights", value: "welfare.rights@example.nhs.net" },
        ],
      },
      {
        id: "casenote",
        type: "casenote",
        title: "Case Note Entry",
        content: "Document the benefits review referral:",
        clipboardText: "Benefits review referral made on [DATE]. Patient requires support with [PIP/ESA/UC/OTHER]. Referred to [CITIZENS ADVICE/WELFARE RIGHTS]. Contact made via [METHOD].",
      },
      {
        id: "reminder",
        type: "reminder",
        title: "Job Diary",
        content: "Add follow-up for benefits review outcome.",
        checkboxLabel: "I have added/updated my job diary",
      },
      {
        id: "gdpr",
        type: "gdpr",
        title: "GDPR Reminder",
        content: "Benefits information is sensitive - handle securely.",
      },
    ],
  },
};

// Default workflow for unmapped referrals
const DEFAULT_WORKFLOW: WorkflowData = {
  id: "default",
  title: "Referral Workflow",
  description: "Step-by-step referral guidance",
  icon: "📋",
  gradient: "from-slate-500 to-slate-700",
  steps: [
    {
      id: "criteria",
      type: "criteria",
      title: "Confirm Criteria",
      content: "Review the referral criteria and confirm the patient meets the requirements.",
      checkboxLabel: "I confirm the patient meets referral criteria",
    },
    {
      id: "forms",
      type: "forms",
      title: "Download Forms & Guides",
      content: "Download the appropriate forms and guides for your referral.",
      forms: {
        blank: [
          { label: "Blank Referral Form", url: "#", icon: "📄" },
        ],
        wagoll: [
          { label: "Example Referral (WAGOLL)", url: "#", note: "Example only - do not submit" },
        ],
        systemOne: [
          { label: "SystemOne Guide", url: "#" },
        ],
        otherGuides: [
          { label: "Additional Guidance", url: "#" },
        ],
      },
    },
    {
      id: "submission",
      type: "submission",
      title: "Submit Referral",
      content: "Send the completed referral to the appropriate service.",
      methods: [
        { type: "email", label: "Referral Email", value: "referrals@example.nhs.net" },
      ],
    },
    {
      id: "casenote",
      type: "casenote",
      title: "Case Note Entry",
      content: "Copy this text to add to the patient's case notes:",
      clipboardText: "Referral submitted on [DATE] to [SERVICE] via [METHOD]. Reason for referral: [DETAILS]. Reference: [IF GIVEN].",
    },
    {
      id: "reminder",
      type: "reminder",
      title: "Job Diary",
      content: "Don't forget to update your job diary.",
      checkboxLabel: "I have added/updated my job diary",
    },
    {
      id: "gdpr",
      type: "gdpr",
      title: "GDPR Reminder",
      content: "Delete the completed referral form from your computer. Do not store patient data locally.",
    },
  ],
};

// Types
interface WorkflowForm {
  label: string;
  url: string;
  icon?: string;
  note?: string;
  area?: "city" | "county"; // For area-filtered forms
}

interface WorkflowForms {
  blank: WorkflowForm[];
  wagoll: WorkflowForm[];
  systemOne: WorkflowForm[];
  otherGuides: WorkflowForm[];
}

interface SubmissionMethod {
  type: "email" | "phone" | "portal";
  label: string;
  value: string;
  area?: "city" | "county"; // For area-filtered methods
}

interface WorkflowStep {
  id: string;
  type: "criteria" | "consent" | "section" | "area" | "forms" | "submission" | "casenote" | "reminder" | "gdpr";
  title: string;
  content: string;
  checkboxLabel?: string;
  forms?: WorkflowForms;
  methods?: SubmissionMethod[];
  clipboardText?: string;
  isDynamic?: boolean; // For dynamically generated content
}

interface WorkflowData {
  id: string;
  title: string;
  description: string;
  icon: string;
  gradient: string;
  steps: WorkflowStep[];
}

const STEP_ICONS: Record<string, typeof CheckCircle> = {
  criteria: CheckCircle,
  consent: CheckCircle,
  section: FileText,
  area: FileText,
  forms: FileText,
  submission: Send,
  casenote: Clipboard,
  reminder: Calendar,
  gdpr: Shield,
};

const STEP_GRADIENTS: Record<string, string> = {
  criteria: "from-emerald-500 to-emerald-700",
  consent: "from-teal-500 to-teal-700",
  section: "from-indigo-500 to-indigo-700",
  area: "from-violet-500 to-violet-700",
  forms: "from-blue-500 to-blue-700",
  submission: "from-purple-500 to-purple-700",
  casenote: "from-amber-500 to-amber-700",
  reminder: "from-orange-500 to-orange-700",
  gdpr: "from-slate-500 to-slate-700",
};

// Section options for MHA status
const SECTION_OPTIONS = [
  { value: "section_2", label: "Section 2" },
  { value: "section_3", label: "Section 3" },
  { value: "cto", label: "CTO (Community Treatment Order)" },
  { value: "informal", label: "Informal" },
];

// Area options
const AREA_OPTIONS = [
  { value: "city", label: "Derby City", description: "POhWER Advocacy Service" },
  { value: "county", label: "Derbyshire County", description: "Cloverleaf Advocacy Service" },
];

export default function WorkflowPage() {
  const params = useParams();
  const router = useRouter();
  const { hasFeature, user } = useApp();
  const { addTask } = useTasks();
  const { canEdit } = useCanEdit();
  const [currentStep, setCurrentStep] = useState(0);
  const [criteriaConfirmed, setCriteriaConfirmed] = useState(false);
  const [reminderConfirmed, setReminderConfirmed] = useState(false);
  const [copied, setCopied] = useState(false);

  // IMHA-specific state
  const [patientConsent, setPatientConsent] = useState<"yes" | "no" | null>(null);
  const [patientSection, setPatientSection] = useState<string>("");
  const [selectedArea, setSelectedArea] = useState<"city" | "county" | null>(null);
  const [systemOnePushed, setSystemOnePushed] = useState(false);

  // Patient linking state
  const [showPatientPicker, setShowPatientPicker] = useState(false);
  const [linkedPatient, setLinkedPatient] = useState<Patient | null>(null);

  const hasSystemOneIntegration = hasFeature("systemon_notes");

  // Handle patient selection
  const handlePatientSelect = (patient: Patient) => {
    setLinkedPatient(patient);

    // Create a task in the job diary
    const today = new Date().toISOString().split("T")[0];
    addTask({
      id: `task-referral-${Date.now()}`,
      type: "patient",
      title: `${workflow.title} - ${patient.name}`,
      category: "referral",
      patientName: patient.name,
      ward: patient.ward,
      priority: "routine",
      status: "pending",
      dueDate: today,
      createdAt: today,
      createdBy: user?.name || "Unknown",
      carryOver: true,
      linkedReferralId: workflowId,
    });

    // Log to console (would be audit log in production)
    console.log(`[AUDIT LOG] ${new Date().toISOString()} - User: ${user?.name} - Accessed referral "${workflow.title}" for patient ${patient.name} (${patient.ward} Ward)`);
  };

  const workflowId = params.id as string;
  const workflow = WORKFLOWS[workflowId] || DEFAULT_WORKFLOW;
  const step = workflow.steps[currentStep];
  const StepIcon = STEP_ICONS[step.type] || CheckCircle;

  // Generate today's date in UK format
  const todayDate = new Date().toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

  // Generate dynamic case note for IMHA
  const generateCaseNote = () => {
    if (workflowId !== "imha-advocacy") return step.clipboardText || "";

    const areaName = selectedArea === "city" ? "Derby City Advocacy (POhWER)" : "Derbyshire County (Cloverleaf)";
    const areaEmail = selectedArea === "city" ? "derbyadvocacy@pohwer.net" : "referrals@cloverleaf-advocacy.co.uk";
    const sectionText = patientSection === "informal" ? "Informal" : patientSection?.replace("_", " ").replace(/\b\w/g, l => l.toUpperCase()) || "[SECTION]";

    return `Referral for IMHA sent to ${areaName} via email to ${areaEmail} on ${todayDate}. Patient is detained under ${sectionText} and would benefit from independent advocacy support.`;
  };

  const canProceed = () => {
    if (step.type === "criteria") return criteriaConfirmed;
    if (step.type === "consent") return patientConsent !== null;
    if (step.type === "section") return patientSection !== "";
    if (step.type === "area") return selectedArea !== null;
    if (step.type === "reminder") return reminderConfirmed;
    return true;
  };

  const handleNext = () => {
    if (currentStep < workflow.steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isComplete = currentStep === workflow.steps.length - 1;

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header with gradient */}
        <div className={`bg-gradient-to-r ${workflow.gradient} rounded-2xl p-6 text-white`}>
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => router.push("/referrals")}
              className="p-2 rounded-lg hover:bg-white/20 transition-colors inline-flex items-center gap-2"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="font-medium">Back to Referrals</span>
            </button>
            <div className="flex items-center gap-2">
              {canEdit && (
                <Link
                  href="/admin/workflows"
                  className="flex items-center gap-2 px-3 py-1.5 bg-white/20 hover:bg-white/30 rounded-lg text-sm font-semibold transition-colors no-underline"
                >
                  <Pencil className="w-4 h-4" />
                  Edit
                </Link>
              )}
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center flex-shrink-0">
              <span className="text-4xl">{workflow.icon}</span>
            </div>
            <div className="flex-1">
              <h1 className="text-2xl md:text-3xl font-bold">{workflow.title}</h1>
              <p className="text-white/80 text-lg">{workflow.description}</p>
            </div>
          </div>

          {/* Link to Patient button */}
          <div className="mt-4 pt-4 border-t border-white/20">
            {linkedPatient ? (
              <div className="flex items-center justify-between bg-white/20 rounded-xl p-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/30 rounded-lg flex items-center justify-center">
                    <UserPlus className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-semibold">{linkedPatient.name}</p>
                    <p className="text-white/70 text-sm">{linkedPatient.ward} Ward - Room {linkedPatient.room}</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowPatientPicker(true)}
                  className="px-3 py-1.5 bg-white/20 hover:bg-white/30 rounded-lg text-sm font-medium transition-colors"
                >
                  Change
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowPatientPicker(true)}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-white/20 hover:bg-white/30 rounded-xl font-semibold transition-colors"
              >
                <UserPlus className="w-5 h-5" />
                Link to Patient
              </button>
            )}
            <p className="text-white/60 text-xs text-center mt-2">
              Linking creates a job diary task and audit log entry
            </p>
          </div>
        </div>

        {/* Progress bar */}
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center gap-1 mb-2">
            {workflow.steps.map((s, index) => (
              <div
                key={s.id}
                className={`flex-1 h-3 rounded-full transition-all duration-300 ${
                  index < currentStep
                    ? "bg-green-500"
                    : index === currentStep
                    ? `bg-gradient-to-r ${STEP_GRADIENTS[s.type]}`
                    : "bg-gray-200"
                }`}
              />
            ))}
          </div>
          <p className="text-sm text-gray-600 text-center font-medium">
            Step {currentStep + 1} of {workflow.steps.length}: {step.title}
          </p>
        </div>

        {/* Step content */}
        <Card className="overflow-hidden">
          <div className={`h-2 bg-gradient-to-r ${STEP_GRADIENTS[step.type]}`} />
          <CardContent className="py-8 px-6">
            <div className="flex items-center gap-4 mb-6">
              <div className={`w-16 h-16 bg-gradient-to-br ${STEP_GRADIENTS[step.type]} rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg`}>
                <StepIcon className="w-8 h-8 text-white" />
              </div>
              <div>
                <Badge className={`bg-gradient-to-r ${STEP_GRADIENTS[step.type]} text-white border-0`}>
                  {step.type.toUpperCase()}
                </Badge>
                <h2 className="text-xl md:text-2xl font-bold text-gray-900 mt-1">
                  {step.title}
                </h2>
              </div>
            </div>

            <p className="text-gray-600 text-lg mb-6">{step.content}</p>

            {/* Step-specific content */}
            {step.type === "criteria" && (
              <label className="flex items-start gap-4 p-5 bg-gradient-to-r from-emerald-50 to-green-50 rounded-xl cursor-pointer border-2 border-emerald-200 hover:border-emerald-400 transition-colors">
                <input
                  type="checkbox"
                  checked={criteriaConfirmed}
                  onChange={(e) => setCriteriaConfirmed(e.target.checked)}
                  className="mt-1 w-6 h-6 rounded border-emerald-400 text-emerald-600 focus:ring-emerald-500"
                />
                <span className="text-gray-800 font-medium text-lg">
                  {step.checkboxLabel}
                </span>
              </label>
            )}

            {step.type === "consent" && (
              <div className="space-y-3">
                <button
                  onClick={() => setPatientConsent("yes")}
                  className={`w-full p-5 rounded-xl text-left flex items-center gap-4 transition-all border-2 ${
                    patientConsent === "yes"
                      ? "bg-gradient-to-r from-green-500 to-emerald-600 text-white border-green-500"
                      : "bg-green-50 text-gray-800 border-green-200 hover:border-green-400"
                  }`}
                >
                  <span className="text-3xl">✅</span>
                  <div>
                    <p className="font-bold text-lg">Patient Consents</p>
                    <p className={patientConsent === "yes" ? "text-white/80" : "text-gray-500"}>
                      I have asked and the patient consents to IMHA referral
                    </p>
                  </div>
                </button>
                <button
                  onClick={() => setPatientConsent("no")}
                  className={`w-full p-5 rounded-xl text-left flex items-center gap-4 transition-all border-2 ${
                    patientConsent === "no"
                      ? "bg-gradient-to-r from-amber-500 to-orange-600 text-white border-amber-500"
                      : "bg-amber-50 text-gray-800 border-amber-200 hover:border-amber-400"
                  }`}
                >
                  <span className="text-3xl">⚠️</span>
                  <div>
                    <p className="font-bold text-lg">Patient Does Not Consent</p>
                    <p className={patientConsent === "no" ? "text-white/80" : "text-gray-500"}>
                      Patient has declined or cannot give consent (referral can still proceed)
                    </p>
                  </div>
                </button>
              </div>
            )}

            {step.type === "section" && (
              <div className="grid grid-cols-2 gap-3">
                {SECTION_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setPatientSection(option.value)}
                    className={`p-5 rounded-xl text-center transition-all border-2 ${
                      patientSection === option.value
                        ? "bg-gradient-to-r from-indigo-500 to-purple-600 text-white border-indigo-500"
                        : "bg-indigo-50 text-gray-800 border-indigo-200 hover:border-indigo-400"
                    }`}
                  >
                    <p className="font-bold text-lg">{option.label}</p>
                  </button>
                ))}
              </div>
            )}

            {step.type === "area" && (
              <div className="space-y-3">
                {AREA_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setSelectedArea(option.value as "city" | "county")}
                    className={`w-full p-5 rounded-xl text-left flex items-center gap-4 transition-all border-2 ${
                      selectedArea === option.value
                        ? "bg-gradient-to-r from-violet-500 to-purple-600 text-white border-violet-500"
                        : "bg-violet-50 text-gray-800 border-violet-200 hover:border-violet-400"
                    }`}
                  >
                    <span className="text-3xl">{option.value === "city" ? "🏙️" : "🌳"}</span>
                    <div>
                      <p className="font-bold text-lg">{option.label}</p>
                      <p className={selectedArea === option.value ? "text-white/80" : "text-gray-500"}>
                        {option.description}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {step.type === "forms" && step.forms && (
              <div className="space-y-6">
                {/* Blank Forms - filtered by area if applicable */}
                {step.forms.blank.length > 0 && (
                  <div>
                    <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                      <Download className="w-5 h-5 text-blue-600" />
                      Blank Forms
                    </h3>
                    <div className="space-y-2">
                      {step.forms.blank
                        .filter((form) => !form.area || form.area === selectedArea)
                        .map((form) => (
                        <a
                          key={form.label}
                          href={form.url}
                          className="flex items-center gap-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl hover:from-blue-100 hover:to-indigo-100 transition-colors no-underline border border-blue-200"
                        >
                          <span className="text-2xl">{form.icon || "📄"}</span>
                          <span className="font-semibold text-gray-800 flex-1">{form.label}</span>
                          <Download className="w-5 h-5 text-blue-600" />
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                {/* WAGOLL Examples */}
                {step.forms.wagoll.length > 0 && (
                  <div>
                    <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                      <Eye className="w-5 h-5 text-amber-600" />
                      Example (WAGOLL)
                    </h3>
                    <div className="space-y-2">
                      {step.forms.wagoll.map((form) => (
                        <div key={form.label}>
                          <a
                            href={form.url}
                            className="flex items-center gap-4 p-4 bg-gradient-to-r from-amber-50 to-yellow-50 rounded-xl hover:from-amber-100 hover:to-yellow-100 transition-colors no-underline border border-amber-200"
                          >
                            <span className="text-2xl">✨</span>
                            <span className="font-semibold text-gray-800 flex-1">{form.label}</span>
                            <Eye className="w-5 h-5 text-amber-600" />
                          </a>
                          {form.note && (
                            <p className="text-sm text-amber-700 mt-1 ml-12 italic">{form.note}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* SystemOne Guides */}
                {step.forms.systemOne.length > 0 && (
                  <div>
                    <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                      <Monitor className="w-5 h-5 text-purple-600" />
                      SystemOne Guide
                    </h3>
                    <div className="space-y-2">
                      {step.forms.systemOne.map((form) => (
                        <a
                          key={form.label}
                          href={form.url}
                          className="flex items-center gap-4 p-4 bg-gradient-to-r from-purple-50 to-violet-50 rounded-xl hover:from-purple-100 hover:to-violet-100 transition-colors no-underline border border-purple-200"
                        >
                          <span className="text-2xl">💻</span>
                          <span className="font-semibold text-gray-800 flex-1">{form.label}</span>
                          <ExternalLink className="w-5 h-5 text-purple-600" />
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                {/* Other Guides - filtered by area if applicable */}
                {step.forms.otherGuides.length > 0 && (
                  <div>
                    <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                      <BookOpen className="w-5 h-5 text-teal-600" />
                      Other Guides
                    </h3>
                    <div className="space-y-2">
                      {step.forms.otherGuides
                        .filter((form) => !form.area || form.area === selectedArea)
                        .map((form) => (
                        <a
                          key={form.label}
                          href={form.url}
                          className="flex items-center gap-4 p-4 bg-gradient-to-r from-teal-50 to-cyan-50 rounded-xl hover:from-teal-100 hover:to-cyan-100 transition-colors no-underline border border-teal-200"
                        >
                          <span className="text-2xl">📚</span>
                          <span className="font-semibold text-gray-800 flex-1">{form.label}</span>
                          <ExternalLink className="w-5 h-5 text-teal-600" />
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {step.type === "submission" && step.methods && (
              <div className="space-y-3">
                {step.methods
                  .filter((method) => !method.area || method.area === selectedArea)
                  .map((method) => (
                  <div
                    key={method.label}
                    className={`p-5 rounded-xl border-2 ${
                      method.type === "email"
                        ? "bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200"
                        : method.type === "phone"
                        ? "bg-gradient-to-r from-green-50 to-emerald-50 border-green-200"
                        : "bg-gradient-to-r from-purple-50 to-violet-50 border-purple-200"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {method.type === "email" ? (
                        <Mail className="w-6 h-6 text-blue-600" />
                      ) : method.type === "phone" ? (
                        <Phone className="w-6 h-6 text-green-600" />
                      ) : (
                        <ExternalLink className="w-6 h-6 text-purple-600" />
                      )}
                      <div>
                        <p className="text-sm text-gray-500 font-medium">{method.label}</p>
                        <p className="font-bold text-gray-900 text-xl">{method.value}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {step.type === "casenote" && (step.clipboardText || step.isDynamic) && (
              <div className="space-y-4">
                <div className="p-5 bg-gradient-to-r from-amber-50 to-yellow-50 rounded-xl font-mono text-base leading-relaxed border-2 border-amber-200">
                  {step.isDynamic ? generateCaseNote() : step.clipboardText}
                </div>
                <Button
                  onClick={() => handleCopy(step.isDynamic ? generateCaseNote() : step.clipboardText!)}
                  className={`w-full py-4 text-lg ${
                    copied
                      ? "bg-green-600 hover:bg-green-700"
                      : "bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600"
                  }`}
                >
                  {copied ? (
                    <>
                      <Check className="w-5 h-5 mr-2" /> Copied to Clipboard!
                    </>
                  ) : (
                    <>
                      <Copy className="w-5 h-5 mr-2" /> Copy to Clipboard
                    </>
                  )}
                </Button>

                {/* SystemOne Integration - shown for all, functional in Max+ only */}
                <div className="relative">
                  <Button
                    onClick={() => {
                      if (hasSystemOneIntegration) {
                        setSystemOnePushed(true);
                        setTimeout(() => setSystemOnePushed(false), 3000);
                      }
                    }}
                    disabled={!hasSystemOneIntegration}
                    className={`w-full py-4 text-lg ${
                      systemOnePushed
                        ? "bg-green-600 hover:bg-green-700"
                        : "bg-gradient-to-r from-purple-500 to-violet-600 hover:from-purple-600 hover:to-violet-700 disabled:opacity-60 disabled:cursor-not-allowed"
                    }`}
                  >
                    {systemOnePushed ? (
                      <>
                        <Check className="w-5 h-5 mr-2" /> Pushed to SystemOne!
                      </>
                    ) : (
                      <>
                        <Monitor className="w-5 h-5 mr-2" /> Push to SystemOne Inpatient Note
                      </>
                    )}
                  </Button>
                  <p className={`text-sm text-center mt-2 ${hasSystemOneIntegration ? "text-green-600 font-medium" : "text-purple-600"}`}>
                    {hasSystemOneIntegration
                      ? "✓ SystemOne integration active (Max+)"
                      : "🔒 Only available in Max+ version"}
                  </p>
                </div>
              </div>
            )}

            {step.type === "reminder" && (
              <label className="flex items-start gap-4 p-5 bg-gradient-to-r from-orange-50 to-amber-50 rounded-xl cursor-pointer border-2 border-orange-200 hover:border-orange-400 transition-colors">
                <input
                  type="checkbox"
                  checked={reminderConfirmed}
                  onChange={(e) => setReminderConfirmed(e.target.checked)}
                  className="mt-1 w-6 h-6 rounded border-orange-400 text-orange-600 focus:ring-orange-500"
                />
                <span className="text-gray-800 font-medium text-lg">
                  {step.checkboxLabel}
                </span>
              </label>
            )}

            {step.type === "gdpr" && (
              <div className="p-5 bg-gradient-to-r from-slate-50 to-gray-100 rounded-xl border-2 border-slate-200">
                <div className="flex items-center gap-3 text-slate-700 font-semibold text-lg">
                  <Shield className="w-6 h-6" />
                  Data Protection Reminder
                </div>
                <p className="text-slate-600 mt-2">
                  Remember to delete any downloaded forms containing patient data once submitted.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex justify-between gap-4">
          <Button
            variant="outline"
            onClick={handlePrev}
            disabled={currentStep === 0}
            className="flex-1 py-4 text-lg border-2"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Previous
          </Button>

          {isComplete ? (
            <Button
              onClick={() => router.push("/referrals")}
              className="flex-1 py-4 text-lg bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
            >
              <Check className="w-5 h-5 mr-2" />
              Complete
            </Button>
          ) : (
            <Button
              onClick={handleNext}
              disabled={!canProceed()}
              className={`flex-1 py-4 text-lg bg-gradient-to-r ${workflow.gradient} hover:opacity-90 disabled:opacity-50`}
            >
              Next
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          )}
        </div>

        {/* Step guide at bottom */}
        <div className="bg-gradient-to-r from-slate-100 to-slate-200 rounded-xl p-6">
          <h3 className="font-bold text-gray-800 mb-3">📋 Workflow Steps</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {workflow.steps.map((s, index) => {
              const Icon = STEP_ICONS[s.type] || CheckCircle;
              return (
                <button
                  key={s.id}
                  onClick={() => {
                    // Allow jumping to completed steps or current step
                    if (index <= currentStep) setCurrentStep(index);
                  }}
                  disabled={index > currentStep}
                  className={`flex items-center gap-2 p-3 rounded-lg text-left transition-all ${
                    index === currentStep
                      ? `bg-gradient-to-r ${STEP_GRADIENTS[s.type]} text-white shadow-md`
                      : index < currentStep
                      ? "bg-green-100 text-green-800 hover:bg-green-200"
                      : "bg-white text-gray-400"
                  }`}
                >
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  <span className="text-sm font-medium truncate">{s.title}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Patient Picker Modal */}
      <PatientPickerModal
        isOpen={showPatientPicker}
        onClose={() => setShowPatientPicker(false)}
        onSelect={handlePatientSelect}
        title={workflow.title}
        type="referral"
      />
    </MainLayout>
  );
}
