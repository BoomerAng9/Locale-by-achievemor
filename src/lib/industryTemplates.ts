import { IndustryTemplate } from '../../types';
import { quickPersona, DynamicPersona } from '../../lib/ai/personaEngine';

/**
 * Industry Templates with Dynamic Persona Generation
 * 
 * Personas are no longer hardcoded - they are generated dynamically
 * based on user prompts using the personaEngine.
 * 
 * The system_prompt field is now a BASE prompt that gets enhanced
 * by the persona engine when the user interacts.
 */

// Helper to get dynamic persona for an industry
export function getIndustryPersona(industryId: string, userPrompt: string): DynamicPersona {
  return quickPersona(industryId, userPrompt);
}

export const INDUSTRY_TEMPLATES: IndustryTemplate[] = [
  {
    id: 'real_estate',
    name: 'Real Estate & Investing',
    icon: 'Building',
    // Base prompt - enhanced dynamically by personaEngine based on user intent
    system_prompt: 'DYNAMIC_PERSONA', // Marker indicating dynamic generation
    tools_enabled: ['flip_calc', 'zoning_map', 'comps_finder'],
    quick_actions: [
      { label: 'Analyze Flip', prompt: 'Run the 70% rule on this property...' },
      { label: 'Pull Comps', prompt: 'Find 3 comparable sales in 30318...' }
    ],
    dashboard_layout: 'map_heavy',
    theme_color: 'emerald-500'
  },
  {
    id: 'legal',
    name: 'Legal & Pro Services',
    icon: 'Scale',
    system_prompt: 'DYNAMIC_PERSONA',
    tools_enabled: ['doc_ocr', 'compliance_check', 'secure_vault'],
    quick_actions: [
      { label: 'Review Contract', prompt: 'Scan this PDF for liability clauses...' },
      { label: 'Draft NDA', prompt: 'Create a mutual NDA for...' }
    ],
    dashboard_layout: 'data_heavy',
    theme_color: 'slate-600'
  },
  {
    id: 'construction',
    name: 'Construction & Trades',
    icon: 'HardHat',
    system_prompt: 'DYNAMIC_PERSONA',
    tools_enabled: ['blueprint_reader', 'permit_search', 'material_est'],
    quick_actions: [
      { label: 'Estimate Material', prompt: 'Calculate lumber needed for...' },
      { label: 'Check Permits', prompt: 'Are permits required for a deck in...' }
    ],
    dashboard_layout: 'map_heavy',
    theme_color: 'orange-500'
  },
  {
    id: 'healthcare',
    name: 'Healthcare & Wellness',
    icon: 'Stethoscope',
    system_prompt: 'DYNAMIC_PERSONA',
    tools_enabled: ['hipaa_forms', 'patient_crm', 'scheduling'],
    quick_actions: [
      { label: 'Create Form', prompt: 'Generate a patient intake form...' },
      { label: 'Schedule Staff', prompt: 'Optimize shift rotation for...' }
    ],
    dashboard_layout: 'data_heavy',
    theme_color: 'cyan-500'
  },
  {
    id: 'retail',
    name: 'Retail & E-Commerce',
    icon: 'ShoppingBag',
    system_prompt: 'DYNAMIC_PERSONA',
    tools_enabled: ['inventory_track', 'ad_copy_gen', 'price_scraper'],
    quick_actions: [
      { label: 'Write Ad Copy', prompt: 'Generate FB ad copy for...' },
      { label: 'Check Competitors', prompt: 'Scan prices for...' }
    ],
    dashboard_layout: 'media_heavy',
    theme_color: 'pink-500'
  },
  {
    id: 'logistics',
    name: 'Logistics & Transport',
    icon: 'Truck',
    system_prompt: 'DYNAMIC_PERSONA',
    tools_enabled: ['route_opt', 'fleet_mgr', 'fuel_calc'],
    quick_actions: [
      { label: 'Optimize Route', prompt: 'Plan the fastest route for...' },
      { label: 'Calc Fuel', prompt: 'Estimate fuel cost for 500 miles...' }
    ],
    dashboard_layout: 'map_heavy',
    theme_color: 'blue-600'
  },
  {
    id: 'education',
    name: 'Education & Coaching',
    icon: 'GraduationCap',
    system_prompt: 'DYNAMIC_PERSONA',
    tools_enabled: ['course_builder', 'quiz_gen', 'progress_track'],
    quick_actions: [
      { label: 'Outline Course', prompt: 'Create a syllabus for...' },
      { label: 'Gen Quiz', prompt: 'Make a 5-question quiz on...' }
    ],
    dashboard_layout: 'media_heavy',
    theme_color: 'yellow-500'
  },
  {
    id: 'media',
    name: 'Media & Podcasting',
    icon: 'Mic',
    system_prompt: 'DYNAMIC_PERSONA',
    tools_enabled: ['transcriber', 'show_notes', 'sponsor_match'],
    quick_actions: [
      { label: 'Transcribe', prompt: 'Upload audio for transcription...' },
      { label: 'Write Intro', prompt: 'Draft a podcast intro about...' }
    ],
    dashboard_layout: 'media_heavy',
    theme_color: 'purple-500'
  },
  {
    id: 'hospitality',
    name: 'Hospitality & Events',
    icon: 'Utensils',
    system_prompt: 'DYNAMIC_PERSONA',
    tools_enabled: ['venue_find', 'guest_mgr', 'menu_plan'],
    quick_actions: [
      { label: 'Find Venue', prompt: 'Search venues for 100 people in...' },
      { label: 'Plan Menu', prompt: 'Suggest a vegan menu for...' }
    ],
    dashboard_layout: 'media_heavy',
    theme_color: 'rose-500'
  },
  {
    id: 'tech',
    name: 'Technology & AI',
    icon: 'Cpu',
    system_prompt: 'DYNAMIC_PERSONA',
    tools_enabled: ['code_sandbox', 'api_mgr', 'agent_builder'],
    quick_actions: [
      { label: 'Review Code', prompt: 'Analyze this snippet for bugs...' },
      { label: 'Design API', prompt: 'Structure a REST API for...' }
    ],
    dashboard_layout: 'data_heavy',
    theme_color: 'indigo-500'
  }
];

/**
 * Get template with resolved dynamic persona
 * Call this when user interacts - it generates context-specific persona
 */
export function getTemplateWithPersona(
  templateId: string, 
  userPrompt: string
): IndustryTemplate & { resolved_persona: DynamicPersona } {
  const template = INDUSTRY_TEMPLATES.find(t => t.id === templateId);
  if (!template) {
    throw new Error(`Template not found: ${templateId}`);
  }
  
  const persona = getIndustryPersona(templateId, userPrompt);
  
  return {
    ...template,
    system_prompt: persona.system_prompt, // Replace DYNAMIC_PERSONA with actual prompt
    resolved_persona: persona
  };
}

/**
 * Get all available industry IDs
 */
export function getAvailableIndustries(): string[] {
  return INDUSTRY_TEMPLATES.map(t => t.id);
}

/**
 * Check if template uses dynamic persona
 */
export function isDynamicPersona(template: IndustryTemplate): boolean {
  return template.system_prompt === 'DYNAMIC_PERSONA';
}
