begin;

insert into public.profiles (
  full_name,
  headline,
  bio,
  location,
  email,
  open_to_work,
  social_links,
  tech_stack,
  highlights,
  seo_title,
  seo_description
)
values (
  'Sifael Mahali',
  'Cybersecurity | CTF Player | Networking Enthusiast',
  'Cybersecurity-focused Software Engineering student with hands-on experience in Capture The Flag (CTF) challenges, penetration testing, digital forensics, and network security. Strong foundation in secure systems architecture, incident response, and operating system security. Passionate about offensive security, threat detection, and continuous technical growth.',
  'Dar es Salaam, Tanzania',
  'mahalisifael@gmail.com',
  true,
  '{"linkedin":"https://www.linkedin.com/in/sifael-mahali-166447311/","github":"https://github.com/Zealot-coder/"}'::jsonb,
  array[
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
  ]::text[],
  array[
    'Built depth through the IBM cybersecurity learning track across architecture, compliance, cryptography, and forensics.',
    'Applies offensive security thinking through CTF workflows and practical vulnerability analysis.',
    'Combines software engineering and security to build secure-by-design systems.',
    'Active in cybersecurity community learning and collaborative technical practice.',
    'Internship impact metrics available soon (add quantified outcomes from Amcet Innovation Hub).'
  ]::text[],
  'Sifael Mahali | Cybersecurity | CTF Player | Networking Enthusiast',
  'Cybersecurity-focused Software Engineering student specializing in CTF challenges, penetration testing, digital forensics, and network security.'
)
on conflict (email) do update
set
  full_name = excluded.full_name,
  headline = excluded.headline,
  bio = excluded.bio,
  location = excluded.location,
  open_to_work = excluded.open_to_work,
  social_links = excluded.social_links,
  tech_stack = excluded.tech_stack,
  highlights = excluded.highlights,
  seo_title = excluded.seo_title,
  seo_description = excluded.seo_description;

insert into public.projects (
  title,
  slug,
  description,
  long_description,
  thumbnail_url,
  demo_url,
  repo_url,
  tech_stack,
  categories,
  is_pinned,
  is_github_synced,
  display_order,
  status
)
values
  (
    'CTF Labs and Exploitation Writeups',
    'ctf-labs-and-exploitation-writeups',
    'Hands-on CTF challenge solving across web exploitation, enumeration, privilege escalation, and forensic analysis.',
    'Case-study project slot for documenting CTF paths, methodology, tooling, and post-exploitation lessons learned. Add challenge links, metrics, and screenshots.',
    'https://placehold.co/1200x675/140b06/f44e00?text=Add+CTF+Screenshot+1',
    null,
    null,
    array['Python', 'Linux', 'Wireshark', 'Burp Suite']::text[],
    array['security']::text[],
    false,
    false,
    1,
    'published'
  ),
  (
    'Network Security Monitoring Lab',
    'network-security-monitoring-lab',
    'Practical network security lab focused on attack detection, log analysis, and response workflow hardening.',
    'Case-study slot for packet analysis, baseline network behavior, anomaly detection, and incident handling playbooks. Add measurable outcomes.',
    'https://placehold.co/1200x675/140b06/ff8c29?text=Add+Network+Lab+Screenshot+1',
    null,
    null,
    array['Network Security', 'SIEM', 'Linux', 'Threat Detection']::text[],
    array['security', 'web']::text[],
    false,
    false,
    2,
    'published'
  ),
  (
    'Secure App Hardening Playbook',
    'secure-app-hardening-playbook',
    'Secure coding and application hardening workflow for backend and web systems.',
    'Case-study slot for documenting threat modeling, security controls, authentication design, and remediation process. Add before/after security findings.',
    'https://placehold.co/1200x675/140b06/fd9f45?text=Add+Hardening+Screenshot+1',
    null,
    null,
    array['Java', 'Spring Boot', 'Angular', 'Application Security']::text[],
    array['web', 'security']::text[],
    false,
    false,
    3,
    'published'
  )
on conflict (slug) do update
set
  title = excluded.title,
  description = excluded.description,
  long_description = excluded.long_description,
  thumbnail_url = excluded.thumbnail_url,
  demo_url = excluded.demo_url,
  repo_url = excluded.repo_url,
  tech_stack = excluded.tech_stack,
  categories = excluded.categories,
  is_pinned = excluded.is_pinned,
  is_github_synced = excluded.is_github_synced,
  display_order = excluded.display_order,
  status = excluded.status;

insert into public.experiences (
  type,
  title,
  organization,
  location,
  location_type,
  start_date,
  end_date,
  is_current,
  description,
  bullets,
  skills,
  display_order
)
values
  (
    'work',
    'Cybersecurity Intern',
    'Amcet Innovation Hub',
    'Ally Sykes Road, Mbezi Beach, Dar es Salaam',
    'on-site',
    date '2025-07-01',
    null,
    true,
    'On-site cybersecurity internship with secure software and network defense responsibilities.',
    array[
      'Worked in an on-site engineering/security environment on cybersecurity and secure software tasks.',
      'Contributed to Java Spring Boot and Angular workflows with a focus on secure implementation.',
      'Supported network security and cyber defense-related activities during internship execution.'
    ]::text[],
    array['Java', 'Spring Boot', 'Angular', 'Cybersecurity', 'Network Security']::text[],
    1
  ),
  (
    'education',
    'Bachelor''s Degree',
    'University of Dodoma',
    'Dodoma, Tanzania',
    null,
    date '2023-11-01',
    date '2027-11-01',
    false,
    'Software Engineering degree program with applied cybersecurity learning.',
    array[
      'Academic focus on software engineering fundamentals with practical cybersecurity labs.'
    ]::text[],
    array['Software Engineering', 'Cybersecurity']::text[],
    2
  )
