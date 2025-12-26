/**
 * GitHub Repo Driver Registry
 * 
 * Maps external GitHub repositories to agent capabilities.
 * Each driver provides a bridge between the repo's functionality and the agent system.
 * 
 * User's repos to wire:
 * - ii-agent, ii-researcher, codex, codex-as-mcp, Common_Chronicle, CommonGround,
 * - gemini-cli, litellm-debugger, PPTist, reveal.js, ghost-gcp-storage-adapter,
 * - ii-thought, ii_verl, CoT-Lab-Demo, Symbioism-Nextra, Symbioism-TLE,
 * - II-Commons, ii-agent-community, gemini-cli-mcp-openai-bridge
 */

export type DriverStatus = 'connected' | 'pending' | 'error' | 'offline';
export type DriverCategory = 'core' | 'research' | 'code' | 'content' | 'infrastructure' | 'visualization' | 'community';

export interface RepoDriver {
  id: string;
  name: string;
  repo: string;
  owner: string;
  description: string;
  category: DriverCategory;
  status: DriverStatus;
  linked_agent_ids: string[]; // Which agents use this driver
  capabilities: string[];
  entry_point: string; // Main file or API endpoint
  config: DriverConfig;
  metrics: DriverMetrics;
}

export interface DriverConfig {
  requires_auth: boolean;
  auth_type?: 'token' | 'oauth' | 'api_key' | 'none';
  environment_vars?: string[];
  dependencies?: string[];
  runtime?: 'node' | 'python' | 'deno' | 'bun';
}

export interface DriverMetrics {
  calls_today: number;
  avg_latency_ms: number;
  error_rate: number;
  last_successful_call?: string;
}

/**
 * Master Driver Registry
 * Maps all external GitHub repos as agent drivers
 */
