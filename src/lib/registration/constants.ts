export const OTHER_UNIVERSITY_ID = "other" as const

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
