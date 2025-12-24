
import { Profile, Service, Category } from '../types';

export const MOCK_CATEGORIES: Category[] = [
  // --- TIER 1: FEATURED ---
  {
    id: 'c1',
    name: 'AI & Automation',
    slug: 'ai-automation',
    description: 'Generative AI, Chatbots & Automation.',
    iconEmoji: '🤖',
    imageUrl: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&w=800&q=80',
    tier: 1,
    avgHourlyRate: 180.00,
    demandLevel: 'critical',
    demandGrowthPercent: 22,
    activeProfessionals: 1250,
    subcategories: ['LLM Integration', 'Prompt Engineering', 'Python Scripting']
  },
  {
    id: 'c2',
    name: 'Web & App Development',
    slug: 'web-development',
    description: 'Full-Stack, Frontend, Backend, Mobile.',
    iconEmoji: '💻',
    imageUrl: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=800&q=80',
    tier: 1,
    avgHourlyRate: 120.00,
    demandLevel: 'critical',
    demandGrowthPercent: 18,
    activeProfessionals: 3500,
    subcategories: ['React', 'Next.js', 'Node.js', 'Flutter']
  },
  {
    id: 'c3',
    name: 'Data Science & Analytics',
    slug: 'data-analytics',
    description: 'Data Analysis, ML, Business Intelligence.',
    iconEmoji: '📊',
    imageUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80',
    tier: 1,
    avgHourlyRate: 130.00,
    demandLevel: 'critical',
    demandGrowthPercent: 21,
    activeProfessionals: 1800,
    subcategories: ['Dashboards', 'Predictive Models', 'Data Engineering']
  },
  {
    id: 'c4',
    name: 'Design & Creative',
    slug: 'design',
    description: 'UI/UX, Graphic Design, Branding, 3D.',
    iconEmoji: '🎨',
    imageUrl: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?auto=format&fit=crop&w=800&q=80',
    tier: 1,
    avgHourlyRate: 95.00,
    demandLevel: 'high',
    demandGrowthPercent: 15,
    activeProfessionals: 2400,
    subcategories: ['Web Design', 'Brand Identity', 'Product Visualization']
  },
  {
    id: 'c5',
    name: 'Digital Marketing',
    slug: 'digital-marketing',
    description: 'SEO, Paid Ads, Social Media, Email.',
    iconEmoji: '📱',
    imageUrl: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80',
    tier: 1,
    avgHourlyRate: 85.00,
    demandLevel: 'high',
    demandGrowthPercent: 12,
    activeProfessionals: 2100,
    subcategories: ['Growth Strategy', 'Content Marketing', 'Analytics']
  },
  {
    id: 'c6',
    name: 'Cybersecurity',
    slug: 'cybersecurity',
    description: 'Security Audits, Pen Testing, Compliance.',
    iconEmoji: '🔒',
    imageUrl: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=800&q=80',
    tier: 1,
    avgHourlyRate: 160.00,
    demandLevel: 'critical',
    demandGrowthPercent: 29,
    activeProfessionals: 650,
    subcategories: ['Vulnerability Assessment', 'Security Consulting']
  },
  {
    id: 'c7',
    name: 'Writing & Content',
    slug: 'content-writing',
    description: 'Copywriting, Technical Writing, Blogs.',
    iconEmoji: '✍️',
    imageUrl: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=800&q=80',
    tier: 1,
    avgHourlyRate: 65.00,
    demandLevel: 'high',
    demandGrowthPercent: 8,
    activeProfessionals: 2800,
    subcategories: ['Sales Copy', 'Documentation', 'SEO Content']
  },
  {
    id: 'c8',
    name: 'Business Consulting',
    slug: 'business-consulting',
    description: 'Strategy, Operations, Financial Modeling.',
    iconEmoji: '💼',
    imageUrl: 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&w=800&q=80',
    tier: 1,
    avgHourlyRate: 140.00,
    demandLevel: 'high',
    demandGrowthPercent: 10,
    activeProfessionals: 900,
    subcategories: ['Business Planning', 'Operational Optimization']
  },
  {
    id: 'c9',
    name: 'Video & Podcasting',
    slug: 'video-production',
    description: 'Video Editing, Production, Podcasts.',
    iconEmoji: '🎙️',
    imageUrl: 'https://images.unsplash.com/photo-1590602847861-f357a9332bbc?auto=format&fit=crop&w=800&q=80',
    tier: 1,
    avgHourlyRate: 75.00,
    demandLevel: 'high',
    demandGrowthPercent: 25,
    activeProfessionals: 1600,
    subcategories: ['Editing', 'Post-Production', 'Sound Design']
  },
  {
    id: 'c10',
    name: 'E-commerce & Shopify',
    slug: 'ecommerce',
    description: 'Shopify, Amazon, WooCommerce Setup.',
    iconEmoji: '🛒',
    imageUrl: 'https://images.unsplash.com/photo-1556742049-0cfed4f7a07d?auto=format&fit=crop&w=800&q=80',
    tier: 1,
    avgHourlyRate: 100.00,
    demandLevel: 'high',
    demandGrowthPercent: 14,
    activeProfessionals: 1200,
    subcategories: ['Store Development', 'Product Optimization']
  },
  {
    id: 'c11',
    name: 'Cloud & DevOps',
    slug: 'cloud-devops',
    description: 'AWS, GCP, Azure, Docker, Kubernetes.',
    iconEmoji: '☁️',
    imageUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=800&q=80',
    tier: 1,
    avgHourlyRate: 135.00,
    demandLevel: 'critical',
    demandGrowthPercent: 24,
    activeProfessionals: 950,
    subcategories: ['Infrastructure Automation', 'CI/CD Pipelines']
  },
  {
    id: 'c12',
    name: 'QA & Testing',
    slug: 'qa-testing',
    description: 'Test Automation, QA, Performance Testing.',
    iconEmoji: '✅',
    imageUrl: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=800&q=80',
    tier: 1,
    avgHourlyRate: 75.00,
    demandLevel: 'high',
    demandGrowthPercent: 13,
    activeProfessionals: 1100,
    subcategories: ['Quality Assurance', 'Test Strategy', 'Automation']
  },

  // --- TIER 2: GROWING ---
  {
    id: 'c13',
    name: 'Virtual Assistance',
    slug: 'virtual-assistance',
    description: 'Executive Assistant, Admin Support.',
    iconEmoji: '🤝',
    imageUrl: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=800&q=80',
    tier: 2,
    avgHourlyRate: 45.00,
    demandLevel: 'high', // Mapped 'very_high' to 'high' for type safety
    demandGrowthPercent: 5,
    activeProfessionals: 3200,
    subcategories: ['Email', 'Scheduling', 'Data Entry']
  },
  {
    id: 'c14',
    name: 'Instructional Design',
    slug: 'training',
    description: 'Course Creation, E-Learning, Training.',
    iconEmoji: '🎓',
    imageUrl: 'https://images.unsplash.com/photo-1501504905252-473c47e087f8?auto=format&fit=crop&w=800&q=80',
    tier: 2,
    avgHourlyRate: 90.00,
    demandLevel: 'high',
    demandGrowthPercent: 11,
    activeProfessionals: 750,
    subcategories: ['Course Design', 'Training Content']
  },
  {
    id: 'c15',
    name: 'Legal & Compliance',
    slug: 'legal-compliance',
    description: 'Contract Review, Legal Writing, Compliance.',
    iconEmoji: '⚖️',
    imageUrl: 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?auto=format&fit=crop&w=800&q=80',
    tier: 2,
    avgHourlyRate: 180.00,
    demandLevel: 'moderate',
    demandGrowthPercent: 7,
    activeProfessionals: 420,
    subcategories: ['Legal Guidance', 'Compliance Consulting']
  },
  {
    id: 'c16',
    name: 'Human Resources',
    slug: 'human-resources',
    description: 'HR Consulting, Recruitment, Development.',
    iconEmoji: '👥',
    imageUrl: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=800&q=80',
    tier: 2,
    avgHourlyRate: 95.00,
    demandLevel: 'high',
    demandGrowthPercent: 9,
    activeProfessionals: 680,
    subcategories: ['HR Strategy', 'Talent Acquisition']
  },
  {
    id: 'c17',
    name: 'Account Management',
    slug: 'account-management',
    description: 'Account Executive, Customer Success.',
    iconEmoji: '💼',
    imageUrl: 'https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=800&q=80',
    tier: 2,
    avgHourlyRate: 70.00,
    demandLevel: 'high',
    demandGrowthPercent: 11,
    activeProfessionals: 1250,
    subcategories: ['Client Relationship', 'Sales', 'Renewals']
  },
  {
    id: 'c18',
    name: 'Community Management',
    slug: 'community-management',
    description: 'Community Strategy, Moderation, Engagement.',
    iconEmoji: '🌍',
    imageUrl: 'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?auto=format&fit=crop&w=800&q=80',
    tier: 2,
    avgHourlyRate: 60.00,
    demandLevel: 'moderate',
    demandGrowthPercent: 8,
    activeProfessionals: 780,
    subcategories: ['Community Building', 'Engagement Strategy']
  },
  {
    id: 'c19',
    name: 'Blockchain & Web3',
    slug: 'blockchain-web3',
    description: 'Smart Contracts, DApps, Crypto Dev.',
    iconEmoji: '⛓️',
    imageUrl: 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?auto=format&fit=crop&w=800&q=80',
    tier: 2,
    avgHourlyRate: 200.00,
    demandLevel: 'high',
    demandGrowthPercent: 31,
    activeProfessionals: 580,
    subcategories: ['Blockchain Dev', 'Web3 Protocols']
  },
  {
    id: 'c20',
    name: 'Mobile Development',
    slug: 'mobile-development',
    description: 'iOS, Android, React Native, Flutter.',
    iconEmoji: '📲',
    imageUrl: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?auto=format&fit=crop&w=800&q=80',
    tier: 2,
    avgHourlyRate: 110.00,
    demandLevel: 'high',
    demandGrowthPercent: 16,
    activeProfessionals: 1400,
    subcategories: ['Native Apps', 'Cross-Platform']
  }
];

