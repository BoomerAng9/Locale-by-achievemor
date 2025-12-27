/**
 * EXPECTATION ENGINE
 * 
 * The "Contract of Engagement" between Human and AI.
 * Generates a Real-Time Negotiated SOW (Statement of Work) dynamically.
 * 
 * Core Flow:
 * 1. Analyze the Request (DMAIC/DMADV)
 * 2. Calculate Human Cost (time user must invest)
 * 3. Calculate Token Cost (credits required)
 * 4. Present the Contract (voice + text)
 */

import { getKingModePrompt } from '../kingmode/KingModePrompts';

// === TYPES ===

export interface ProjectScope {
  id: string;
  title: string;
  summary: string;
  user_obligations: Obligation[];
  estimated_human_time: string;
  estimated_human_hours: number;
  estimated_token_cost: number;
  estimated_dollar_cost: number;
  deliverables: Deliverable[];
  tier_recommendation: TierRecommendation;
  warnings: string[];
  created_at: string;
}

export interface Obligation {
  id: string;
  task: string;
  description: string;
  estimated_time: string;
  required: boolean;
  completed: boolean;
}

export interface Deliverable {
  id: string;
  name: string;
  description: string;
  type: 'portal' | 'video' | 'document' | 'automation' | 'integration' | 'other';
}

export interface TierRecommendation {
  current_tier: string;
  current_balance: number;
  required_tokens: number;
  sufficient: boolean;
  upgrade_suggestion?: string;
}

export interface ScopeAnalysis {
  tasks: TaskBreakdown[];
  complexity: 'simple' | 'moderate' | 'complex' | 'enterprise';
  risk_factors: string[];
}

export interface TaskBreakdown {
  name: string;
  category: 'data' | 'content' | 'integration' | 'design' | 'automation';
  human_input_required: boolean;
  estimated_tokens: number;
  dependencies: string[];
}

// === TOKEN COST ESTIMATION ===

const TOKEN_COSTS = {
  // Per-operation token estimates
  text_generation: 500,
  image_analysis: 1000,
  voice_clone: 5000,
  video_generation: 10000,
  document_processing: 2000,
  api_integration: 1500,
  data_processing_per_row: 10,
  personalization_per_item: 50,
};

const DOLLAR_PER_TOKEN = 0.005; // $0.005 per token = $5 per 1000 tokens

// === HUMAN TIME ESTIMATION ===

const TIME_ESTIMATES = {
  upload_csv: '10 minutes',
  upload_document: '5 minutes',
  record_voice_sample: '15 minutes',
  dictate_notes_per_item: '2 minutes',
  review_output: '30 minutes',
  provide_feedback: '15 minutes',
};

// === DMAIC ANALYSIS ===

