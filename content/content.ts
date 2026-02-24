export type ProjectCategory = 'Web' | 'Security' | 'Mobile' | 'AI';

export interface Project {
  id: string;
  title: string;
  shortDescription: string;
  longDescription: string;
  categories: ProjectCategory[];
  stack: string[];
  githubUrl: string;
  liveUrl: string;
  screenshots: string[];
  isPlaceholder?: boolean;
}

export interface ExperienceItem {
  id: string;
  organization: string;
  role: string;
  start: string;
  end: string;
  achievements: string[];
}

export interface EducationItem {
  id: string;
  institution: string;
  degree: string;
  start: string;
  end: string;
  notes: string;
}

export interface SkillItem {
  name: string;
  level: number;
}

export interface SkillGroup {
  category: string;
  items: SkillItem[];
}

export interface CertificationItem {
  name: string;
  issuer: string;
  year: string;
}

export interface PortfolioContent {
  site: {
    name: string;
    title: string;
    description: string;
  };
  dataStatus: {
    source: string;
    linkedInUrl: string;
    note: string;
  };
  navigation: Array<{ label: string; href: `#${string}` }>;
  hero: {
    name: string;
    tagline: string;
    description: string;
    availability: string;
    primaryCta: { label: string; href: string };
    secondaryCta: { label: string; href: string };
  };
  about: {
    bio: string;
    highlights: string[];
    techStack: string[];
  };
  projectCategories: ProjectCategory[];
  projects: Project[];
  experience: ExperienceItem[];
  education: EducationItem[];
  skills: SkillGroup[];
  certifications: CertificationItem[];
  contact: {
    email: string;
    socials: Array<{ label: string; url: string; handle: string }>;
  };
  footer: {
    location: string;
    timezone: string;
  };
}

