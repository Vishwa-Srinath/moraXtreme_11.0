/**
 * Shared types for the TeamSlider component and its data layer.
 */

export interface TeamMember {
  name: string;
  role: string;
  /** Organisation / event association line */
  organisation?: string;
  photo: string;
  alt?: string;
  bio?: string;
  email?: string;
  phone?: string;
  linkedIn?: string;
}

export interface TeamSliderProps {
  members: TeamMember[];
  /** Section headline */
  title?: string;
  /** Section subtitle */
  subtitle?: string;
  /** Auto-advance interval in ms — default 4000 */
  autoInterval?: number;
  /** Background colour override */
  bgColor?: string;
  /** Eyebrow label above the title */
  eyebrow?: string;
}
