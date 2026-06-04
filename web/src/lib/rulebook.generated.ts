// AUTO-GENERATED from effortless-rulebook/effortless-rulebook.json
// Source of truth: the ERB hub. Do not edit by hand.
// Regenerate: npm run gen:rulebook
/* eslint-disable */
export type VocabOption = { value: string; label: string; sortOrder: number; description?: string; guidance?: string };

export const vocab = {
  "spheres": [
    {
      "value": "facility",
      "label": "Facility",
      "sortOrder": 1,
      "description": "A target facility or someone inside one."
    },
    {
      "value": "independent-living",
      "label": "Independent Living",
      "sortOrder": 2,
      "description": "Independent living communities and contacts."
    },
    {
      "value": "community",
      "label": "Community",
      "sortOrder": 3,
      "description": "Local community ecosystem."
    },
    {
      "value": "nonprofit",
      "label": "Nonprofit",
      "sortOrder": 4,
      "description": "Nonprofit organizations."
    },
    {
      "value": "foundation",
      "label": "Foundation",
      "sortOrder": 5,
      "description": "Foundations and grantmakers."
    },
    {
      "value": "faith-leader",
      "label": "Faith Leader",
      "sortOrder": 6,
      "description": "Faith leaders and congregations."
    },
    {
      "value": "insurance",
      "label": "Insurance",
      "sortOrder": 7,
      "description": "Insurance and benefits contacts."
    },
    {
      "value": "doula",
      "label": "Doula",
      "sortOrder": 8,
      "description": "Doulas and care companions."
    },
    {
      "value": "legal",
      "label": "Legal",
      "sortOrder": 9,
      "description": "Legal and estate contacts."
    },
    {
      "value": "mentor",
      "label": "Mentor",
      "sortOrder": 10,
      "description": "Mentors and advisors."
    },
    {
      "value": "other",
      "label": "Other",
      "sortOrder": 11,
      "description": "Anything that does not fit another sphere."
    }
  ],
  "personStatuses": [
    {
      "value": "to-reach-out",
      "label": "To reach out",
      "sortOrder": 1,
      "description": "Ready for a first warm hello."
    },
    {
      "value": "reached-out",
      "label": "Reached out",
      "sortOrder": 2,
      "description": "A first hello has been sent."
    },
    {
      "value": "in-conversation",
      "label": "In conversation",
      "sortOrder": 3,
      "description": "An active back and forth is underway."
    },
    {
      "value": "intro-made",
      "label": "Intro made",
      "sortOrder": 4,
      "description": "A warm introduction has been made."
    },
    {
      "value": "resting",
      "label": "Resting",
      "sortOrder": 5,
      "description": "Set aside gently for now, ready when the time is right."
    }
  ],
  "facilityTypes": [
    {
      "value": "independent-living",
      "label": "Independent Living",
      "sortOrder": 1,
      "description": "Independent living community."
    },
    {
      "value": "55-and-over-community",
      "label": "55 and Over Community",
      "sortOrder": 2,
      "description": "Age qualified 55 and over community."
    },
    {
      "value": "assisted-living",
      "label": "Assisted Living",
      "sortOrder": 3,
      "description": "Assisted living community."
    },
    {
      "value": "memory-care",
      "label": "Memory Care",
      "sortOrder": 4,
      "description": "Memory care community."
    },
    {
      "value": "skilled-nursing",
      "label": "Skilled Nursing",
      "sortOrder": 5,
      "description": "Skilled nursing facility."
    },
    {
      "value": "ccrc",
      "label": "CCRC",
      "sortOrder": 6,
      "description": "Continuing care retirement community."
    },
    {
      "value": "senior-center",
      "label": "Senior Center",
      "sortOrder": 7,
      "description": "Senior center."
    },
    {
      "value": "other",
      "label": "Other",
      "sortOrder": 8,
      "description": "Anything that does not fit another type."
    }
  ],
  "regions": [
    {
      "value": "warwick-ny",
      "label": "Warwick NY",
      "sortOrder": 1,
      "description": "Warwick, New York."
    },
    {
      "value": "goshen-ny",
      "label": "Goshen NY",
      "sortOrder": 2,
      "description": "Goshen, New York."
    },
    {
      "value": "orange-county-ny",
      "label": "Orange County NY",
      "sortOrder": 3,
      "description": "Orange County, New York."
    },
    {
      "value": "rockland-county-ny",
      "label": "Rockland County NY",
      "sortOrder": 4,
      "description": "Rockland County, New York."
    },
    {
      "value": "sussex-county-nj",
      "label": "Sussex County NJ",
      "sortOrder": 5,
      "description": "Sussex County, New Jersey."
    },
    {
      "value": "other",
      "label": "Other",
      "sortOrder": 6,
      "description": "Anywhere else."
    }
  ],
  "leadRoutes": [
    {
      "value": "warm-via-mina",
      "label": "Warm via Mina",
      "sortOrder": 1,
      "description": "Warm introduction through Mina."
    },
    {
      "value": "warm-via-haley",
      "label": "Warm via Haley",
      "sortOrder": 2,
      "description": "Warm introduction through Haley."
    },
    {
      "value": "warm-via-other",
      "label": "Warm via other",
      "sortOrder": 3,
      "description": "Warm introduction through another connector."
    },
    {
      "value": "cold",
      "label": "Cold",
      "sortOrder": 4,
      "description": "No warm route yet, a cold approach."
    }
  ],
  "alignmentLevels": [
    {
      "value": "yes",
      "label": "Yes",
      "sortOrder": 1,
      "description": "Clearly values aligned."
    },
    {
      "value": "maybe",
      "label": "Maybe",
      "sortOrder": 2,
      "description": "Possibly aligned, needs a closer look."
    },
    {
      "value": "no",
      "label": "No",
      "sortOrder": 3,
      "description": "Not a values fit."
    },
    {
      "value": "unknown",
      "label": "Unknown",
      "sortOrder": 4,
      "description": "Not yet assessed."
    }
  ],
  "facilityStatuses": [
    {
      "value": "to-research",
      "label": "To research",
      "sortOrder": 1,
      "description": "Identified, not yet researched."
    },
    {
      "value": "intro-requested",
      "label": "Intro requested",
      "sortOrder": 2,
      "description": "A warm introduction has been requested."
    },
    {
      "value": "meeting-set",
      "label": "Meeting set",
      "sortOrder": 3,
      "description": "A meeting is on the calendar."
    },
    {
      "value": "in-discussion",
      "label": "In discussion",
      "sortOrder": 4,
      "description": "An active discussion is underway."
    },
    {
      "value": "proposal-sent",
      "label": "Proposal sent",
      "sortOrder": 5,
      "description": "A proposal has been shared."
    },
    {
      "value": "signed",
      "label": "Signed",
      "sortOrder": 6,
      "description": "A partnership is in place."
    },
    {
      "value": "resting",
      "label": "Resting",
      "sortOrder": 7,
      "description": "Set aside gently for now."
    }
  ],
  "captureTypes": [
    {
      "value": "pain-point",
      "label": "Pain Point",
      "sortOrder": 1,
      "description": "A problem or frustration worth solving."
    },
    {
      "value": "case-study",
      "label": "Case Study",
      "sortOrder": 2,
      "description": "A real story of someone helped."
    },
    {
      "value": "idea",
      "label": "Idea",
      "sortOrder": 3,
      "description": "An idea to explore later."
    }
  ],
  "warmthLevels": [
    {
      "value": "warm",
      "label": "Warm",
      "sortOrder": 1,
      "description": "Touched within the warm threshold.",
      "guidance": "Recently connected."
    },
    {
      "value": "cooling",
      "label": "Cooling",
      "sortOrder": 2,
      "description": "Between the warm and cooling thresholds.",
      "guidance": "A good time for a gentle hello."
    },
    {
      "value": "cold",
      "label": "Cold",
      "sortOrder": 3,
      "description": "Beyond the cooling threshold or never touched.",
      "guidance": "Ready for a hello."
    }
  ]
} as const;

