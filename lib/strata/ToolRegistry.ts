/**
 * STRATA Tool Registry
 * 
 * Governs what tools exist, how they execute, and what proof is required.
 * The "source of truth" for tool discovery and schemas.
 */

// === TYPES ===

export interface STRATATool {
  id: string;
  name: string;
  description: string;
  category: ToolCategory;
  implementations: ToolImplementation[];
  default_implementation: string;
  schema: ToolSchema;
  requires_auth: boolean;
  audit_required: boolean;
  // proof_artifacts property removed/optional as it's handled differently now
  enabled: boolean;
}

export type ToolCategory = 
  | 'ai_generation'
  | 'voice'
  | 'video'
  | 'data_processing'
  | 'integration'
  | 'security'
  | 'analytics';

export interface ToolSchema {
  input: SchemaField[];
  output: SchemaField[];
}

export interface SchemaField {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'array' | 'object' | 'file';
  required: boolean;
  description: string;
  validation?: string; // Regex or validation rule
}

export interface ProofRequirement {
  type: 'screenshot' | 'log' | 'test_result' | 'audit_trail' | 'user_confirmation';
  description: string;
  required: boolean;
}

export interface RateLimit {
  requests_per_minute: number;
  requests_per_hour: number;
  requests_per_day: number;
}

export interface ToolExecutionResult {
  tool_id: string;
  success: boolean;
  output: any;
  execution_time_ms: number;
  tokens_used?: number;
  proof_artifacts: GeneratedProof[];
  trace_id: string;
  timestamp: string;
}

export interface GeneratedProof {
  type: ProofRequirement['type'];
  content: string;
  generated_at: string;
}

// === TOOL REGISTRY ===

// === CAPABILITY REGISTRY ===

export interface STRATACapability {
  id: string; // e.g. "speech_to_text"
  name: string;
  description: string;
  category: ToolCategory;
  implementations: ToolImplementation[];
  default_implementation: string;
  schema: ToolSchema;
  requires_auth: boolean;
  audit_required: boolean;
  enabled: boolean;
}

export interface ToolImplementation {
  id: string; // e.g. "groq_whisper"
  provider: string; // "Groq"
  cost_model: string; // "per_second"
  cost: number;
  rate_limits?: RateLimit;
}

const CAPABILITY_REGISTRY: STRATACapability[] = [
  // === SPEECH INFERENCE ===
  {
    id: 'speech_to_text',
    name: 'Speech Inference',
    description: 'Convert audio to text',
    category: 'voice',
    implementations: [
      { id: 'groq_whisper', provider: 'Groq', cost_model: 'per_minute', cost: 0.003 },
      { id: 'deepgram_nova', provider: 'Deepgram', cost_model: 'per_minute', cost: 0.015 },
    ],
    default_implementation: 'groq_whisper',
    schema: {
      input: [{ name: 'audio', type: 'file', required: true, description: 'Audio stream/file' }],
      output: [{ name: 'text', type: 'string', required: true, description: 'Transcript' }]
    },
    requires_auth: true,
    audit_required: false,
    enabled: true,
  },

  // === RESEARCH ===
  {
    id: 'research',
    name: 'Research & Search',
    description: 'Web search and synthesis',
    category: 'integration',
    implementations: [
      { id: 'perplexity_sonar', provider: 'Perplexity', cost_model: 'per_request', cost: 0.05 },
      { id: 'tavily_search', provider: 'Tavily', cost_model: 'per_request', cost: 0.01 },
    ],
    default_implementation: 'perplexity_sonar',
    schema: {
      input: [{ name: 'query', type: 'string', required: true, description: 'Research query' }],
      output: [{ name: 'citations', type: 'array', required: true, description: 'Source links' }]
    },
    requires_auth: true,
    audit_required: true,
    enabled: true,
  },

  // === MODEL ROUTING (Not strictly a tool, but a capability) ===
  {
    id: 'llm_inference',
    name: 'LLM Inference',
    description: 'Text generation and routing',
    category: 'ai_generation',
    implementations: [
      { id: 'openrouter_routing', provider: 'OpenRouter', cost_model: 'token', cost: 0 },
      { id: 'anthropic_direct', provider: 'Anthropic', cost_model: 'token', cost: 0 },
    ],
    default_implementation: 'openrouter_routing',
    schema: {
      input: [{ name: 'prompt', type: 'string', required: true, description: 'System + User prompt' }],
      output: [{ name: 'content', type: 'string', required: true, description: 'Response' }]
    },
    requires_auth: true,
    audit_required: true,
    enabled: true,
  },

  // === VIDEO GENERATION ===
  {
    id: 'video_generation',
    name: 'Video Forge',
    description: 'AI Video creation',
    category: 'video',
    implementations: [
      { id: 'vertex_imagen', provider: 'Google Cloud', cost_model: 'per_second', cost: 0.10 },
      { id: 'runway_gen2', provider: 'Runway', cost_model: 'per_second', cost: 0.20 },
      { id: 'kie_ai', provider: 'Kie.ai', cost_model: 'generation', cost: 0.15 },
    ],
    default_implementation: 'vertex_imagen',
    schema: {
      input: [{ name: 'prompt', type: 'string', required: true, description: 'Video prompt' }],
      output: [{ name: 'video_url', type: 'string', required: true, description: 'Result URL' }]
    },
    requires_auth: true,
    audit_required: true,
    enabled: true,
  },
];

