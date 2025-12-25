/**
 * Agent Registry - "Boomer_Angs"
 * Enhanced Intelligent Internet Agent Fleet
 * 19 Specialized AI Agents with Custom Labels
 */

export interface BoomerAng {
  id: string;
  name: string;
  label: string; // Custom human-friendly label
  role: 'orchestrator' | 'finder' | 'maker' | 'debugger' | 'visualizer' | 'guardian' | 'connector' | 'analyst';
  repo_source: string;
  repo_url: string;
  description: string;
  status: 'active' | 'standby' | 'offline' | 'error';
  capabilities: string[];
  specialty: string;
  icon: string;
  priority: number; // 1-5, higher = more critical
}

export const AGENT_REGISTRY: BoomerAng[] = [
  // === CORE ORCHESTRATION ===
  {
    id: 'acheevy-core',
    name: 'ACHEEVY',
    label: 'Core Intelligence',
    role: 'orchestrator',
    repo_source: 'ii-agent',
    repo_url: 'https://github.com/anthropics/ii-agent',
    description: 'Main Orchestrator powered by II-Agent framework. The brain of the Locale Nervous System.',
    status: 'active',
    capabilities: ['Task Delegation', 'Context Management', 'User Intent Analysis', 'Multi-Agent Coordination'],
    specialty: 'Strategic task orchestration & intelligent delegation',
    icon: '🧠',
    priority: 5
  },
  
  // === RESEARCH & DISCOVERY ===
  {
    id: 'finder-ang',
    name: 'Finder_Ang',
    label: 'Discovery Engine',
    role: 'finder',
    repo_source: 'ii-researcher',
    repo_url: 'https://github.com/anthropics/ii-researcher',
    description: 'Deep research agent. Finds information, validates facts, compiles reports.',
    status: 'active',
    capabilities: ['Web Search', 'Data Scraping', 'Fact Checking', 'Source Validation', 'Report Generation'],
    specialty: 'Research & information retrieval',
    icon: '🔍',
    priority: 4
  },
  {
    id: 'chronicle-ang',
    name: 'Chronicle_Ang',
    label: 'Memory Keeper',
    role: 'analyst',
    repo_source: 'anthropic-mcp',
    repo_url: 'https://github.com/anthropics/anthropic-mcp',
    description: 'Context and history management. Maintains conversation memory and project state.',
    status: 'active',
    capabilities: ['Context Tracking', 'History Management', 'State Persistence', 'Memory Retrieval'],
    specialty: 'Long-term memory & context management',
    icon: '📜',
    priority: 5
  },

  // === CODE & EXECUTION ===
  {
    id: 'codex-ang',
    name: 'Codex_Ang',
    label: 'Code Architect',
    role: 'maker',
    repo_source: 'codex-as-mcp',
    repo_url: 'https://github.com/anthropics/codex-as-mcp',
    description: 'Advanced coding agent. Generates, reviews, and optimizes code.',
    status: 'active',
    capabilities: ['Code Generation', 'Code Review', 'Refactoring', 'Testing', 'Documentation'],
    specialty: 'Full-stack code generation & optimization',
    icon: '💻',
    priority: 5
  },
  {
    id: 'manus-ang',
    name: 'Manus_Ang',
    label: 'Task Executor',
    role: 'maker',
    repo_source: 'manus-open',
    repo_url: 'https://github.com/manus-open/manus-open',
    description: 'Complex task execution agent. Handles multi-step operations autonomously.',
    status: 'active',
    capabilities: ['Task Execution', 'Pipeline Management', 'Workflow Automation', 'Error Recovery'],
    specialty: 'Autonomous complex task completion',
    icon: '⚡',
    priority: 4
  },
  {
    id: 'trae-ang',
    name: 'Trae_Ang',
    label: 'React Specialist',
    role: 'maker',
    repo_source: 'trae-agent',
    repo_url: 'https://github.com/anthropics/trae-agent',
    description: 'Frontend specialist. Expert in React, TypeScript, and modern UI development.',
    status: 'active',
    capabilities: ['React Components', 'TypeScript', 'UI/UX', 'State Management', 'Styling'],
    specialty: 'React & frontend development',
    icon: '⚛️',
    priority: 4
  },

  // === ANALYSIS & INSIGHTS ===
  {
    id: 'oracle-ang',
    name: 'Oracle_Ang',
    label: 'Insight Engine',
    role: 'analyst',
    repo_source: 'ii-analyst',
    repo_url: 'https://github.com/anthropics/ii-analyst',
    description: 'Analytics and predictions agent. Processes data for actionable insights.',
    status: 'active',
    capabilities: ['Data Analysis', 'Trend Detection', 'Predictions', 'Reporting', 'Visualization'],
    specialty: 'Analytics & predictive insights',
    icon: '🔮',
    priority: 3
  },
  {
    id: 'debugger-ang',
    name: 'Debugger_Ang',
    label: 'Error Hunter',
    role: 'debugger',
    repo_source: 'litellm-debugger',
    repo_url: 'https://github.com/BerriAI/litellm',
    description: 'Monitors LLM calls, traces errors, analyzes costs.',
    status: 'active',
    capabilities: ['Error Tracing', 'API Logging', 'Cost Analysis', 'Performance Monitoring'],
    specialty: 'LLM debugging & cost optimization',
    icon: '🐞',
    priority: 4
  },

  // === CONTENT & PRESENTATION ===
  {
    id: 'forge-ang',
    name: 'Forge_Ang',
    label: 'Content Builder',
    role: 'maker',
    repo_source: 'ii-content',
    repo_url: 'https://github.com/anthropics/ii-content',
    description: 'Content creation agent. Generates documents, articles, and marketing materials.',
    status: 'active',
    capabilities: ['Content Writing', 'Copywriting', 'SEO', 'Document Generation', 'Editing'],
    specialty: 'Content creation & copywriting',
    icon: '🔨',
    priority: 3
  },
  {
    id: 'viz-ang',
    name: 'Prism_Ang',
    label: 'Visual Designer',
    role: 'visualizer',
    repo_source: 'PPTist',
    repo_url: 'https://github.com/pptist/PPTist',
    description: 'Visual presentation agent. Creates slides, charts, and graphics.',
    status: 'active',
    capabilities: ['Slide Generation', 'Chart Creation', 'Layout Design', 'Data Visualization'],
    specialty: 'Presentations & visual design',
    icon: '🎨',
    priority: 3
  },

  // === INFRASTRUCTURE & SECURITY ===
  {
    id: 'sentinel-ang',
    name: 'Sentinel_Ang',
    label: 'Security Guard',
    role: 'guardian',
    repo_source: 'ii-security',
    repo_url: 'https://github.com/anthropics/ii-security',
    description: 'Security and verification agent. Protects data and validates operations.',
    status: 'active',
    capabilities: ['Security Scanning', 'Verification', 'Access Control', 'Audit Logging'],
    specialty: 'Security & verification',
    icon: '🛡️',
    priority: 5
  },
  {
    id: 'guardian-ang',
    name: 'Guardian_Ang',
    label: 'Error Shield',
    role: 'guardian',
    repo_source: 'ii-resilience',
    repo_url: 'https://github.com/anthropics/ii-resilience',
    description: 'Error handling and recovery agent. Ensures system stability.',
    status: 'active',
    capabilities: ['Error Handling', 'Recovery', 'Fallback Systems', 'Health Checks'],
    specialty: 'Error handling & system recovery',
    icon: '🏰',
    priority: 4
  },

  // === INTEGRATION & COMMUNICATION ===
  {
    id: 'nexus-ang',
    name: 'Nexus_Ang',
    label: 'Integration Hub',
    role: 'connector',
    repo_source: 'anthropic-mcp-servers',
    repo_url: 'https://github.com/anthropics/anthropic-mcp-servers',
    description: 'API and service integration agent. Connects external systems.',
    status: 'active',
    capabilities: ['API Integration', 'Webhook Management', 'Service Mesh', 'Data Sync'],
    specialty: 'API integration & service connectivity',
    icon: '🔗',
    priority: 4
  },
  {
    id: 'bridge-ang',
    name: 'Bridge_Ang',
    label: 'Platform Linker',
    role: 'connector',
    repo_source: 'mcp-bridge',
    repo_url: 'https://github.com/anthropics/mcp-bridge',
    description: 'Cross-platform operations agent. Bridges different systems and protocols.',
    status: 'active',
    capabilities: ['Cross-Platform Ops', 'Protocol Translation', 'System Bridging'],
    specialty: 'Cross-platform operations',
    icon: '🌉',
    priority: 3
  },
  {
    id: 'herald-ang',
    name: 'Herald_Ang',
    label: 'Messenger',
    role: 'connector',
    repo_source: 'ii-notify',
    repo_url: 'https://github.com/anthropics/ii-notify',
    description: 'Notifications and alerts agent. Manages communication channels.',
    status: 'active',
    capabilities: ['Notifications', 'Alerts', 'Email', 'SMS', 'Push Notifications'],
    specialty: 'Notifications & messaging',
    icon: '📢',
    priority: 3
  },

  // === SPECIALIZED AGENTS ===
  {
    id: 'thesys-ang',
    name: 'Thesys_Ang',
    label: 'Project Architect',
    role: 'maker',
    repo_source: 'c1-thesys',
    repo_url: 'https://github.com/c1-thesys/c1-thesys',
    description: 'Deliverables architect. Manages client build-outs and implementation plans.',
    status: 'active',
    capabilities: ['Project Planning', 'Documentation', 'Deliverables', 'Architecture Design'],
    specialty: 'Project architecture & deliverables',
    icon: '📐',
    priority: 4
  },
  {
    id: 'weaver-ang',
    name: 'Weaver_Ang',
    label: 'Workflow Master',
    role: 'orchestrator',
    repo_source: 'ii-workflow',
    repo_url: 'https://github.com/anthropics/ii-workflow',
    description: 'Workflow automation agent. Creates and manages automated pipelines.',
    status: 'active',
    capabilities: ['Workflow Design', 'Automation', 'Pipeline Management', 'Scheduling'],
    specialty: 'Workflow automation & pipelines',
    icon: '🕸️',
    priority: 4
  },
  {
    id: 'curator-ang',
    name: 'Curator_Ang',
    label: 'Data Organizer',
    role: 'analyst',
    repo_source: 'ii-curator',
    repo_url: 'https://github.com/anthropics/ii-curator',
    description: 'Data curation and cleanup agent. Organizes and maintains data quality.',
    status: 'active',
    capabilities: ['Data Cleanup', 'Organization', 'Quality Control', 'Deduplication'],
    specialty: 'Data curation & quality',
    icon: '📚',
    priority: 3
  },
  {
    id: 'spark-ang',
    name: 'Spark_Ang',
    label: 'Quick Action',
    role: 'maker',
    repo_source: 'ii-quick',
    repo_url: 'https://github.com/anthropics/ii-quick',
    description: 'Quick actions and triggers agent. Handles fast, simple operations.',
    status: 'active',
    capabilities: ['Quick Actions', 'Triggers', 'Shortcuts', 'Automation'],
    specialty: 'Fast actions & triggers',
    icon: '✨',
    priority: 2
  }
];

// Get agent by ID
export function getAgentById(id: string): BoomerAng | undefined {
  return AGENT_REGISTRY.find(agent => agent.id === id);
}

// Get agents by role
export function getAgentsByRole(role: BoomerAng['role']): BoomerAng[] {
  return AGENT_REGISTRY.filter(agent => agent.role === role);
}

// Get active agents
export function getActiveAgents(): BoomerAng[] {
  return AGENT_REGISTRY.filter(agent => agent.status === 'active');
}

// Get agents by priority (returns sorted by priority, highest first)
export function getAgentsByPriority(): BoomerAng[] {
  return [...AGENT_REGISTRY].sort((a, b) => b.priority - a.priority);
}

// Find best agent for a capability
export function findAgentForCapability(capability: string): BoomerAng | undefined {
  return AGENT_REGISTRY.find(agent => 
    agent.status === 'active' && 
    agent.capabilities.some(cap => 
      cap.toLowerCase().includes(capability.toLowerCase())
    )
  );
}
