
export interface BoomerAng {
  id: string;
  name: string;
  role: 'orchestrator' | 'researcher' | 'executor' | 'critic' | 'analyst';
  status: 'idle' | 'busy' | 'offline';
  specialty: string;
  label: string; // The "display name" for the UI
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
    repo_source: 'github.com/achievemor/acheevy',
  },
  {
    id: 'finder-ang',
    name: 'Finder_Ang',
    role: 'researcher',
    status: 'idle',
    specialty: 'Information Retrieval & Search',
    label: 'Deep Search',
    repo_source: 'github.com/achievemor/finder-ang',
  },
  {
    id: 'execution-ang',
    name: 'Execution_Ang',
    role: 'executor',
    status: 'idle',
    specialty: 'Code Execution & Deployment',
    label: 'Runtime Ops',
    repo_source: 'github.com/achievemor/execution-ang',
  },
  {
    id: 'critic-ang',
    name: 'Critic_Ang',
    role: 'critic',
    status: 'idle',
    specialty: 'Code Review & Security Analysis',
    label: 'Quality Assurance',
    repo_source: 'github.com/achievemor/critic-ang',
  },
  {
    id: 'data-ang',
    name: 'Data_Ang',
    role: 'analyst',
    status: 'idle',
    specialty: 'Data Processing & Analytics',
    label: 'Data Science',
    repo_source: 'github.com/achievemor/data-ang',
  },
  {
    id: 'market-ang',
    name: 'Market_Ang',
    role: 'researcher',
    status: 'idle',
    specialty: 'Market Trends & Competitor Analysis',
    label: 'Market Intelligence',
    repo_source: 'github.com/achievemor/market-ang',
  },
  {
    id: 'design-ang',
    name: 'Design_Ang',
    role: 'executor',
    status: 'idle',
    specialty: 'UI/UX Design & Generation',
    label: 'Creative Studio',
    repo_source: 'github.com/achievemor/design-ang',
  }
];
