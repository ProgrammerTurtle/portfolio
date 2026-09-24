// Site-wide content. Projects live in src/content/projects instead.

export const GITHUB = 'https://github.com/ProgrammerTurtle';
export const EMAIL = 'parkerrupe42@gmail.com';
export const RESUME = '/parker-rupe-resume.pdf';

export const facts = [
  { label: 'Shown at', value: 'Open Sauce 2025 & 2026, San Francisco' },
  { label: 'Sponsored by', value: 'SUNLU Filament' },
  { label: 'Studying', value: 'Applied Mathematics, Boise State' },
  { label: 'On GitHub', value: '8 open-source projects, 60 stars' },
];

export const skills: [string, string[]][] = [
  ['CAD', ['Fusion 360', 'Onshape', 'SolidWorks', 'Inventor']],
  ['Analysis', ['Autodesk CFD', 'FEA / CAE']],
  ['Making', ['FDM printing', 'CNC machining', 'Composite layup', 'Filament winding']],
  ['Electronics & code', ['PCB design (EasyEDA)', 'Python', 'G-code', 'Firmware']],
];

export const experience = [
  {
    role: 'Hack Club Organizer',
    org: 'Hack Club · International',
    when: 'Mar 2025 – Present',
    points: [
      'Helped write the hardware guidelines Hack Club now uses across its programs',
      "Set up standard procedures for handling participants' hardware projects",
      'Reviewed hardware projects for grant eligibility and helped decide what gets funded',
      'Helped spread the word about Hack Club to teens in 119+ countries',
    ],
  },
  {
    role: 'Exhibitor',
    org: 'Open Sauce 2026 · San Francisco',
    when: '2026',
    points: ['Exhibited DoNotDelta, my colinear delta 3D printer'],
  },
  {
    role: 'Exhibitor',
    org: 'Open Sauce 2025 · San Francisco',
    when: '2025',
    points: ['Exhibited DoNotDelta, my colinear delta 3D printer'],
  },
  {
    role: 'Stocker / Attendant',
    org: 'Great Scotts Gas Station · Boise, ID',
    when: 'Mar 2024 – Oct 2024',
    points: [
      'Kept the store and its facilities in good shape',
      'Managed inventory across multiple brands, suppliers, and distributors',
    ],
  },
];

export const channels = [
  { label: 'GitHub', value: 'ProgrammerTurtle', href: GITHUB },
  { label: 'Instagram', value: '@parker_rupe', href: 'https://www.instagram.com/parker_rupe' },
  { label: 'Ko-fi', value: 'turtlegod', href: 'https://ko-fi.com/turtlegod' },
  { label: 'Résumé', value: 'PDF', href: RESUME },
];