export const REPO_DRIVER_REGISTRY: RepoDriver[] = [
  // === CORE INTELLIGENCE ===
  {
    id: 'driver-ii-agent',
    name: 'II-Agent Core',
    repo: 'ii-agent',
    owner: 'anthropics',
    description: 'Advanced AI agent framework. Powers ACHEEVY core intelligence.',
    category: 'core',
    status: 'connected',
    linked_agent_ids: ['acheevy-core', 'weaver-ang'],
    capabilities: ['Task Orchestration', 'Multi-Step Reasoning', 'Tool Use', 'Context Management'],
    entry_point: 'src/agent/index.ts',
    config: {
      requires_auth: true,
      auth_type: 'api_key',
      environment_vars: ['ANTHROPIC_API_KEY'],
      runtime: 'python',
    },
    metrics: { calls_today: 0, avg_latency_ms: 0, error_rate: 0 }
  },
  {
    id: 'driver-ii-researcher',
    name: 'II-Researcher',
    repo: 'ii-researcher',
    owner: 'anthropics',
    description: 'Deep research agent for web search, fact-checking, and report generation.',
    category: 'research',
    status: 'connected',
    linked_agent_ids: ['finder-ang'],
    capabilities: ['Web Search', 'Source Validation', 'Report Generation', 'Fact Checking'],
    entry_point: 'src/researcher/main.py',
    config: {
      requires_auth: true,
      auth_type: 'api_key',
      environment_vars: ['SERPER_API_KEY', 'ANTHROPIC_API_KEY'],
      runtime: 'python',
    },
    metrics: { calls_today: 0, avg_latency_ms: 0, error_rate: 0 }
  },

  // === CODE & EXECUTION ===
  {
    id: 'driver-codex',
    name: 'OpenAI Codex',
    repo: 'codex',
    owner: 'openai',
    description: 'OpenAI Codex CLI for code generation and execution.',
    category: 'code',
    status: 'connected',
    linked_agent_ids: ['codex-ang', 'trae-ang'],
    capabilities: ['Code Generation', 'Code Execution', 'Refactoring', 'Debugging'],
    entry_point: 'codex.py',
    config: {
      requires_auth: true,
      auth_type: 'api_key',
      environment_vars: ['OPENAI_API_KEY'],
      runtime: 'python',
    },
    metrics: { calls_today: 0, avg_latency_ms: 0, error_rate: 0 }
  },
  {
    id: 'driver-codex-mcp',
    name: 'Codex as MCP',
    repo: 'codex-as-mcp',
    owner: 'anthropics',
    description: 'Codex wrapped as Model Context Protocol server.',
    category: 'code',
    status: 'connected',
    linked_agent_ids: ['codex-ang', 'nexus-ang'],
    capabilities: ['MCP Integration', 'Code Tools', 'File Operations'],
    entry_point: 'src/server.ts',
    config: {
      requires_auth: true,
      auth_type: 'token',
      environment_vars: ['MCP_TOKEN'],
      runtime: 'node',
    },
    metrics: { calls_today: 0, avg_latency_ms: 0, error_rate: 0 }
  },
  {
    id: 'driver-gemini-cli',
    name: 'Gemini CLI',
    repo: 'gemini-cli',
    owner: 'google-gemini',
    description: 'Google Gemini CLI for AI interactions.',
    category: 'core',
    status: 'connected',
    linked_agent_ids: ['acheevy-core', 'oracle-ang'],
    capabilities: ['Gemini API', 'Multi-Modal', 'Long Context'],
    entry_point: 'gemini-cli.js',
    config: {
      requires_auth: true,
      auth_type: 'api_key',
      environment_vars: ['GOOGLE_AI_API_KEY'],
      runtime: 'node',
    },
    metrics: { calls_today: 0, avg_latency_ms: 0, error_rate: 0 }
  },
  {
    id: 'driver-gemini-mcp-bridge',
    name: 'Gemini MCP OpenAI Bridge',
    repo: 'gemini-cli-mcp-openai-bridge',
    owner: 'anthropics',
    description: 'Bridges Gemini CLI with MCP and OpenAI protocols.',
    category: 'infrastructure',
    status: 'pending',
    linked_agent_ids: ['nexus-ang', 'bridge-ang'],
    capabilities: ['Protocol Translation', 'API Bridging', 'Multi-Provider'],
    entry_point: 'src/bridge.ts',
    config: {
      requires_auth: true,
      auth_type: 'api_key',
      environment_vars: ['GOOGLE_AI_API_KEY', 'OPENAI_API_KEY'],
      runtime: 'node',
    },
    metrics: { calls_today: 0, avg_latency_ms: 0, error_rate: 0 }
  },

  // === DEBUGGING & MONITORING ===
  {
    id: 'driver-litellm',
    name: 'LiteLLM Debugger',
    repo: 'litellm',
    owner: 'BerriAI',
    description: 'LLM call proxy, logging, and debugging.',
    category: 'infrastructure',
    status: 'connected',
    linked_agent_ids: ['debugger-ang'],
    capabilities: ['LLM Logging', 'Cost Tracking', 'Error Tracing', 'Multi-Provider'],
    entry_point: 'litellm/main.py',
    config: {
      requires_auth: true,
      auth_type: 'api_key',
      environment_vars: ['LITELLM_MASTER_KEY'],
      runtime: 'python',
    },
    metrics: { calls_today: 0, avg_latency_ms: 0, error_rate: 0 }
  },

  // === VISUALIZATION & PRESENTATIONS ===
  {
    id: 'driver-pptist',
    name: 'PPTist',
    repo: 'PPTist',
    owner: 'pptist',
    description: 'Web-based presentation editor. Creates slides and decks.',
    category: 'visualization',
    status: 'connected',
    linked_agent_ids: ['viz-ang'],
    capabilities: ['Slide Generation', 'Export PPT', 'Charts', 'Animations'],
    entry_point: 'src/main.ts',
    config: {
      requires_auth: false,
      auth_type: 'none',
      runtime: 'node',
    },
    metrics: { calls_today: 0, avg_latency_ms: 0, error_rate: 0 }
  },
  {
    id: 'driver-reveal',
    name: 'Reveal.js',
    repo: 'reveal.js',
    owner: 'hakimel',
    description: 'HTML presentation framework. Rich slide capabilities.',
    category: 'visualization',
    status: 'connected',
    linked_agent_ids: ['viz-ang', 'forge-ang'],
    capabilities: ['HTML Slides', 'Code Highlighting', 'Markdown Support'],
    entry_point: 'dist/reveal.esm.js',
    config: {
      requires_auth: false,
      auth_type: 'none',
      runtime: 'node',
    },
    metrics: { calls_today: 0, avg_latency_ms: 0, error_rate: 0 }
  },

  // === KNOWLEDGE & MEMORY ===
  {
    id: 'driver-chronicle',
    name: 'Common Chronicle',
    repo: 'Common_Chronicle',
    owner: 'achievemor',
    description: 'Knowledge graph and context memory system.',
    category: 'core',
    status: 'connected',
    linked_agent_ids: ['chronicle-ang', 'curator-ang'],
    capabilities: ['Context Storage', 'Memory Retrieval', 'Knowledge Graph', 'State Persistence'],
    entry_point: 'src/chronicle.ts',
    config: {
      requires_auth: false,
      auth_type: 'none',
      runtime: 'node',
    },
    metrics: { calls_today: 0, avg_latency_ms: 0, error_rate: 0 }
  },
  {
    id: 'driver-commonground',
    name: 'CommonGround',
    repo: 'CommonGround',
    owner: 'achievemor',
    description: 'Shared context and collaboration framework.',
    category: 'community',
    status: 'connected',
    linked_agent_ids: ['bridge-ang', 'herald-ang'],
    capabilities: ['Shared Context', 'Collaboration', 'Multi-User Sessions'],
    entry_point: 'src/index.ts',
    config: {
      requires_auth: true,
      auth_type: 'token',
      runtime: 'node',
    },
    metrics: { calls_today: 0, avg_latency_ms: 0, error_rate: 0 }
  },

  // === INFRASTRUCTURE ===
  {
    id: 'driver-ghost-storage',
    name: 'Ghost GCP Storage',
    repo: 'ghost-gcp-storage-adapter',
    owner: 'achievemor',
    description: 'Google Cloud Storage adapter for Ghost CMS.',
    category: 'infrastructure',
    status: 'connected',
    linked_agent_ids: ['guardian-ang'],
    capabilities: ['File Storage', 'GCP Integration', 'Media Management'],
    entry_point: 'index.js',
    config: {
      requires_auth: true,
      auth_type: 'oauth',
      environment_vars: ['GOOGLE_APPLICATION_CREDENTIALS'],
      runtime: 'node',
    },
    metrics: { calls_today: 0, avg_latency_ms: 0, error_rate: 0 }
  },

  // === RESEARCH & THINKING ===
  {
    id: 'driver-ii-thought',
    name: 'II-Thought',
    repo: 'ii-thought',
    owner: 'achievemor',
    description: 'Chain of thought reasoning engine.',
    category: 'research',
    status: 'connected',
    linked_agent_ids: ['oracle-ang', 'finder-ang'],
    capabilities: ['Chain of Thought', 'Reasoning', 'Problem Decomposition'],
    entry_point: 'src/thought.ts',
    config: {
      requires_auth: false,
      auth_type: 'none',
      runtime: 'node',
    },
    metrics: { calls_today: 0, avg_latency_ms: 0, error_rate: 0 }
  },
  {
    id: 'driver-ii-verl',
    name: 'II-VERL',
    repo: 'ii_verl',
    owner: 'achievemor',
    description: 'Verification and validation reasoning layer.',
    category: 'research',
    status: 'pending',
    linked_agent_ids: ['sentinel-ang'],
    capabilities: ['Verification', 'Validation', 'Fact Checking'],
    entry_point: 'src/verl.py',
    config: {
      requires_auth: false,
      auth_type: 'none',
      runtime: 'python',
    },
    metrics: { calls_today: 0, avg_latency_ms: 0, error_rate: 0 }
  },
  {
    id: 'driver-cot-lab',
    name: 'CoT Lab Demo',
    repo: 'CoT-Lab-Demo',
    owner: 'achievemor',
    description: 'Chain of Thought laboratory for reasoning experiments.',
    category: 'research',
    status: 'pending',
    linked_agent_ids: ['oracle-ang'],
    capabilities: ['Reasoning Lab', 'Experiments', 'CoT Testing'],
    entry_point: 'demo/main.py',
    config: {
      requires_auth: false,
      auth_type: 'none',
      runtime: 'python',
    },
    metrics: { calls_today: 0, avg_latency_ms: 0, error_rate: 0 }
  },

  // === DOCUMENTATION & CONTENT ===
  {
    id: 'driver-symbioism-nextra',
    name: 'Symbioism Nextra',
    repo: 'Symbioism-Nextra',
    owner: 'achievemor',
    description: 'Nextra-based documentation site generator.',
    category: 'content',
    status: 'connected',
    linked_agent_ids: ['forge-ang'],
    capabilities: ['Documentation', 'MDX Support', 'Static Site'],
    entry_point: 'pages/_app.tsx',
    config: {
      requires_auth: false,
      auth_type: 'none',
      runtime: 'node',
    },
    metrics: { calls_today: 0, avg_latency_ms: 0, error_rate: 0 }
  },
  {
    id: 'driver-symbioism-tle',
    name: 'Symbioism TLE',
    repo: 'Symbioism-TLE',
    owner: 'achievemor',
    description: 'Template and layout engine for content.',
    category: 'content',
    status: 'pending',
    linked_agent_ids: ['forge-ang', 'viz-ang'],
    capabilities: ['Templates', 'Layouts', 'Theme Engine'],
    entry_point: 'src/engine.ts',
    config: {
      requires_auth: false,
      auth_type: 'none',
      runtime: 'node',
    },
    metrics: { calls_today: 0, avg_latency_ms: 0, error_rate: 0 }
  },

  // === COMMUNITY & COLLABORATION ===
  {
    id: 'driver-ii-commons',
    name: 'II-Commons',
    repo: 'II-Commons',
    owner: 'achievemor',
    description: 'Shared utilities and common components.',
    category: 'community',
    status: 'connected',
    linked_agent_ids: ['spark-ang'],
    capabilities: ['Shared Utils', 'Common Components', 'Type Definitions'],
    entry_point: 'src/index.ts',
    config: {
      requires_auth: false,
      auth_type: 'none',
      runtime: 'node',
    },
    metrics: { calls_today: 0, avg_latency_ms: 0, error_rate: 0 }
  },
  {
    id: 'driver-ii-agent-community',
    name: 'II-Agent Community',
    repo: 'ii-agent-community',
    owner: 'achievemor',
    description: 'Community extensions and plugins for II-Agent.',
    category: 'community',
    status: 'connected',
    linked_agent_ids: ['acheevy-core', 'weaver-ang'],
    capabilities: ['Plugins', 'Extensions', 'Community Tools'],
    entry_point: 'src/community.ts',
    config: {
      requires_auth: false,
      auth_type: 'none',
      runtime: 'node',
    },
    metrics: { calls_today: 0, avg_latency_ms: 0, error_rate: 0 }
  },
];

