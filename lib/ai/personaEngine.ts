/**
 * Dynamic Persona Engine
 * 
 * Creates context-specific AI personas based on user prompts using if-then logic.
 * Replaces hardcoded personas like "You are Robert K" with dynamic, action-based personas.
 * 
 * The persona gets created when the user prompts - it's action-based, not static.
 */

import { AGENT_REGISTRY, BoomerAng } from '../agents/registry';

export interface PersonaContext {
  industry: string;
  userIntent: string;
  specificNeed?: string;
  userType?: 'buyer' | 'seller' | 'investor' | 'operator' | 'advisor' | 'learner';
  taskType?: 'analysis' | 'creation' | 'research' | 'transaction' | 'consultation' | 'automation';
  urgency?: 'immediate' | 'scheduled' | 'exploratory';
  expertise?: 'beginner' | 'intermediate' | 'expert';
}

export interface DynamicPersona {
  name: string;
  role: string;
  specialty: string;
  tone: string;
  focus_areas: string[];
  system_prompt: string;
  assigned_agent: BoomerAng | null;
  context_modifiers: string[];
}

// Intent patterns for if-then classification
const INTENT_PATTERNS = {
  // Transaction Intents
  buy: /\b(buy|purchase|acquire|invest in|looking for|want to buy)\b/i,
  sell: /\b(sell|listing|market|dispose|flip|liquidate)\b/i,
  
  // Analysis Intents
  analyze: /\b(analyze|evaluate|assess|review|compare|check|calculate)\b/i,
  research: /\b(research|find|search|discover|learn about|understand)\b/i,
  
  // Creation Intents
  create: /\b(create|build|make|generate|design|develop|draft|write)\b/i,
  automate: /\b(automate|schedule|set up|configure|streamline)\b/i,
  
  // Consultation Intents
  advise: /\b(advise|recommend|suggest|help me|what should|how do I)\b/i,
  troubleshoot: /\b(troubleshoot|fix|solve|problem|issue|error|not working)\b/i,
  
  // Financial Intents
  financial: /\b(ROI|profit|cost|price|budget|estimate|tax|revenue|margin)\b/i,
  legal: /\b(contract|agreement|compliance|regulation|permit|license|liability)\b/i,
};

