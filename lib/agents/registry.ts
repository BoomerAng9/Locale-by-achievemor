/**
 * Agent Registry - Simplified after FOSTER phase cleanup
 * Lightweight agent definitions for ACHEEVY ecosystem
 */

export interface BoomerAng {
  id: string;
  name: string;
  role: string;
  specialty: string;
  status: 'active' | 'idle' | 'busy' | 'offline';
  avatar?: string;
  healthScore?: number;
  // Extended properties for UI compatibility
  label?: string;
  description?: string;
  icon?: string;
  capabilities?: string[];
  currentTask?: string | null;
}

// Core ACHEEVY Agents - simplified from legacy bloat
export const AGENT_REGISTRY: BoomerAng[] = [
  {
    id: 'acheevy-core',
    name: 'ACHEEVY',
    label: 'ACHEEVY',
    role: 'Executive Agent',
    specialty: 'Task orchestration and client communication',
    description: 'Executive AI agent for task orchestration',
    status: 'active',
    healthScore: 1.0,
    icon: '🤖',
    capabilities: ['orchestration', 'communication', 'delegation'],
    currentTask: null
  },
  {
    id: 'boomer-cto',
    name: 'Boomer CTO',
    label: 'CTO',
    role: 'Technology Strategist',
    specialty: 'Architecture, code review, technical decisions',
    description: 'Technology strategy and code review',
    status: 'active',
    healthScore: 0.95,
    icon: '💻',
    capabilities: ['code-review', 'architecture', 'tech-strategy'],
    currentTask: null
  },
  {
    id: 'boomer-cfo',
    name: 'Boomer CFO',
    label: 'CFO',
    role: 'Financial Analyst',
    specialty: 'Pricing strategy, revenue optimization',
    description: 'Financial analysis and pricing',
    status: 'active',
    healthScore: 0.92,
    icon: '💰',
    capabilities: ['pricing', 'finance', 'revenue'],
    currentTask: null
  },
  {
    id: 'boomer-coo',
    name: 'Boomer COO',
    label: 'COO',
    role: 'Operations Manager',
    specialty: 'Workflow automation, process improvement',
    description: 'Operations and workflow automation',
    status: 'active',
    healthScore: 0.88,
    icon: '⚙️',
    capabilities: ['operations', 'automation', 'processes'],
    currentTask: null
  },
  {
    id: 'boomer-cmo',
    name: 'Boomer CMO',
    label: 'CMO',
    role: 'Marketing Strategist',
    specialty: 'Campaigns, social media, branding',
    description: 'Marketing campaigns and branding',
    status: 'active',
    healthScore: 0.91,
    icon: '📣',
    capabilities: ['marketing', 'social-media', 'branding'],
    currentTask: null
  },
  {
    id: 'boomer-cdo',
    name: 'Boomer CDO',
    label: 'CDO',
    role: 'Design Director',
    specialty: 'UI/UX, visual identity, design systems',
    description: 'Design systems and visual identity',
    status: 'idle',
    healthScore: 0.85,
    icon: '🎨',
    capabilities: ['design', 'ui-ux', 'branding'],
    currentTask: null
  }
];

// Get agent by ID
export function getAgentById(id: string): BoomerAng | undefined {
  return AGENT_REGISTRY.find(agent => agent.id === id);
}

// Get available agents (health > 0.65)
export function getAvailableAgents(): BoomerAng[] {
  return AGENT_REGISTRY.filter(agent => 
    agent.status !== 'offline' && (agent.healthScore ?? 1) >= 0.65
  );
}

export default AGENT_REGISTRY;