/**
 * Get driver by ID
 */
export function getDriverById(id: string): RepoDriver | undefined {
  return REPO_DRIVER_REGISTRY.find(d => d.id === id);
}

/**
 * Get drivers by category
 */
export function getDriversByCategory(category: DriverCategory): RepoDriver[] {
  return REPO_DRIVER_REGISTRY.filter(d => d.category === category);
}

/**
 * Get all drivers linked to a specific agent
 */
export function getDriversForAgent(agentId: string): RepoDriver[] {
  return REPO_DRIVER_REGISTRY.filter(d => d.linked_agent_ids.includes(agentId));
}

/**
 * Get connected drivers only
 */
export function getConnectedDrivers(): RepoDriver[] {
  return REPO_DRIVER_REGISTRY.filter(d => d.status === 'connected');
}

/**
 * Get driver status summary
 */
export function getDriverStatusSummary(): { connected: number; pending: number; error: number; offline: number } {
  return {
    connected: REPO_DRIVER_REGISTRY.filter(d => d.status === 'connected').length,
    pending: REPO_DRIVER_REGISTRY.filter(d => d.status === 'pending').length,
    error: REPO_DRIVER_REGISTRY.filter(d => d.status === 'error').length,
    offline: REPO_DRIVER_REGISTRY.filter(d => d.status === 'offline').length,
  };
}

/**
 * Update driver metrics (called after each invocation)
 */
export function updateDriverMetrics(
  driverId: string, 
  latencyMs: number, 
  success: boolean
): void {
  const driver = REPO_DRIVER_REGISTRY.find(d => d.id === driverId);
  if (!driver) return;
  
  driver.metrics.calls_today++;
  driver.metrics.avg_latency_ms = Math.round(
    (driver.metrics.avg_latency_ms + latencyMs) / 2
  );
  if (!success) {
    driver.metrics.error_rate = Math.min(
      1, 
      (driver.metrics.error_rate * driver.metrics.calls_today + 1) / (driver.metrics.calls_today + 1)
    );
  }
  if (success) {
    driver.metrics.last_successful_call = new Date().toISOString();
  }
}

/**
 * Build GitHub URL for a driver
 */
export function getDriverRepoUrl(driver: RepoDriver): string {
  return `https://github.com/${driver.owner}/${driver.repo}`;
}

export default {
  REPO_DRIVER_REGISTRY,
  getDriverById,
  getDriversByCategory,
  getDriversForAgent,
  getConnectedDrivers,
  getDriverStatusSummary,
  updateDriverMetrics,
  getDriverRepoUrl,
};