on conflict (type, title, organization, start_date) do update
set
  location = excluded.location,
  location_type = excluded.location_type,
  end_date = excluded.end_date,
  is_current = excluded.is_current,
  description = excluded.description,
  bullets = excluded.bullets,
  skills = excluded.skills,
  display_order = excluded.display_order;

insert into public.skills (name, category, proficiency, is_featured, display_order)
values
  ('Python', 'programming', 82, true, 1),
  ('Java', 'programming', 78, true, 2),
  ('C++', 'programming', 70, false, 3),
  ('PHP', 'programming', 68, false, 4),
  ('Spring Boot', 'programming', 74, true, 5),
  ('Angular', 'programming', 70, true, 6),
  ('Penetration Testing', 'cybersecurity', 82, true, 1),
  ('Vulnerability Assessment', 'cybersecurity', 80, false, 2),
  ('Digital Forensics', 'cybersecurity', 78, true, 3),
  ('Incident Response', 'cybersecurity', 77, true, 4),
  ('Threat Detection', 'cybersecurity', 76, true, 5),
  ('Cryptography', 'cybersecurity', 72, false, 6),
  ('Linux', 'systems', 80, true, 1),
  ('Windows', 'systems', 75, false, 2),
  ('macOS', 'systems', 70, false, 3),
  ('Active Directory', 'systems', 68, false, 4),
  ('OS Administration', 'systems', 76, true, 5),
  ('Virtualization', 'systems', 66, false, 6),
  ('Network Security', 'networking', 80, true, 1),
  ('SIEM Concepts', 'networking', 72, false, 2),
  ('VoIP / IP PBX', 'networking', 70, false, 3),
  ('Asterisk', 'networking', 68, false, 4),
  ('SIP Protocol', 'networking', 69, false, 5)
on conflict (name, category) do update
set
  proficiency = excluded.proficiency,
  is_featured = excluded.is_featured,
  display_order = excluded.display_order;

insert into public.certifications (
  name,
  issuer,
  issue_date,
  credential_id,
  display_order
)
values
  ('Cybersecurity Case Studies and Capstone Project', 'IBM', date '2026-02-01', '9KZF4WS7M2T7', 1),
  ('Penetration Testing, Threat Hunting, and Cryptography', 'IBM', date '2026-01-01', 'P8KMZ3QW6K6T', 2),
  ('Cybersecurity Compliance Framework, Standards & Regulations', 'IBM', date '2025-12-01', 'Q38POODH5LR4', 3),
  ('Cybersecurity Architecture', 'IBM', date '2025-10-01', 'BSAIZ70A89N6', 4),
  ('Database Essentials and Vulnerabilities', 'IBM', date '2025-03-01', 'KJZJ68ONLIJ1', 5),
  ('Computer Networks and Network Security', 'IBM', date '2025-03-01', 'HHB49QCJ8FIY', 6),
  ('Operating Systems: Overview, Administration, and Security', 'IBM', date '2025-03-01', '3LJ6OY6MYXN0', 7),
  ('Introduction to Cybersecurity Tools & Cyberattacks', 'IBM', date '2025-01-01', 'JHJFSD5PBTGY', 8),
  ('Incident Response and Digital Forensics', 'IBM', date '2025-01-01', null, 9),
  ('Introduction to Cybersecurity Essentials', 'IBM', date '2024-12-01', 'VRBJJLRKXJ0L', 10),
  ('Introduction to Cybersecurity Careers', 'IBM', date '2024-12-01', 'CIO1E8A6IWHD', 11),
  ('CompletePBX Certified', 'Xorcom', date '2024-08-01', null, 12),
  ('Certificate of Participation', 'H4K-IT Cybersecurity Community', date '2025-08-01', null, 13)
on conflict (name, issuer, issue_date) do update
set
  credential_id = excluded.credential_id,
  display_order = excluded.display_order;

insert into public.site_settings (key, value, description)
values
  ('hero_cta_primary', '{"text":"View Projects","href":"#projects"}'::jsonb, 'Primary hero call-to-action'),
  ('hero_cta_secondary', '{"text":"Download CV","href":"/cv/sifael-mahali-cv.pdf"}'::jsonb, 'Secondary hero call-to-action'),
  ('maintenance_mode', 'false'::jsonb, 'Toggle site maintenance mode'),
  ('available_for_hire', 'true'::jsonb, 'Controls open-to-work badge and hiring banners'),
  ('theme_default', '"dark"'::jsonb, 'Default theme'),
  ('gtag_id', '""'::jsonb, 'Google Analytics ID'),
  ('projects_filter_default', '"All"'::jsonb, 'Default projects filter')
on conflict (key) do update
set
  value = excluded.value,
  description = excluded.description;

commit;
