export const OTHER_UNIVERSITY_ID = "other" as const

export const COUNTRY_OPTIONS = [
  "Sri Lanka",
  "India",
  "Bangladesh",
  "Pakistan",
  "Nepal",
  "Bhutan",
  "Maldives",
  "Afghanistan",
] as const

export const KNOWN_UNIVERSITIES = [
  { id: "university-of-moratuwa", name: "University of Moratuwa" },
  { id: "university-of-colombo", name: "University of Colombo" },
  { id: "university-of-peradeniya", name: "University of Peradeniya" },
  {
    id: "university-of-sri-jayewardenepura",
    name: "University of Sri Jayewardenepura",
  },
  { id: "university-of-ruhuna", name: "University of Ruhuna" },
  { id: "university-of-kelaniya", name: "University of Kelaniya" },
  {
    id: "sabaragamuwa-university-of-sri-lanka",
    name: "Sabaragamuwa University of Sri Lanka",
  },
  { id: "university-of-jaffna", name: "University of Jaffna" },
  { id: "university-of-vavuniya", name: "University of Vavuniya" },
  { id: "uva-wellassa-university", name: "Uva Wellassa University" },
  {
    id: "wayamba-university-of-sri-lanka",
    name: "Wayamba University of Sri Lanka",
  },
  {
    id: "rajarata-university-of-sri-lanka",
    name: "Rajarata University of Sri Lanka",
  },
  { id: "south-eastern-university", name: "South Eastern University" },
  { id: "eastern-university-sri-lanka", name: "Eastern University, Sri Lanka" },
  {
    id: "open-university-of-sri-lanka",
    name: "Open University of Sri Lanka",
  },
  {
    id: "informatics-institute-of-technology",
    name: "Informatics Institute of Technology (IIT)",
  },
  {
    id: "general-sir-john-kotelawala-defence-university",
    name: "General Sir John Kotelawala Defence University (KDU)",
  },
  {
    id: "sri-lanka-institute-of-information-technology",
    name: "Sri Lanka Institute of Information Technology (SLIIT)",
  },
  {
    id: "national-institute-of-business-management",
    name: "National Institute of Business Management (NIBM)",
  },
  {
    id: "national-school-of-business-management",
    name: "National School of Business Management (NSBM)",
  },
  {
    id: "sri-lanka-technological-campus",
    name: "Sri Lanka Technological Campus (SLTC)",
  },
  {
    id: "asia-pacific-institute-of-information-technology",
    name: "Asia Pacific Institute of Information Technology (APIIT)",
  },
  { id: "icbt-campus", name: "ICBT Campus" },
  { id: "cinec-campus", name: "CINEC Campus" },
  { id: "horizon-campus", name: "Horizon Campus" },
  { id: "esoft-metro-campus", name: "ESOFT Metro Campus" },
  { id: "kiu", name: "KIU (Kaatsu International University)" },
  { id: "saegis-campus", name: "Saegis Campus" },
  { id: "curtin-university-colombo", name: "Curtin University Colombo" },
  {
    id: "university-of-vocational-technology",
    name: "University of Vocational Technology",
  },
] as const

export const UNIVERSITY_OPTIONS = [
  ...KNOWN_UNIVERSITIES,
  { id: OTHER_UNIVERSITY_ID, name: "Other" },
] as const

export const TEAM_SIZE_OPTIONS = [
  { value: 1, label: "1 Member" },
  { value: 2, label: "2 Members" },
  { value: 3, label: "3 Members" },
] as const

export const REGISTRATION_STORAGE_KEY = "moraxtreme-11-registration-draft"

// "Prefer not to say" keeps gender answerable without forcing a disclosure.
export const GENDER_OPTIONS = [
  { value: "female", label: "Female" },
  { value: "male", label: "Male" },
  { value: "other", label: "Other" },
  { value: "prefer_not_to_say", label: "Prefer not to say" },
] as const

// Undergraduates only.
export const YEAR_OF_STUDY_OPTIONS = [
  { value: "year_1", label: "1st year" },
  { value: "year_2", label: "2nd year" },
  { value: "year_3", label: "3rd year" },
  { value: "year_4", label: "4th year" },
  { value: "year_5_plus", label: "5th year or above" },
] as const

export type Gender = (typeof GENDER_OPTIONS)[number]["value"]
export type YearOfStudy = (typeof YEAR_OF_STUDY_OPTIONS)[number]["value"]

export const GENDER_VALUES = GENDER_OPTIONS.map((option) => option.value) as [
  Gender,
  ...Gender[],
]
export const YEAR_OF_STUDY_VALUES = YEAR_OF_STUDY_OPTIONS.map(
  (option) => option.value
) as [YearOfStudy, ...YearOfStudy[]]

export function getOptionLabel(
  options: readonly { value: string; label: string }[],
  value: string
) {
  return options.find((option) => option.value === value)?.label ?? ""
}
