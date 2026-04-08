export interface SectionConfig {
  id: string;
  height: string; // CSS height value like '200vh'
  mobileHeight?: string;
}

export interface SpecItem {
  label: string;
  value: string;
  unit?: string;
}

export interface FeatureItem {
  title: string;
  description: string;
  cameraProgress: number; // scroll progress where camera focuses on this feature
}

export interface LandingContent {
  hero: {
    title: string;
    subtitle: string;
    tagline: string;
  };
  intro: {
    title: string;
    description: string;
    stats: { value: number; suffix: string; label: string }[];
  };
  features: FeatureItem[];
  specs: SpecItem[];
  footer: {
    cta: string;
    credits: string;
  };
}