// Re-export for compatibility with existing code (aliasing)
export const STRATA_TOOLS = CAPABILITY_REGISTRY;

// === REGISTRY ACCESS ===

export function getToolById(id: string): STRATATool | undefined {
  return STRATA_TOOLS.find(t => t.id === id);
}

export function getToolsByCategory(category: ToolCategory): STRATATool[] {
  return STRATA_TOOLS.filter(t => t.category === category && t.enabled);
}

export function getAllEnabledTools(): STRATATool[] {
  return STRATA_TOOLS.filter(t => t.enabled);
}

// === TOOL GATE (Execution Governance) ===

export interface ToolGateContext {
  user_id: string;
  tenant_id: string;
  permissions: string[];
  session_id: string;
}

export interface ToolGateResult {
  allowed: boolean;
  reason?: string;
  tool: STRATATool;
  context: ToolGateContext;
  validated_at: string;
}

export async function validateToolExecution(
  toolId: string,
  input: Record<string, any>,
  context: ToolGateContext
): Promise<ToolGateResult> {
  const tool = getToolById(toolId);
  
  if (!tool) {
    return {
      allowed: false,
      reason: `Tool ${toolId} not found in registry`,
      tool: {} as STRATATool,
      context,
      validated_at: new Date().toISOString(),
    };
  }

  if (!tool.enabled) {
    return {
      allowed: false,
      reason: `Tool ${tool.name} is currently disabled`,
      tool,
      context,
      validated_at: new Date().toISOString(),
    };
  }

  // Validate required inputs
  const missingFields = tool.schema.input
    .filter(f => f.required && !(f.name in input))
    .map(f => f.name);

  if (missingFields.length > 0) {
    return {
      allowed: false,
      reason: `Missing required fields: ${missingFields.join(', ')}`,
      tool,
      context,
      validated_at: new Date().toISOString(),
    };
  }

  // Check auth requirement
  if (tool.requires_auth && !context.user_id) {
    return {
      allowed: false,
      reason: 'Authentication required',
      tool,
      context,
      validated_at: new Date().toISOString(),
    };
  }

  // All checks passed
  return {
    allowed: true,
    tool,
    context,
    validated_at: new Date().toISOString(),
  };
}

// === AUDIT LOGGING ===

const AUDIT_LOG_KEY = 'strata_audit_log';

export interface AuditEntry {
  id: string;
  tool_id: string;
  tool_name: string;
  user_id: string;
  tenant_id: string;
  input_summary: string;
  output_summary: string;
  success: boolean;
  tokens_used: number;
  cost: number;
  execution_time_ms: number;
  timestamp: string;
}

export function logToolExecution(entry: Omit<AuditEntry, 'id' | 'timestamp'>): void {
  const log = JSON.parse(localStorage.getItem(AUDIT_LOG_KEY) || '[]');
  log.push({
    ...entry,
    id: `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    timestamp: new Date().toISOString(),
  });
  localStorage.setItem(AUDIT_LOG_KEY, JSON.stringify(log.slice(-1000))); // Keep last 1000
}

export function getAuditLog(limit: number = 100): AuditEntry[] {
  const log = JSON.parse(localStorage.getItem(AUDIT_LOG_KEY) || '[]');
  return log.slice(-limit);
}

export function getToolUsageStats(toolId: string): { calls: number; tokens: number; cost: number } {
  const log = getAuditLog(1000);
  const toolLogs = log.filter(e => e.tool_id === toolId);
  return {
    calls: toolLogs.length,
    tokens: toolLogs.reduce((sum, e) => sum + e.tokens_used, 0),
    cost: toolLogs.reduce((sum, e) => sum + e.cost, 0),
  };
}
