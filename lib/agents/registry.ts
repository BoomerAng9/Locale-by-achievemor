
export interface BoomerAng {
  id: string;
  name: string;
  role: 'orchestrator' | 'researcher' | 'executor' | 'critic' | 'analyst';
  status: 'idle' | 'busy' | 'offline';
  specialty: string;
  label: string; // The "display name" for the UI
  icon: string; // Emoji icon for display
  description: string; // Agent description
  capabilities: string[]; // List of capabilities
  repo_source?: string;
  currentTask?: string;
}

export const AGENT_REGISTRY: BoomerAng[] = [
  {
    id: 'acheevy-core',
    name: 'ACHEEVY',
    role: 'orchestrator',
    status: 'idle',
    specialty: 'Strategic Planning & Delegation',
    label: 'Mission Control',
    icon: '🎯',
    description: 'The central orchestrator that coordinates all agents and manages complex workflows.',
    capabilities: ['Task Planning', 'Agent Delegation', 'Workflow Management', 'Priority Optimization'],
    repo_source: 'github.com/achievemor/acheevy',
  },
  {
    id: 'finder-ang',
    name: 'Finder_Ang',
    role: 'researcher',
    status: 'idle',
    specialty: 'Information Retrieval & Search',
    label: 'Deep Search',
    icon: '🔍',
    description: 'Expert at finding information, researching topics, and gathering data from multiple sources.',
    capabilities: ['Web Search', 'Document Analysis', 'Data Mining', 'Source Verification'],
    repo_source: 'github.com/achievemor/finder-ang',
  },
  {
    id: 'execution-ang',
    name: 'Execution_Ang',
    role: 'executor',
    status: 'idle',
    specialty: 'Code Execution & Deployment',
    label: 'Runtime Ops',
    icon: '⚡',
    description: 'Handles code execution, deployments, and runtime operations across environments.',
    capabilities: ['Code Execution', 'Deployment', 'Environment Setup', 'CI/CD Management'],
    repo_source: 'github.com/achievemor/execution-ang',
  },
  {
    id: 'critic-ang',
    name: 'Critic_Ang',
    role: 'critic',
    status: 'idle',
    specialty: 'Code Review & Security Analysis',
    label: 'Quality Assurance',
    icon: '🛡️',
    description: 'Reviews code for quality, security vulnerabilities, and best practices compliance.',
    capabilities: ['Code Review', 'Security Audit', 'Performance Analysis', 'Best Practices'],
    repo_source: 'github.com/achievemor/critic-ang',
  },
  {
    id: 'data-ang',
    name: 'Data_Ang',
    role: 'analyst',
    status: 'idle',
    specialty: 'Data Processing & Analytics',
    label: 'Data Science',
    icon: '📊',
    description: 'Processes data, generates insights, and creates visualizations from complex datasets.',
    capabilities: ['Data Analysis', 'Visualization', 'Statistical Modeling', 'Report Generation'],
    repo_source: 'github.com/achievemor/data-ang',
  },
  {
    id: 'market-ang',
    name: 'Market_Ang',
    role: 'researcher',
    status: 'idle',
    specialty: 'Market Trends & Competitor Analysis',
    label: 'Market Intelligence',
    icon: '📈',
    description: 'Analyzes market trends, competitors, and provides strategic business insights.',
    capabilities: ['Market Research', 'Competitor Analysis', 'Trend Forecasting', 'Business Strategy'],
    repo_source: 'github.com/achievemor/market-ang',
  },
  {
    id: 'design-ang',
    name: 'Design_Ang',
    role: 'executor',
    status: 'idle',
    specialty: 'UI/UX Design & Generation',
    label: 'Creative Studio',
    icon: '🎨',
    description: 'Creates UI/UX designs, generates visual assets, and implements design systems.',
    capabilities: ['UI Design', 'UX Research', 'Asset Generation', 'Design Systems'],
    repo_source: 'github.com/achievemor/design-ang',
  }
];