export const portfolioContent: PortfolioContent = {
  site: {
    name: 'SIFAEL MAHALI',
    title: 'Sifael Mahali | Software Engineer and Cybersecurity Enthusiast',
    description:
      'Modern interactive portfolio for Sifael Mahali focused on software engineering, security-minded development, and clean digital experiences.'
  },
  dataStatus: {
    source: 'LinkedIn',
    linkedInUrl: 'https://www.linkedin.com/in/sifael-mahali-166447311/',
    note:
      'LinkedIn scraping was blocked during generation. Replace placeholders with exact LinkedIn About, Experience, Projects, and Skills text.'
  },
  navigation: [
    { label: 'Home', href: '#home' },
    { label: 'About', href: '#about' },
    { label: 'Projects', href: '#projects' },
    { label: 'Experience', href: '#experience' },
    { label: 'Skills', href: '#skills' },
    { label: 'Contact', href: '#contact' }
  ],
  hero: {
    name: 'SIFAEL MAHALI',
    tagline: 'Software Engineer | Cybersecurity Enthusiast',
    description:
      'I design and build high-performance applications with secure architecture, modern UX, and practical engineering discipline.',
    availability: 'Open to software engineering opportunities',
    primaryCta: { label: 'View Projects', href: '#projects' },
    secondaryCta: { label: 'Download CV', href: '/cv/sifael-mahali-cv.pdf' }
  },
  about: {
    bio: '(Paste LinkedIn About summary here.)',
    highlights: [
      'Security-first mindset: building with secure defaults from day one.',
      'Performance-aware engineering: fast interfaces and efficient services.',
      'Product thinking: balancing user value with technical rigor.',
      'Continuous learner across software engineering and cybersecurity.',
      'Clear communication and collaborative problem solving.'
    ],
    techStack: [
      'TypeScript',
      'Next.js',
      'React',
      'Node.js',
      'Express',
      'PostgreSQL',
      'Prisma',
      'Docker',
      'Linux',
      'OWASP',
      'Burp Suite',
      'Wireshark'
    ]
  },
  projectCategories: ['Web', 'Security', 'Mobile', 'AI'],
  projects: [
    {
      id: 'p1',
      title: '(Add LinkedIn Project Title #1)',
      shortDescription: '(Add short project summary from LinkedIn.)',
      longDescription:
        '(Add full project details, problem solved, your role, and outcomes.)',
      categories: ['Web', 'Security'],
      stack: ['Next.js', 'TypeScript', 'Tailwind', 'Node.js'],
      githubUrl: '',
      liveUrl: '',
      screenshots: [
        'https://placehold.co/1200x675/090e1f/7fa2ff?text=Add+Screenshot+1',
        'https://placehold.co/1200x675/090e1f/7fa2ff?text=Add+Screenshot+2'
      ],
      isPlaceholder: true
    },
    {
      id: 'p2',
      title: '(Add LinkedIn Project Title #2)',
      shortDescription: '(Add short project summary from LinkedIn.)',
      longDescription:
        '(Add architecture, key security controls, and measurable impact.)',
      categories: ['Security', 'AI'],
      stack: ['Python', 'FastAPI', 'PostgreSQL', 'Docker'],
      githubUrl: '',
      liveUrl: '',
      screenshots: [
        'https://placehold.co/1200x675/090e1f/39d0c9?text=Add+Screenshot+1',
        'https://placehold.co/1200x675/090e1f/39d0c9?text=Add+Screenshot+2'
      ],
      isPlaceholder: true
    },
    {
      id: 'p3',
      title: '(Add LinkedIn Project Title #3)',
      shortDescription: '(Add short project summary from LinkedIn.)',
      longDescription:
        '(Add mobile or web details, your responsibilities, and outcomes.)',
      categories: ['Mobile', 'Web'],
      stack: ['React Native', 'Firebase', 'TypeScript'],
      githubUrl: '',
      liveUrl: '',
      screenshots: [
        'https://placehold.co/1200x675/090e1f/c7f36b?text=Add+Screenshot+1',
        'https://placehold.co/1200x675/090e1f/c7f36b?text=Add+Screenshot+2'
      ],
      isPlaceholder: true
    }
  ],
  experience: [
    {
      id: 'e1',
      organization: '(Add organization from LinkedIn)',
      role: '(Add role title)',
      start: '(Add start month/year)',
      end: '(Add end month/year or Present)',
      achievements: [
        '(Add measurable achievement #1)',
        '(Add measurable achievement #2)',
        '(Add measurable achievement #3)'
      ]
    },
    {
      id: 'e2',
      organization: '(Add organization from LinkedIn)',
      role: '(Add role title)',
      start: '(Add start month/year)',
      end: '(Add end month/year or Present)',
      achievements: [
        '(Add measurable achievement #1)',
        '(Add measurable achievement #2)'
      ]
    }
  ],
  education: [
    {
      id: 'ed1',
      institution: '(Add university or college from LinkedIn)',
      degree: '(Add degree or program)',
      start: '(Add start year)',
      end: '(Add end year)',
      notes: '(Add honors, key coursework, or relevant activities.)'
    }
  ],
  skills: [
    {
      category: 'Frontend',
      items: [
        { name: 'React / Next.js', level: 82 },
        { name: 'TypeScript', level: 80 },
        { name: 'Tailwind CSS', level: 78 }
      ]
    },
    {
      category: 'Backend',
      items: [
        { name: 'Node.js', level: 76 },
        { name: 'REST APIs', level: 78 },
        { name: 'SQL / PostgreSQL', level: 72 }
      ]
    },
    {
      category: 'Security',
      items: [
        { name: 'Secure Coding Practices', level: 80 },
        { name: 'OWASP Concepts', level: 74 },
        { name: 'Vulnerability Testing', level: 70 }
      ]
    },
    {
      category: 'Tools',
      items: [
        { name: 'Git and GitHub', level: 84 },
        { name: 'Docker', level: 68 },
        { name: 'Linux CLI', level: 77 }
      ]
    }
  ],
  certifications: [],
  contact: {
    email: 'mahalisifael@gmail.com',
    socials: [
      {
        label: 'LinkedIn',
        url: 'https://www.linkedin.com/in/sifael-mahali-166447311/',
        handle: '/in/sifael-mahali-166447311'
      },
      {
        label: 'GitHub',
        url: 'https://github.com/(add-your-username)',
        handle: '(Add your GitHub)'
      }
    ]
  },
  footer: {
    location: '(Add your location)',
    timezone: '(Add your timezone)'
  }
};