export const profile = {
  "accountKey": "liz",
  "displayName": "Liz",
  "tagline": "Illuminating Life, Legacy, and Love",
  "weeklyWarmupGoal": 4,
  "warmThresholdDays": 14,
  "coolingThresholdDays": 30,
  "morningWarmupCount": 3
} as const;

export const governance = [
  {
    "code": "R1",
    "title": "Ownership",
    "statement": "Every row belongs to one user through the Owner relationship to Profiles. Row Level Security limits all access to that user. Realized in the generated RLS policies.",
    "category": "Ownership",
    "sortOrder": 1
  },
  {
    "code": "R2",
    "title": "Warmth Model",
    "statement": "Warmth is derived from LastTouched. A person is Warm within WarmThresholdDays, Cooling up to CoolingThresholdDays, and Cold beyond that or when never touched. Warmth drives sorting and the daily ritual only.",
    "category": "Warmth",
    "sortOrder": 2
  },
  {
    "code": "R3",
    "title": "Daily Ritual",
    "statement": "The Today screen surfaces MorningWarmupCount people, coldest or never touched first, one at a time. Logging a hello sets LastTouched to today and counts toward the weekly total.",
    "category": "Ritual",
    "sortOrder": 3
  },
  {
    "code": "R4",
    "title": "Weekly Count",
    "statement": "The weekly count is counted since the most recent Monday and resets each Monday. It is shown as encouragement toward WeeklyWarmupGoal, never as a backlog.",
    "category": "Ritual",
    "sortOrder": 4
  },
  {
    "code": "R5",
    "title": "No Guilt",
    "statement": "No overdue, late, or warning states anywhere. A cold contact reads as ready for a hello. Empty states are warm and inviting.",
    "category": "UX",
    "sortOrder": 5
  },
  {
    "code": "R6",
    "title": "Minimal Friction",
    "statement": "Only FullName for a person or FacilityName for a facility is required to create a row. Every other field is optional.",
    "category": "UX",
    "sortOrder": 6
  },
  {
    "code": "R7",
    "title": "Status Auto Advance",
    "statement": "Logging a first hello moves a person from To reach out to Reached out. Further status changes are manual.",
    "category": "Workflow",
    "sortOrder": 7
  },
  {
    "code": "R8",
    "title": "Content Punctuation",
    "statement": "Never use em dashes or en dashes in any label, message, or generated text. Use hyphens only inside hyphenated words. This is a BeaconHaus content rule.",
    "category": "Content",
    "sortOrder": 8
  },
  {
    "code": "R9",
    "title": "Positioning",
    "statement": "Do not lead with death literacy in the interface. Lead with later-life planning and community connection.",
    "category": "Positioning",
    "sortOrder": 9
  },
  {
    "code": "R10",
    "title": "LinkedIn Safety",
    "statement": "No scraping or browser automation of LinkedIn, ever. The official API cannot read connections, search people, or send requests or messages for this app, and unofficial tools risk her account. LinkedIn is limited to official posting through the member social scope and Open in LinkedIn deep links from stored profile URLs.",
    "category": "Integration",
    "sortOrder": 10
  },
  {
    "code": "R11",
    "title": "Least Privilege",
    "statement": "Request the narrowest OAuth scope that does the job: drive.file for Drive, calendar.events for Calendar, member social for LinkedIn posting, and Gmail send only if added later. Ask for each scope only when the feature is first used.",
    "category": "Security",
    "sortOrder": 11
  },
  {
    "code": "R12",
    "title": "Secrets Server Side",
    "statement": "OAuth client secrets and token exchanges live only in server code. Tokens are stored in OAuthTokens, never in the client bundle.",
    "category": "Security",
    "sortOrder": 12
  }
] as const;