// User type detection
const USER_TYPE_PATTERNS = {
  buyer: /\b(I want to buy|looking to purchase|interested in buying|potential buyer)\b/i,
  seller: /\b(I'm selling|want to sell|list my|looking to sell|need to liquidate)\b/i,
  investor: /\b(invest|portfolio|return|yield|capital|funding|ROI)\b/i,
  operator: /\b(manage|run|operate|my business|my company|my team)\b/i,
  advisor: /\b(for my client|advising|consulting for|representing)\b/i,
  learner: /\b(learn|understand|explain|teach me|how does|what is)\b/i,
};

// Industry-specific persona archetypes (no hardcoded names!)
const INDUSTRY_ARCHETYPES: Record<string, {
  roles: string[];
  specialties: string[];
  tones: string[];
  focus_areas: string[];
}> = {
  real_estate: {
    roles: ['Real Estate Advisor', 'Investment Analyst', 'Property Consultant', 'Market Specialist'],
    specialties: ['ROI optimization', 'market analysis', 'tax strategies', 'deal structuring'],
    tones: ['strategic', 'analytical', 'opportunity-focused'],
    focus_areas: ['K-1 optimization', 'cap rates', 'zoning', 'comps', 'flip analysis', '70% rule'],
  },
  legal: {
    roles: ['Legal Analyst', 'Compliance Advisor', 'Contract Specialist', 'Risk Consultant'],
    specialties: ['contract review', 'compliance audit', 'risk mitigation', 'regulatory guidance'],
    tones: ['precise', 'thorough', 'cautious'],
    focus_areas: ['liability clauses', 'NDA terms', 'regulatory compliance', 'due diligence'],
  },
  construction: {
    roles: ['Project Estimator', 'Build Consultant', 'Trades Specialist', 'Permit Advisor'],
    specialties: ['cost estimation', 'material planning', 'permit navigation', 'project scheduling'],
    tones: ['practical', 'detailed', 'solutions-oriented'],
    focus_areas: ['material costs', 'labor hours', 'permit requirements', 'code compliance'],
  },
  healthcare: {
    roles: ['Health Admin Advisor', 'Patient Experience Specialist', 'Compliance Consultant', 'Operations Analyst'],
    specialties: ['HIPAA compliance', 'patient flow', 'scheduling optimization', 'documentation'],
    tones: ['empathetic', 'precise', 'patient-first'],
    focus_areas: ['intake forms', 'scheduling', 'compliance', 'patient experience'],
  },
  retail: {
    roles: ['E-Commerce Strategist', 'Inventory Analyst', 'Marketing Specialist', 'Customer Experience Advisor'],
    specialties: ['inventory turnover', 'ad ROAS', 'customer LTV', 'pricing strategy'],
    tones: ['data-driven', 'growth-focused', 'customer-centric'],
    focus_areas: ['conversion rates', 'cart abandonment', 'competitor pricing', 'ad performance'],
  },
  logistics: {
    roles: ['Fleet Analyst', 'Route Optimizer', 'Operations Specialist', 'Supply Chain Advisor'],
    specialties: ['route optimization', 'fuel efficiency', 'delivery scheduling', 'fleet maintenance'],
    tones: ['efficient', 'systematic', 'cost-conscious'],
    focus_areas: ['route planning', 'fuel costs', 'maintenance schedules', 'delivery windows'],
  },
  education: {
    roles: ['Curriculum Designer', 'Learning Specialist', 'Course Architect', 'Engagement Advisor'],
    specialties: ['learning outcomes', 'engagement strategies', 'assessment design', 'course structure'],
    tones: ['encouraging', 'structured', 'learner-focused'],
    focus_areas: ['lesson planning', 'quiz design', 'progress tracking', 'learning paths'],
  },
  media: {
    roles: ['Content Strategist', 'Showrunner', 'Audience Growth Specialist', 'Production Advisor'],
    specialties: ['content planning', 'audience growth', 'monetization', 'production quality'],
    tones: ['creative', 'engaging', 'audience-aware'],
    focus_areas: ['script structure', 'audio quality', 'sponsor matching', 'show notes'],
  },
  hospitality: {
    roles: ['Event Planner', 'Guest Experience Specialist', 'Venue Consultant', 'Operations Advisor'],
    specialties: ['guest experience', 'venue logistics', 'menu curation', 'event coordination'],
    tones: ['hospitable', 'detail-oriented', 'experience-focused'],
    focus_areas: ['venue selection', 'menu planning', 'guest management', 'timeline coordination'],
  },
  tech: {
    roles: ['Technical Architect', 'Code Advisor', 'Integration Specialist', 'Scalability Consultant'],
    specialties: ['code architecture', 'API integration', 'scalability', 'performance optimization'],
    tones: ['technical', 'precise', 'forward-thinking'],
    focus_areas: ['code quality', 'API design', 'system architecture', 'security'],
  },
};

/**
 * Detect user intent from prompt using if-then pattern matching
 */
function detectIntent(prompt: string): string[] {
  const intents: string[] = [];
  
  for (const [intent, pattern] of Object.entries(INTENT_PATTERNS)) {
    if (pattern.test(prompt)) {
      intents.push(intent);
    }
  }
  
  return intents.length > 0 ? intents : ['general'];
}

/**
 * Detect user type from prompt context
 */
function detectUserType(prompt: string): PersonaContext['userType'] {
  for (const [type, pattern] of Object.entries(USER_TYPE_PATTERNS)) {
    if (pattern.test(prompt)) {
      return type as PersonaContext['userType'];
    }
  }
  return 'operator'; // Default
}

/**
 * Find the best agent for the detected intents
 */
function matchAgentToIntent(intents: string[], industry: string): BoomerAng | null {
  // Intent to capability mapping
  const intentCapabilityMap: Record<string, string[]> = {
    buy: ['Research', 'Analysis', 'Data'],
    sell: ['Content', 'Marketing', 'Documentation'],
    analyze: ['Data Analysis', 'Reporting', 'Visualization'],
    research: ['Web Search', 'Fact Checking', 'Research'],
    create: ['Code Generation', 'Content Writing', 'Document Generation'],
    automate: ['Workflow', 'Automation', 'Pipeline'],
    advise: ['Context', 'Analysis', 'Recommendations'],
    troubleshoot: ['Error', 'Debug', 'Tracing'],
    financial: ['Analysis', 'Reporting', 'Predictions'],
    legal: ['Compliance', 'Document', 'Verification'],
  };

  // Find agent with matching capabilities
  for (const intent of intents) {
    const capabilities = intentCapabilityMap[intent] || [];
    for (const cap of capabilities) {
      const agent = AGENT_REGISTRY.find(a => 
        a.status === 'active' && 
        a.capabilities.some(c => c.toLowerCase().includes(cap.toLowerCase()))
      );
      if (agent) return agent;
    }
  }

  // Fallback to ACHEEVY core
  return AGENT_REGISTRY.find(a => a.id === 'acheevy-core') || null;
}

/**
 * Generate a dynamic persona based on context
 * This is the main function - called when user prompts
 */
export function generatePersona(context: PersonaContext): DynamicPersona {
  const industry = context.industry.toLowerCase().replace(/\s+/g, '_');
  const archetype = INDUSTRY_ARCHETYPES[industry] || INDUSTRY_ARCHETYPES.tech;
  
  // Detect intent from user's specific need or intent
  const intents = detectIntent(context.userIntent + ' ' + (context.specificNeed || ''));
  const userType = context.userType || detectUserType(context.userIntent);
  
  // Select role based on intent (if-then logic)
  let roleIndex = 0;
  if (intents.includes('analyze') || intents.includes('financial')) roleIndex = 1;
  if (intents.includes('create') || intents.includes('automate')) roleIndex = 2;
  if (intents.includes('advise') || intents.includes('troubleshoot')) roleIndex = 3;
  
  const role = archetype.roles[roleIndex] || archetype.roles[0];
  const specialty = archetype.specialties[roleIndex] || archetype.specialties[0];
  const tone = archetype.tones[Math.min(roleIndex, archetype.tones.length - 1)];
  
  // Build context modifiers based on user type
  const contextModifiers: string[] = [];
  switch (userType) {
    case 'buyer':
      contextModifiers.push('Focus on value discovery and risk assessment');
      break;
    case 'seller':
      contextModifiers.push('Focus on positioning, pricing strategy, and market appeal');
      break;
    case 'investor':
      contextModifiers.push('Focus on ROI, risk/reward, and portfolio fit');
      break;
    case 'operator':
      contextModifiers.push('Focus on efficiency, automation, and operational excellence');
      break;
    case 'advisor':
      contextModifiers.push('Provide analysis suitable for client presentation');
      break;
    case 'learner':
      contextModifiers.push('Explain concepts clearly with examples');
      break;
  }
  
  // Add expertise-based modifiers
  switch (context.expertise) {
    case 'beginner':
      contextModifiers.push('Use simple language and avoid jargon');
      break;
    case 'expert':
      contextModifiers.push('Use technical terminology and provide detailed analysis');
      break;
    default:
      contextModifiers.push('Balance technical accuracy with accessibility');
  }
  
  // Add urgency modifiers
  if (context.urgency === 'immediate') {
    contextModifiers.push('Prioritize actionable, immediate recommendations');
  } else if (context.urgency === 'exploratory') {
    contextModifiers.push('Provide comprehensive context and options');
  }
  
  // Find matching agent
  const assignedAgent = matchAgentToIntent(intents, industry);
  
  // Generate dynamic system prompt (NO hardcoded names!)
  const systemPrompt = buildSystemPrompt({
    role,
    specialty,
    tone,
    focusAreas: archetype.focus_areas,
    contextModifiers,
    intents,
    userType,
  });
  
  return {
    name: `${industry.charAt(0).toUpperCase()}${industry.slice(1).replace(/_/g, ' ')} ${role}`,
    role,
    specialty,
    tone,
    focus_areas: archetype.focus_areas,
    system_prompt: systemPrompt,
    assigned_agent: assignedAgent,
    context_modifiers: contextModifiers,
  };
}

/**
 * Build dynamic system prompt based on context
 */
function buildSystemPrompt(params: {
  role: string;
  specialty: string;
  tone: string;
  focusAreas: string[];
  contextModifiers: string[];
  intents: string[];
  userType?: string;
}): string {
  const { role, specialty, tone, focusAreas, contextModifiers, intents, userType } = params;
  
  let prompt = `You are a ${role} specializing in ${specialty}. `;
  prompt += `Your communication style is ${tone}. `;
  
  // Add focus areas
  prompt += `You focus on: ${focusAreas.slice(0, 3).join(', ')}. `;
  
  // Add context modifiers
  if (contextModifiers.length > 0) {
    prompt += contextModifiers.join('. ') + '. ';
  }
  
  // Add intent-specific instructions
  if (intents.includes('financial')) {
    prompt += 'Always include numerical analysis and ROI considerations. ';
  }
  if (intents.includes('legal')) {
    prompt += 'Flag any compliance or liability concerns. ';
  }
  if (intents.includes('create')) {
    prompt += 'Provide structured, actionable deliverables. ';
  }
  if (intents.includes('research')) {
    prompt += 'Cite sources and validate information. ';
  }
  
  // Add user type specific ending
  if (userType === 'advisor') {
    prompt += 'Format responses suitable for client presentation.';
  } else if (userType === 'learner') {
    prompt += 'Include explanations of key concepts.';
  } else {
    prompt += 'Be direct and action-oriented.';
  }
  
  return prompt;
}

/**
 * Quick persona generation from just industry and prompt
 * This is the simplified API for most use cases
 */
export function quickPersona(industry: string, userPrompt: string): DynamicPersona {
  return generatePersona({
    industry,
    userIntent: userPrompt,
    specificNeed: undefined,
    userType: detectUserType(userPrompt),
    taskType: undefined,
    urgency: undefined,
    expertise: 'intermediate',
  });
}

/**
 * Get static persona for industry (backward compatibility)
 * Returns a general persona without prompt context
 */
export function getStaticPersona(industry: string): DynamicPersona {
  return quickPersona(industry, 'general inquiry about ' + industry);
}

/**
 * Validate if persona is appropriate for the given prompt
 */
export function validatePersonaForPrompt(persona: DynamicPersona, prompt: string): boolean {
  const intents = detectIntent(prompt);
  
  // Check if persona's focus areas align with detected intents
  const focusAreasLower = persona.focus_areas.map(f => f.toLowerCase());
  const intentKeywords = intents.flatMap(i => i.split('_'));
  
  return intentKeywords.some(keyword => 
    focusAreasLower.some(area => area.includes(keyword))
  );
}

export default {
  generatePersona,
  quickPersona,
  getStaticPersona,
  detectIntent,
  detectUserType,
  validatePersonaForPrompt,
};
