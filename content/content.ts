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
  source?: 'manual' | 'github';
  stars?: number;
  updatedAt?: string;
  isPlaceholder?: boolean;
}

export interface ExperienceItem {
  id: string;
  organization: string;
  role: string;
  employmentType?: string;
  location?: string;
  locationType?: string;
  start: string;
  end: string;
  achievements: string[];
  skillsUsed?: string[];
}

export interface EducationItem {
  id: string;
  institution: string;
  degree: string;
  fieldOfStudy?: string;
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
  issueDate: string;
  credentialId?: string;
}

export interface PortfolioContent {
  site: {
    name: string;
    title: string;
    description: string;
    keywords: string[];
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
    title: 'Sifael Mahali | Cybersecurity | CTF Player | Networking Enthusiast',
    description:
      'Cybersecurity-focused Software Engineering student specializing in CTF challenges, penetration testing, digital forensics, and network security.',
    keywords: [
      'Sifael Mahali',
      'Cybersecurity Student',
      'Penetration Tester',
      'Digital Forensics',
      'Network Security Analyst',
      'CTF Player',
      'Incident Response',
      'Security Architecture',
      'Threat Detection',
      'Vulnerability Assessment',
      'Secure Systems Engineering'
    ]
  },
  dataStatus: {
    source: 'LinkedIn Export (User Provided)',
    linkedInUrl: 'https://www.linkedin.com/in/sifael-mahali-166447311/',
    note:
      'Profile data was imported from your provided LinkedIn export on February 24, 2026.'
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
    tagline: 'Cybersecurity | CTF Player | Networking Enthusiast',
    description:
      'Cybersecurity-focused Software Engineering student with hands-on experience in CTFs, penetration testing, digital forensics, and secure systems architecture.',
    availability: 'Open to cybersecurity and software engineering opportunities',
    primaryCta: { label: 'View Projects', href: '#projects' },
    secondaryCta: { label: 'Download CV', href: '/cv/sifael-mahali-cv.pdf' }
  },
  about: {
    bio:
      'Cybersecurity-focused Software Engineering student with hands-on experience in Capture The Flag (CTF) challenges, penetration testing, digital forensics, and network security. Strong foundation in secure systems architecture, incident response, and operating system security. Passionate about offensive security, threat detection, and continuous technical growth.',
    highlights: [
      'Built depth through the IBM cybersecurity learning track across architecture, compliance, cryptography, and forensics.',
      'Applies offensive security thinking through CTF workflows and practical vulnerability analysis.',
      'Combines software engineering and security to build secure-by-design systems.',
      'Active in cybersecurity community learning and collaborative technical practice.',
      'Internship impact metrics available soon (add quantified outcomes from Amcet Innovation Hub).'
    ],
    techStack: [
      'Python',
      'Java',
      'C++',
      'PHP',
      'Spring Boot',
      'Angular',
      'Linux',
      'Network Security',
      'Penetration Testing',
      'Digital Forensics',
      'Incident Response',
      'OSINT'
    ]
  },
  projectCategories: ['Security', 'Web', 'AI', 'Mobile'],
  projects: [
    {
      id: 'manual-ctf',
      title: 'CTF Labs and Exploitation Writeups',
      shortDescription:
        'Hands-on CTF challenge solving across web exploitation, enumeration, privilege escalation, and forensic analysis.',
      longDescription:
        'Case-study project slot for documenting CTF paths, methodology, tooling, and post-exploitation lessons learned. Add challenge links, metrics, and screenshots.',
      categories: ['Security'],
      stack: ['Python', 'Linux', 'Wireshark', 'Burp Suite'],
      githubUrl: '',
      liveUrl: '',
      screenshots: [
        'https://placehold.co/1200x675/140b06/f44e00?text=Add+CTF+Screenshot+1',
        'https://placehold.co/1200x675/140b06/f44e00?text=Add+CTF+Screenshot+2'
      ],
      source: 'manual',
      isPlaceholder: true
    },
    {
      id: 'manual-network',
      title: 'Network Security Monitoring Lab',
      shortDescription:
        'Practical network security lab focused on attack detection, log analysis, and response workflow hardening.',
      longDescription:
        'Case-study slot for packet analysis, baseline network behavior, anomaly detection, and incident handling playbooks. Add measurable outcomes.',
      categories: ['Security', 'Web'],
      stack: ['Network Security', 'SIEM', 'Linux', 'Threat Detection'],
      githubUrl: '',
      liveUrl: '',
      screenshots: [
        'https://placehold.co/1200x675/140b06/ff8c29?text=Add+Network+Lab+Screenshot+1',
        'https://placehold.co/1200x675/140b06/ff8c29?text=Add+Network+Lab+Screenshot+2'
      ],
      source: 'manual',
      isPlaceholder: true
    },
    {
      id: 'manual-secure-app',
      title: 'Secure App Hardening Playbook',
      shortDescription:
        'Secure coding and application hardening workflow for backend and web systems.',
      longDescription:
        'Case-study slot for documenting threat modeling, security controls, authentication design, and remediation process. Add before/after security findings.',
      categories: ['Web', 'Security'],
      stack: ['Java', 'Spring Boot', 'Angular', 'Application Security'],
      githubUrl: '',
      liveUrl: '',
      screenshots: [
        'https://placehold.co/1200x675/140b06/fd9f45?text=Add+Hardening+Screenshot+1',
        'https://placehold.co/1200x675/140b06/fd9f45?text=Add+Hardening+Screenshot+2'
      ],
      source: 'manual',
      isPlaceholder: true
    }
  ],
  experience: [
    {
      id: 'exp-amcet',
      organization: 'Amcet Innovation Hub',
      role: 'Cybersecurity Intern',
      employmentType: 'Internship',
      location: 'Ally Sykes Road, Mbezi Beach, Dar es Salaam',
      locationType: 'On-site',
      start: 'July 2025',
      end: 'Present',
      achievements: [
        'Worked in an on-site engineering/security environment on cybersecurity and secure software tasks.',
        'Contributed to Java Spring Boot and Angular workflows with a focus on secure implementation.',
        'Supported network security and cyber defense-related activities during internship execution.'
      ],
      skillsUsed: ['Java', 'Spring Boot', 'Angular', 'Cybersecurity', 'Network Security']
    }
  ],
  education: [
    {
      id: 'edu-udom',
      institution: 'University of Dodoma',
      degree: "Bachelor's Degree",
      fieldOfStudy: 'Software Engineering',
      start: 'November 2023',
      end: 'November 2027 (Expected)',
      notes:
        'Academic focus on software engineering fundamentals with applied cybersecurity learning and practical labs.'
    }
  ],
  skills: [
    {
      category: 'Programming',
      items: [
        { name: 'Python', level: 82 },
        { name: 'Java', level: 78 },
        { name: 'C++', level: 70 },
        { name: 'PHP', level: 68 },
        { name: 'Spring Boot', level: 74 },
        { name: 'Angular', level: 70 }
      ]
    },
    {
      category: 'Cybersecurity',
      items: [
        { name: 'Penetration Testing', level: 82 },
        { name: 'Vulnerability Assessment', level: 80 },
        { name: 'Digital Forensics', level: 78 },
        { name: 'Incident Response', level: 77 },
        { name: 'Threat Detection', level: 76 },
        { name: 'Cryptography', level: 72 },
        { name: 'IAM / GRC / OSINT', level: 70 }
      ]
    },
    {
      category: 'Systems',
      items: [
        { name: 'Linux', level: 80 },
        { name: 'Windows', level: 75 },
        { name: 'macOS', level: 70 },
        { name: 'Active Directory', level: 68 },
        { name: 'OS Administration', level: 76 },
        { name: 'Virtualization', level: 66 }
      ]
    },
    {
      category: 'Networking',
      items: [
        { name: 'Network Security', level: 80 },
        { name: 'SIEM Concepts', level: 72 },
        { name: 'VoIP / IP PBX', level: 70 },
        { name: 'Asterisk', level: 68 },
        { name: 'SIP Protocol', level: 69 }
      ]
    }
  ],
  certifications: [
    {
      name: 'Cybersecurity Case Studies and Capstone Project',
      issuer: 'IBM',
      issueDate: 'February 2026',
      credentialId: '9KZF4WS7M2T7'
    },
    {
      name: 'Penetration Testing, Threat Hunting, and Cryptography',
      issuer: 'IBM',
      issueDate: 'January 2026',
      credentialId: 'P8KMZ3QW6K6T'
    },
    {
      name: 'Cybersecurity Compliance Framework, Standards & Regulations',
      issuer: 'IBM',
      issueDate: 'December 2025',
      credentialId: 'Q38POODH5LR4'
    },
    {
      name: 'Cybersecurity Architecture',
      issuer: 'IBM',
      issueDate: 'October 2025',
      credentialId: 'BSAIZ70A89N6'
    },
    {
      name: 'Database Essentials and Vulnerabilities',
      issuer: 'IBM',
      issueDate: 'March 2025',
      credentialId: 'KJZJ68ONLIJ1'
    },
    {
      name: 'Computer Networks and Network Security',
      issuer: 'IBM',
      issueDate: 'March 2025',
      credentialId: 'HHB49QCJ8FIY'
    },
    {
      name: 'Operating Systems: Overview, Administration, and Security',
      issuer: 'IBM',
      issueDate: 'March 2025',
      credentialId: '3LJ6OY6MYXN0'
    },
    {
      name: 'Introduction to Cybersecurity Tools & Cyberattacks',
      issuer: 'IBM',
      issueDate: 'January 2025',
      credentialId: 'JHJFSD5PBTGY'
    },
    {
      name: 'Incident Response and Digital Forensics',
      issuer: 'IBM',
      issueDate: 'January 2025'
    },
    {
      name: 'Introduction to Cybersecurity Essentials',
      issuer: 'IBM',
      issueDate: 'December 2024',
      credentialId: 'VRBJJLRKXJ0L'
    },
    {
      name: 'Introduction to Cybersecurity Careers',
      issuer: 'IBM',
      issueDate: 'December 2024',
      credentialId: 'CIO1E8A6IWHD'
    },
    {
      name: 'CompletePBX Certified',
      issuer: 'Xorcom',
      issueDate: 'August 2024'
    },
    {
      name: 'Certificate of Participation',
      issuer: 'H4K-IT Cybersecurity Community',
      issueDate: 'August 2025'
    }
  ],
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
        url: 'https://github.com/Zealot-coder/',
        handle: '@Zealot-coder'
      }
    ]
  },
  footer: {
    location: 'Dar es Salaam, Tanzania',
    timezone: 'EAT (UTC+03:00)'
  }
};