export const seed = {
  "people": [
    {
      "id": "mina",
      "fullName": "Mina",
      "owner": "liz",
      "roleOrg": "Warm connector into local facilities",
      "sphere": "facility",
      "relationship": "Trusted connector who can make warm introductions",
      "doorsCanOpen": "Introductions to the Warwick and Goshen facility targets",
      "theAsk": "Confirm the two unconfirmed Warwick and Goshen facility names and offer a warm intro",
      "status": "in-conversation",
      "nextStep": "Sit down with Mina to confirm targets",
      "notes": "Primary warm route for facility outreach."
    },
    {
      "id": "haley",
      "fullName": "Haley",
      "owner": "liz",
      "roleOrg": "Community connector",
      "sphere": "community",
      "relationship": "Connector who can make warm introductions",
      "doorsCanOpen": "Warm introductions within the community ecosystem",
      "status": "in-conversation",
      "nextStep": "Check in and thank Haley for recent introductions",
      "notes": "Secondary warm route."
    },
    {
      "id": "pam",
      "fullName": "Pam",
      "owner": "liz",
      "sphere": "community",
      "status": "reached-out",
      "nextStep": "Follow up on the last conversation",
      "notes": "Curated starter contact, details to be confirmed with Liz."
    },
    {
      "id": "terry",
      "fullName": "Terry",
      "owner": "liz",
      "sphere": "community",
      "status": "to-reach-out",
      "nextStep": "Send a first warm hello",
      "notes": "Curated starter contact, details to be confirmed with Liz."
    }
  ],
  "facilities": [
    {
      "id": "mount-alverno",
      "facilityName": "Mount Alverno",
      "owner": "liz",
      "region": "warwick-ny",
      "town": "Warwick",
      "leadRoute": "warm-via-mina",
      "aligned": "unknown",
      "status": "to-research",
      "nextStep": "Research the community and confirm the right contact",
      "fitNotes": "Early target in Warwick, alignment to be confirmed."
    },
    {
      "id": "unconfirmed-warwick-target",
      "facilityName": "Unconfirmed Warwick target",
      "owner": "liz",
      "region": "warwick-ny",
      "leadRoute": "warm-via-mina",
      "aligned": "unknown",
      "status": "to-research",
      "fitNotes": "Placeholder name to be resolved with Mina."
    },
    {
      "id": "unconfirmed-goshen-target",
      "facilityName": "Unconfirmed Goshen target",
      "owner": "liz",
      "region": "goshen-ny",
      "leadRoute": "warm-via-mina",
      "aligned": "unknown",
      "status": "to-research",
      "fitNotes": "Placeholder name to be resolved with Mina."
    }
  ],
  "captures": [
    {
      "id": "families-feel-overwhelmed-by-later-life-planning",
      "title": "Families feel overwhelmed by later-life planning",
      "owner": "liz",
      "type": "pain-point",
      "detail": "Families often do not know where to begin with later-life planning and feel alone in it. A calm guide reduces the overwhelm."
    },
    {
      "id": "facilities-want-a-warmer-guide-for-residents-and-families",
      "title": "Facilities want a warmer guide for residents and families",
      "owner": "liz",
      "type": "pain-point",
      "detail": "Communities want a gentle, human way to support residents and families through later-life planning and connection, led by community first rather than by clinical language."
    },
    {
      "id": "a-warwick-family-found-calm-through-guided-planning",
      "title": "A Warwick family found calm through guided planning",
      "owner": "liz",
      "type": "case-study",
      "detail": "A local family moved from anxiety to calm by walking through their later-life plan with a trusted guide, one small step at a time."
    },
    {
      "id": "monthly-community-gathering-on-living-fully-in-later-life",
      "title": "Monthly community gathering on living fully in later life",
      "owner": "liz",
      "type": "idea",
      "detail": "Host a warm monthly gathering at a partner facility focused on living fully in later life, legacy, and connection."
    }
  ]
} as const;
