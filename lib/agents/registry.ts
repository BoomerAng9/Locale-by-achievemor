/**
 * Agent Registry - "Boomer_Angs"
 * Defines the AI Agents available in the Nervous System
 */

export interface BoomerAng {
  id: string;
  name: string;
  role: 'orchestrator' | 'finder' | 'maker' | 'debugger' | 'visualizer';
  repo_source: string;
  description: string;
  status: 'active' | 'standby' | 'offline' | 'error';
  capabilities: string[];
  icon: string;
}

export const AGENT_REGISTRY: BoomerAng[] = [
  {
    id: 'acheevy-core',
    name: 'ACHEEVY',
    role: 'orchestrator',
    repo_source: 'ii-agent',
    description: 'Main Orchestrator powered by II-Agent framework. Delegates tasks to specialized Angs.',
    status: 'active',
    capabilities: ['Task Delegation', 'Context Management', 'User Intent Analysis'],
    icon: '🤖'
  },
  {
    id: 'finder-ang',
    name: 'Finder_Ang',
    role: 'finder',
    repo_source: 'ii-researcher',
    description: 'Deep research and information retrieval agent.',
    status: 'standby',
    capabilities: ['Web Search', 'Data Scrape', 'Fact Checking'],
    icon: '🔍'
  },
  {
    id: 'execution-ang',
    name: 'Execution_Ang',
    role: 'maker',
    repo_source: 'codex-as-mcp',
    description: 'Coding and execution agent running in terminal/container.',
    status: 'active',
    capabilities: ['Code Generation', 'Script Execution', 'File Manipulation'],
    icon: '⚡'
  },
  {
    id: 'debugger-ang',
    name: 'Debugger_Ang',
    role: 'debugger',
    repo_source: 'litellm-debugger',
    description: 'Monitors LLM calls and traces errors.',
    status: 'active',
    capabilities: ['Error Tracing', 'API Logging', 'Cost Analysis'],
    icon: '🐞'
  },
  {
    id: 'viz-ang',
    name: 'Presentation_Ang',
    role: 'visualizer',
    repo_source: 'PPTist',
    description: 'Generates visual presentations and slides.',
    status: 'offline',
    capabilities: ['Slide Generation', 'Chart Creation', 'Layout Design'],
    icon: '📊'
  },
  {
    id: 'trae-ang',
    name: 'Trae_Ang',
    role: 'maker',
    repo_source: 'trae-agent',
    description: 'Specialized coding agent. Generates React components and backend functions.',
    status: 'standby',
    capabilities: ['code_gen', 'refactoring', 'react', 'typescript'],
    icon: '👨‍💻'
  },
  {
    id: 'thesys-ang',
    name: 'Thesys_Ang', // C1 System
    role: 'maker',
    repo_source: 'c1-thesys',
    description: 'Deliverables Architect. Manages Client build-outs and implementation plans.',
    status: 'standby',
    capabilities: ['project_planning', 'doc_generation', 'deliverables', 'architecture'],
    icon: '📐'
  }
];
