// Country-specific support resources, kept centralized so numbers can be
// audited/updated in one place. Verified against official sources at
// implementation time — see comments per entry.

export interface SupportResource {
  countryCode: string; // ISO 3166-1 alpha-2
  name: string;
  phone: string;
  hours?: string;
  description: string;
  source: string;
}

export const SUPPORT_RESOURCES: SupportResource[] = [
  {
    countryCode: "IN",
    name: "National Tobacco Quit Line Service (India)",
    phone: "1800-11-2356",
    hours: "8 AM - 8 PM, toll-free",
    description:
      "Free telephonic counselling to help quit tobacco, run by India's Ministry of Health and Family Welfare (NTCP).",
    // Verified 2026-09-21 against WHO India and MoHFW NTCP.
    source: "who.int/india and ntcp.mohfw.gov.in (verified at implementation time)",
  },
  {
    countryCode: "US",
    name: "National Quitline (USA)",
    phone: "1-800-QUIT-NOW (1-800-784-8669)",
    description: "Free coaching and resources, run by U.S. state health departments via Smokefree.gov.",
    source: "smokefree.gov",
  },
  {
    countryCode: "GB",
    name: "NHS Smokefree",
    phone: "0300 123 1044",
    description: "Free support from the NHS Smokefree helpline.",
    source: "nhs.uk/smokefree",
  },
];

export function supportResourcesFor(countryCode?: string): SupportResource[] {
  if (!countryCode) return SUPPORT_RESOURCES;
  const match = SUPPORT_RESOURCES.filter((r) => r.countryCode === countryCode);
  return match.length ? match : SUPPORT_RESOURCES;
}
