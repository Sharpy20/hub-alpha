import { Bookmark } from "@/lib/types";

export const bookmarks: Bookmark[] = [
  // Crisis Support - Derbyshire MH Helpline first (local service)
  {
    id: "derbyshire-mh-helpline",
    title: "Derbyshire MH Helpline",
    icon: "☎️",
    url: "https://www.derbyshirehealthcareft.nhs.uk",
    category: "Crisis Support",
    requiresFocus: false,
    description: "Local 24/7 mental health support",
    phone: "0800 028 0077",
  },
  {
    id: "samaritans",
    title: "Samaritans",
    icon: "💚",
    url: "https://www.samaritans.org",
    category: "Crisis Support",
    requiresFocus: false,
    description: "24/7 emotional support",
    phone: "116 123",
  },
  {
    id: "mind",
    title: "Mind Infoline",
    icon: "🧠",
    url: "https://www.mind.org.uk",
    category: "Crisis Support",
    requiresFocus: false,
    description: "Mental health information and support",
    phone: "0300 123 3393",
  },
  {
    id: "calm",
    title: "CALM",
    icon: "📞",
    url: "https://www.thecalmzone.net",
    category: "Crisis Support",
    requiresFocus: false,
    description: "Campaign Against Living Miserably",
    phone: "0800 58 58 58",
  },
  {
    id: "nhs111",
    title: "NHS 111",
    icon: "🏥",
    url: "https://111.nhs.uk",
    category: "Crisis Support",
    requiresFocus: false,
    description: "Urgent medical help",
    phone: "111",
  },

  // Clinical Systems
  {
    id: "nhs-mail",
    title: "NHS Mail",
    icon: "📧",
    url: "https://portal.nhs.net",
    category: "Clinical Systems",
    requiresFocus: false,
    description: "Secure NHS email",
  },
  {
    id: "datix",
    title: "Datix",
    icon: "📝",
    url: "#",
    category: "Clinical Systems",
    requiresFocus: true,
    description: "Incident reporting system",
  },
  {
    id: "spine",
    title: "Spine",
    icon: "🔍",
    url: "#",
    category: "Clinical Systems",
    requiresFocus: true,
    description: "National patient lookup",
  },
  {
    id: "assurance",
    title: "Assurance Dashboard",
    icon: "📊",
    url: "#",
    category: "Clinical Systems",
    requiresFocus: true,
    description: "Ward assurance metrics",
  },

  // HR & Pay
  {
    id: "esr",
    title: "ESR",
    icon: "💰",
    url: "https://my.esr.nhs.uk",
    category: "HR & Pay",
    requiresFocus: false,
    description: "Employee Self Service",
  },
  {
    id: "oracle",
    title: "Oracle/Payslips",
    icon: "💳",
    url: "#",
    category: "HR & Pay",
    requiresFocus: true,
    description: "Pay and expenses",
  },
  {
    id: "healthroster",
    title: "HealthRoster",
    icon: "📅",
    url: "#",
    category: "HR & Pay",
    requiresFocus: true,
    description: "Staff rostering",
  },
  {
    id: "employee-online",
    title: "Employee Online",
    icon: "🗓️",
    url: "https://www.allocatehealthsuite.com/",
    category: "HR & Pay",
    requiresFocus: false,
    description: "Roster and annual leave",
  },

  // Training & Learning
  {
    id: "elf",
    title: "e-Learning (eLfH)",
    icon: "📚",
    url: "https://www.e-lfh.org.uk",
    category: "Training & Learning",
    requiresFocus: false,
    description: "NHS e-Learning for Healthcare",
  },
  {
    id: "trust-training",
    title: "Trust Training Portal",
    icon: "🎓",
    url: "#",
    category: "Training & Learning",
    requiresFocus: true,
    description: "Mandatory training",
  },
  {
    id: "care-identity",
    title: "Care Identity",
    icon: "🪪",
    url: "#",
    category: "Training & Learning",
    requiresFocus: true,
    description: "Smartcard management",
  },

  // Policies & Guidance
  {
    id: "nice",
    title: "NICE Guidelines",
    icon: "📋",
    url: "https://www.nice.org.uk/guidance",
    category: "Policies & Guidance",
    requiresFocus: false,
    description: "National clinical guidelines",
  },
  {
    id: "bnf",
    title: "BNF Online",
    icon: "💊",
    url: "https://bnf.nice.org.uk",
    category: "Policies & Guidance",
    requiresFocus: false,
    description: "British National Formulary",
  },
  {
    id: "trust-policies",
    title: "Trust Policies",
    icon: "📄",
    url: "#",
    category: "Policies & Guidance",
    requiresFocus: true,
    description: "Internal policies and procedures",
  },
  {
    id: "mha-forms",
    title: "MHA Forms",
    icon: "⚖️",
    url: "https://www.legislation.gov.uk/uksi/2008/1184/contents/made",
    category: "Policies & Guidance",
    requiresFocus: false,
    description: "Mental Health Act forms",
  },
  {
    id: "mha-code",
    title: "MHA Code of Practice",
    icon: "📕",
    url: "https://www.gov.uk/government/publications/code-of-practice-mental-health-act-1983",
    category: "Policies & Guidance",
    requiresFocus: false,
    description: "MHA Code guidance",
  },
  {
    id: "choice-meds",
    title: "Choice & Medication",
    icon: "💉",
    url: "https://www.choiceandmedication.org/derbyshirehealthcare/",
    category: "Policies & Guidance",
    requiresFocus: false,
    description: "Patient medication info",
  },

  // External Services
  {
    id: "pohwer",
    title: "POhWER Advocacy",
    icon: "🗣️",
    url: "https://www.pohwer.net",
    category: "External Services",
    requiresFocus: false,
    description: "Independent advocacy service",
    phone: "0300 456 2370",
  },
  {
    id: "rethink",
    title: "Rethink Derby",
    icon: "💜",
    url: "https://www.rethink.org",
    category: "External Services",
    requiresFocus: false,
    description: "Mental health support",
  },
  {
    id: "drp",
    title: "DRP (Drug & Alcohol)",
    icon: "🍃",
    url: "https://www.changegrowlive.org",
    category: "External Services",
    requiresFocus: false,
    description: "Derbyshire Recovery Partnership",
  },
  {
    id: "trent-pts",
    title: "Trent PTS (IAPT)",
    icon: "💬",
    url: "https://www.trentpts.co.uk",
    category: "External Services",
    requiresFocus: false,
    description: "Talking therapies",
  },
  {
    id: "dsab",
    title: "DSAB Safeguarding",
    icon: "🛡️",
    url: "https://www.derbyshiresab.org.uk/",
    category: "External Services",
    requiresFocus: false,
    description: "Safeguarding Adults Board",
  },
  {
    id: "starting-point",
    title: "Starting Point",
    icon: "👶",
    url: "https://www.derbyshire.gov.uk/social-health/children-and-families/support-for-families/starting-point-referral-form/starting-point-contact-and-referral-service.aspx",
    category: "External Services",
    requiresFocus: false,
    description: "Children's safeguarding referrals",
  },

  // Communication
  {
    id: "teams",
    title: "Microsoft Teams",
    icon: "📹",
    url: "https://teams.microsoft.com",
    category: "Communication",
    requiresFocus: false,
    description: "Video calls and chat",
  },
  {
    id: "trust-intranet",
    title: "FOCUS Intranet",
    icon: "🏠",
    url: "#",
    category: "Communication",
    requiresFocus: true,
    description: "Trust intranet home",
  },
];

// Get bookmarks by category
export function getBookmarksByCategory(category: string): Bookmark[] {
  return bookmarks.filter((b) => b.category === category);
}

// Get all unique categories
export function getCategories(): string[] {
  return [...new Set(bookmarks.map((b) => b.category))];
}

// Get a single bookmark by ID
export function getBookmarkById(id: string): Bookmark | undefined {
  return bookmarks.find((b) => b.id === id);
}