export const MOCK_PROFILES: Profile[] = [
  {
    id: '1',
    role: 'professional',
    displayName: 'Sarah Jenkins',
    title: 'Senior React Developer',
    bio: 'Specializing in scalable frontend architecture and Next.js applications. 8+ years of experience working with startups and enterprise clients.',
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=crop&w=200&q=80',
    location: 'Austin, TX',
    hourlyRate: 125,
    skills: ['React', 'Next.js', 'TypeScript', 'Node.js'],
    
    // Customization
    customization: {
        theme: 'carbon',
        featuredSkills: ['React', 'Next.js']
    },

    // Legacy fields supported by updated Profile type
    rating: 4.9,
    reviewCount: 42,
    verified: true,
    availableLocal: true,
    availableRemote: true,
    joinedYear: 2021,

    // Required fields
    stage: 'community',
    reputationScore: 90,
    verificationStatus: 'verified',
    jobsCompleted: 42,
    joinedDate: '2021-03-15'
  },
  {
    id: '2',
    role: 'professional',
    displayName: 'Marcus Thorne',
    title: 'Certified Master Plumber',
    bio: 'Residential and commercial plumbing specialist. Available for emergency repairs and renovations in the greater Chicago area.',
    avatarUrl: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?ixlib=rb-1.2.1&auto=format&fit=crop&w=200&q=80',
    location: 'Chicago, IL',
    hourlyRate: 95,
    skills: ['Plumbing', 'Pipe Fitting', 'Emergency Repair', 'HVAC'],
    
    customization: {
        theme: 'royal',
        accentColor: '#fbbf24',
        featuredSkills: ['Emergency Repair']
    },

    rating: 5.0,
    reviewCount: 115,
    verified: true,
    availableLocal: true,
    availableRemote: false,
    joinedYear: 2020,

    stage: 'community',
    reputationScore: 88,
    verificationStatus: 'verified',
    jobsCompleted: 115,
    joinedDate: '2020-06-10'
  },
  {
    id: '3',
    role: 'professional',
    displayName: 'Elena Rodriguez',
    title: 'Brand Identity Designer',
    bio: 'Creating memorable brand experiences for digital-first companies. I help businesses find their visual voice.',
    avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?ixlib=rb-1.2.1&auto=format&fit=crop&w=200&q=80',
    location: 'Barcelona, Spain',
    hourlyRate: 85,
    skills: ['Logo Design', 'Branding', 'Adobe Suite', 'Figma'],
    
    customization: {
        theme: 'minimal',
        featuredSkills: ['Logo Design', 'Figma']
    },

    rating: 4.8,
    reviewCount: 28,
    verified: true,
    availableLocal: false,
    availableRemote: true,
    joinedYear: 2023,

    stage: 'garage',
    reputationScore: 75,
    verificationStatus: 'pending',
    jobsCompleted: 28,
    joinedDate: '2023-01-20'
  },
  {
    id: '4',
    role: 'professional',
    displayName: 'David Chen',
    title: 'Network Security Consultant',
    bio: 'Helping small businesses secure their infrastructure. Penetration testing and security auditing.',
    avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=crop&w=200&q=80',
    location: 'San Francisco, CA',
    hourlyRate: 180,
    skills: ['Cybersecurity', 'Network Admin', 'Compliance'],
    
    customization: {
        theme: 'neon',
        accentColor: '#10b981',
        featuredSkills: ['Cybersecurity']
    },

    rating: 5.0,
    reviewCount: 15,
    verified: true,
    availableLocal: true,
    availableRemote: true,
    joinedYear: 2022,

    stage: 'global',
    reputationScore: 95,
    verificationStatus: 'verified',
    jobsCompleted: 15,
    joinedDate: '2022-11-05'
  }
];

export const MOCK_SERVICES: Service[] = [
  {
    id: 's1',
    technicianId: '1',
    title: 'Full Stack Web Application MVP',
    description: 'Complete build of a Minimum Viable Product using Next.js and Supabase.',
    price: 5000,
    unit: 'project',
    estimatedDuration: '4 weeks',
    type: 'remote'
  },
  {
    id: 's2',
    technicianId: '1',
    title: 'Hourly Consultation',
    description: 'Code review, architecture planning, or debugging support.',
    price: 125,
    unit: 'hour',
    estimatedDuration: '1 hour',
    type: 'hybrid'
  },
  {
    id: 's3',
    technicianId: '2',
    title: 'Emergency Leak Repair',
    description: 'Immediate response for active leaks. Includes first hour of labor.',
    price: 150,
    unit: 'project',
    estimatedDuration: 'Varies',
    type: 'local'
  }
];
