// Centralized, auditable health/recovery content. All claims here are
// paraphrased general population-level information, not individual medical
// predictions. Sources are attributed inline for auditability. Do not add a
// claim to this file without a source, and do not phrase anything as a
// guarantee about a specific person's body.

export interface HealthMilestone {
  key: string;
  timeLabel: string;
  headline: string;
  detail: string;
  source: string;
}

export const HEALTH_MILESTONES: HealthMilestone[] = [
  {
    key: "20min",
    timeLabel: "20 minutes",
    headline: "Heart rate and blood pressure",
    detail:
      "Heart rate and blood pressure can begin moving back toward typical levels shortly after the last cigarette, though individual recovery varies.",
    source: "Adapted from general cessation timelines published by Smokefree.gov and CDC.",
  },
  {
    key: "12h",
    timeLabel: "12 hours",
    headline: "Carbon monoxide levels",
    detail:
      "Carbon monoxide from cigarette smoke can drop back to a more typical level, and oxygen levels can begin to recover.",
    source: "Adapted from CDC and WHO general cessation health information.",
  },
  {
    key: "2-3weeks",
    timeLabel: "2-12 weeks",
    headline: "Circulation and lung function",
    detail:
      "Circulation and lung function can begin to improve for many people over this window as the body adjusts.",
    source: "Adapted from Smokefree.gov and National Cancer Institute cessation resources.",
  },
  {
    key: "1-9months",
    timeLabel: "1-9 months",
    headline: "Coughing and breathlessness",
    detail:
      "Coughing and shortness of breath can gradually decrease for many people as airway function continues to recover.",
    source: "Adapted from CDC and WHO cessation information.",
  },
  {
    key: "1year",
    timeLabel: "1 year",
    headline: "Longer-term cardiovascular risk",
    detail:
      "Long-term studies associate roughly a year of not smoking with a meaningfully lower added risk of coronary heart disease compared with continuing to smoke, though this reflects population-level research, not an individual guarantee.",
    source: "Adapted from CDC and WHO long-term cessation research summaries.",
  },
];

export const WITHDRAWAL_INFO = {
  intro:
    "Nicotine withdrawal affects people differently. Not everyone experiences every symptom, and severity and duration vary widely.",
  commonSymptoms: [
    "Cravings for nicotine",
    "Irritability or frustration",
    "Restlessness",
    "Trouble concentrating",
    "Changes in sleep",
    "Changes in mood or increased anxiety",
    "Increased appetite",
  ],
  caution:
    "This is general educational information, not a diagnosis. If symptoms feel severe, persistent, or concerning — including significant mood changes — reaching out to a healthcare professional is a reasonable and often helpful step.",
  source: "Paraphrased from CDC, WHO, and Smokefree.gov withdrawal information.",
};

export const TREATMENT_INFO = {
  intro:
    "Quitting doesn't have to rely on willpower alone. Evidence-based support options exist, and combining approaches is common.",
  options: [
    {
      label: "Behavioural counselling",
      detail: "Structured support from a trained counsellor, in person or by phone/text.",
    },
    {
      label: "Quitlines",
      detail: "Free telephone-based coaching and support services, often run by national health authorities.",
    },
    {
      label: "Healthcare professionals",
      detail: "A doctor or pharmacist can discuss options suited to your health history.",
    },
    {
      label: "Nicotine replacement therapy (NRT)",
      detail: "Patches, gum, and lozenges are available over-the-counter in many countries; usage should follow product guidance or a professional's advice.",
    },
    {
      label: "Prescription cessation medication",
      detail: "Some prescription medications are approved to support quitting; these require a healthcare professional's guidance.",
    },
  ],
  disclaimer:
    "This app does not diagnose, prescribe, or recommend a personal dosage. It cannot tell you whether to start or stop any medication. For medication-specific guidance, talk to a healthcare professional or your national health authority.",
  source: "Paraphrased from WHO, CDC, and Smokefree.gov cessation-support overviews.",
};