export async function analyzeRequest(prompt: string): Promise<ScopeAnalysis> {
  // Parse the prompt for key indicators
  const indicators = {
    hasClone: /clone|copy|replicate/i.test(prompt),
    hasVideo: /video|record|stream/i.test(prompt),
    hasVoice: /voice|speak|audio/i.test(prompt),
    hasPersonalization: /personali[sz]e|individual|custom/i.test(prompt),
    hasAutomation: /automat|schedule|daily|repeat/i.test(prompt),
    hasData: /data|csv|spreadsheet|list|roster/i.test(prompt),
    hasIntegration: /integrat|connect|sync|api/i.test(prompt),
    quantity: extractQuantity(prompt),
  };

  const tasks: TaskBreakdown[] = [];
  
  // Build task list based on indicators
  if (indicators.hasVoice || indicators.hasClone) {
    tasks.push({
      name: 'Voice Sample Collection',
      category: 'content',
      human_input_required: true,
      estimated_tokens: TOKEN_COSTS.voice_clone,
      dependencies: [],
    });
  }

  if (indicators.hasData) {
    tasks.push({
      name: 'Data Upload & Processing',
      category: 'data',
      human_input_required: true,
      estimated_tokens: TOKEN_COSTS.document_processing + (indicators.quantity * TOKEN_COSTS.data_processing_per_row),
      dependencies: [],
    });
  }

  if (indicators.hasVideo) {
    const videoCount = indicators.quantity || 1;
    tasks.push({
      name: `Video Generation (${videoCount} videos)`,
      category: 'content',
      human_input_required: false,
      estimated_tokens: TOKEN_COSTS.video_generation * videoCount,
      dependencies: ['Voice Sample Collection'],
    });
  }

  if (indicators.hasPersonalization) {
    tasks.push({
      name: `Personalization Engine (${indicators.quantity} items)`,
      category: 'automation',
      human_input_required: true,
      estimated_tokens: TOKEN_COSTS.personalization_per_item * indicators.quantity,
      dependencies: ['Data Upload & Processing'],
    });
  }

  if (indicators.hasAutomation) {
    tasks.push({
      name: 'Automation Workflow Setup',
      category: 'automation',
      human_input_required: false,
      estimated_tokens: TOKEN_COSTS.api_integration,
      dependencies: [],
    });
  }

  if (indicators.hasIntegration) {
    tasks.push({
      name: 'External Integration',
      category: 'integration',
      human_input_required: true,
      estimated_tokens: TOKEN_COSTS.api_integration,
      dependencies: [],
    });
  }

  // Determine complexity
  let complexity: ScopeAnalysis['complexity'] = 'simple';
  if (tasks.length > 5 || indicators.quantity > 100) complexity = 'enterprise';
  else if (tasks.length > 3 || indicators.quantity > 50) complexity = 'complex';
  else if (tasks.length > 1 || indicators.quantity > 10) complexity = 'moderate';

  // Identify risks
  const risk_factors: string[] = [];
  if (indicators.quantity > 100) risk_factors.push('High volume may require extended processing time');
  if (indicators.hasVideo && indicators.hasPersonalization) risk_factors.push('Personalized video at scale requires significant resources');
  if (tasks.filter(t => t.human_input_required).length > 3) risk_factors.push('Multiple human touchpoints increase project timeline');

  return { tasks, complexity, risk_factors };
}

// === SCOPE GENERATION ===

export async function generateProjectScope(
  prompt: string,
  userId: string = 'demo',
  userTier: string = 'free',
  userBalance: number = 1000
): Promise<ProjectScope> {
  const analysis = await analyzeRequest(prompt);
  
  // Calculate totals
  const totalTokens = analysis.tasks.reduce((sum, t) => sum + t.estimated_tokens, 0);
  const humanTasks = analysis.tasks.filter(t => t.human_input_required);
  const humanHours = humanTasks.length * 0.5; // Rough estimate: 30 mins per human task
  
  // Build obligations
  const obligations: Obligation[] = humanTasks.map((task, i) => ({
    id: `ob_${i}`,
    task: task.name,
    description: getObligationDescription(task),
    estimated_time: getEstimatedTime(task),
    required: true,
    completed: false,
  }));

  // Build deliverables
  const deliverables: Deliverable[] = analysis.tasks.map((task, i) => ({
    id: `del_${i}`,
    name: task.name,
    description: `Automated ${task.category} solution`,
    type: mapCategoryToType(task.category),
  }));

  // Calculate costs
  const dollarCost = totalTokens * DOLLAR_PER_TOKEN;
  const sufficient = userBalance >= totalTokens;

  const scope: ProjectScope = {
    id: `scope_${Date.now()}`,
    title: generateTitle(prompt),
    summary: generateSummary(prompt, analysis),
    user_obligations: obligations,
    estimated_human_time: `${humanHours} hours`,
    estimated_human_hours: humanHours,
    estimated_token_cost: totalTokens,
    estimated_dollar_cost: dollarCost,
    deliverables,
    tier_recommendation: {
      current_tier: userTier,
      current_balance: userBalance,
      required_tokens: totalTokens,
      sufficient,
      upgrade_suggestion: sufficient ? undefined : 'Upgrade to Pro tier for unlimited tokens',
    },
    warnings: analysis.risk_factors,
    created_at: new Date().toISOString(),
  };

  // Save to local storage
  saveScopeToHistory(userId, scope);

  return scope;
}

