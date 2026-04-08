import type { LandingContent, SectionConfig } from '@/types/landing';

export const sections: SectionConfig[] = [
  { id: 'hero', height: '200vh', mobileHeight: '150vh' },
  { id: 'intro', height: '100vh', mobileHeight: '80vh' },
  { id: 'design', height: '300vh', mobileHeight: '200vh' },
  { id: 'color-showcase', height: '150vh', mobileHeight: '100vh' },
  { id: 'configurator', height: '100vh' },
  { id: 'specs', height: '100vh', mobileHeight: '80vh' },
  { id: 'footer', height: '50vh', mobileHeight: '40vh' },
];

export const landingContent: LandingContent = {
  hero: {
    title: 'TERZO MILLENNIO',
    subtitle: 'LAMBORGHINI',
    tagline: 'THE FUTURE, ELECTRIFIED',
  },
  intro: {
    title: 'Terzo Millennio',
    description:
      'A vision of the super sports car of the future, born from an unprecedented collaboration between Lamborghini and MIT. Pushing the boundaries of performance, design, and sustainable innovation.',
    stats: [
      { value: 2.9, suffix: 's', label: '0-100 km/h' },
      { value: 2000, suffix: '', label: 'Horsepower' },
      { value: 100, suffix: '%', label: 'Electric' },
    ],
  },
  features: [
    {
      title: 'Aerodynamic Supremacy',
      description:
        'Every curve is sculpted by airflow. Active aerodynamic elements adapt in real-time, channeling air to optimize downforce and reduce drag — a perfect marriage of beauty and physics.',
      cameraProgress: 0.25,
    },
    {
      title: 'Y-Shaped Signature Lights',
      description:
        "The iconic Y-shaped lighting signature defines the Terzo Millennio's identity. Each LED element is precisely engineered to illuminate the road ahead while creating an unmistakable visual presence.",
      cameraProgress: 0.35,
    },
    {
      title: 'Active Aero Wing',
      description:
        "The rear active aerodynamic wing deploys at high speeds to provide maximum downforce. Integrated into the car's nervous system, it responds instantly to driving conditions.",
      cameraProgress: 0.45,
    },
  ],
  specs: [
    { label: 'Power Output', value: '2,000', unit: 'HP' },
    { label: '0-100 km/h', value: '2.9', unit: 's' },
    { label: 'Top Speed', value: '340+', unit: 'km/h' },
    { label: 'Drivetrain', value: 'AWD', unit: 'Electric' },
    { label: 'Battery', value: 'Supercapacitor', unit: 'Technology' },
    { label: 'Body', value: 'Carbon', unit: 'Fiber' },
    { label: 'Weight', value: '1,450', unit: 'kg' },
    { label: 'Self-Healing', value: 'Nano', unit: 'Technology' },
  ],
  footer: {
    cta: 'Configure Your Vision',
    credits: 'Concept visualization powered by Three.js',
  },
};