// === VOICE SCRIPT GENERATION ===

export function generateVoiceScript(scope: ProjectScope): string {
  const { title, summary, user_obligations, estimated_human_time, estimated_dollar_cost, tier_recommendation } = scope;
  
  let script = `Here's my analysis of your request: ${title}. `;
  script += `${summary} `;
  
  if (user_obligations.length > 0) {
    script += `To make this happen, I'll need your help with ${user_obligations.length} things. `;
    script += user_obligations.map(o => o.task).join(', ') + '. ';
    script += `This will take approximately ${estimated_human_time} of your time. `;
  }
  
  script += `The estimated cost for this project is $${estimated_dollar_cost.toFixed(2)}. `;
  
  if (!tier_recommendation.sufficient) {
    script += `Note: You may need to top up your token balance or upgrade your plan. `;
  }
  
  script += `Are you ready to proceed?`;
  
  return script;
}

// === HELPER FUNCTIONS ===

function extractQuantity(prompt: string): number {
  const matches = prompt.match(/(\d+)\s*(students?|users?|items?|people|clients?|videos?)/i);
  return matches ? parseInt(matches[1]) : 1;
}

function generateTitle(prompt: string): string {
  const words = prompt.split(' ').slice(0, 5).join(' ');
  return words.length > 30 ? words.substring(0, 30) + '...' : words;
}

function generateSummary(prompt: string, analysis: ScopeAnalysis): string {
  return `This is a ${analysis.complexity} project involving ${analysis.tasks.length} main tasks. ` +
         `${analysis.tasks.filter(t => t.human_input_required).length} tasks require your direct input.`;
}

function getObligationDescription(task: TaskBreakdown): string {
  switch (task.category) {
    case 'content': return 'Provide source material for AI to learn from';
    case 'data': return 'Upload structured data file';
    case 'integration': return 'Provide API credentials or access';
    default: return 'Provide required input';
  }
}

function getEstimatedTime(task: TaskBreakdown): string {
  switch (task.category) {
    case 'content': return '30-60 minutes';
    case 'data': return '10-15 minutes';
    case 'integration': return '15-30 minutes';
    default: return '15-30 minutes';
  }
}

function mapCategoryToType(category: string): Deliverable['type'] {
  const map: Record<string, Deliverable['type']> = {
    content: 'video',
    data: 'document',
    automation: 'automation',
    integration: 'integration',
    design: 'portal',
  };
  return map[category] || 'other';
}

// === STORAGE ===

const SCOPE_HISTORY_KEY = 'expectation_engine_history';

function saveScopeToHistory(userId: string, scope: ProjectScope): void {
  const key = `${SCOPE_HISTORY_KEY}_${userId}`;
  const history = JSON.parse(localStorage.getItem(key) || '[]');
  history.push(scope);
  localStorage.setItem(key, JSON.stringify(history.slice(-10))); // Keep last 10
}

export function getScopeHistory(userId: string): ProjectScope[] {
  const key = `${SCOPE_HISTORY_KEY}_${userId}`;
  return JSON.parse(localStorage.getItem(key) || '[]');
}

// === ACCEPTANCE TRACKING ===

export interface ScopeAcceptance {
  scope_id: string;
  accepted: boolean;
  accepted_at?: string;
  declined_reason?: string;
}

export function acceptScope(scopeId: string): ScopeAcceptance {
  const acceptance: ScopeAcceptance = {
    scope_id: scopeId,
    accepted: true,
    accepted_at: new Date().toISOString(),
  };
  localStorage.setItem(`scope_acceptance_${scopeId}`, JSON.stringify(acceptance));
  return acceptance;
}

export function declineScope(scopeId: string, reason: string): ScopeAcceptance {
  const acceptance: ScopeAcceptance = {
    scope_id: scopeId,
    accepted: false,
    declined_reason: reason,
  };
  localStorage.setItem(`scope_acceptance_${scopeId}`, JSON.stringify(acceptance));
  return acceptance;
}
