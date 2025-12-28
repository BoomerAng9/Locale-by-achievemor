/**
 * AI Plug Registry - 100+ Automated Business Ideas
 * Enhanced with II-Agent capabilities for autonomous execution
 * Integrated with Locale platform for workforce networking automation
 */

export interface AIPlug {
  id: string;
  name: string;
  category: AIPlugCategory;
  description: string;
  status: 'active' | 'standby' | 'offline' | 'error';
  executionMode: 'automatic' | 'on-demand' | 'scheduled';
  accessLevel: 'ownership' | 'partners' | 'clients';
  dependencies: string[]; // Other AI Plugs this depends on
  capabilities: string[];
  pricing: {
    baseCost: number;
    unit: 'per-use' | 'monthly' | 'yearly';
    currency: 'USD';
  };
  metrics: {
    totalExecutions: number;
    successRate: number;
    avgResponseTime: number;
    revenueGenerated: number;
  };
  iiAgentCapabilities: IIAgentCapability[];
  autonomousTriggers?: AutonomousTrigger[];
  lastExecuted?: string;
  createdAt: string;
}

export type AIPlugCategory =
  | 'content-creation'
  | 'legal-compliance'
  | 'ecommerce-retail'
  | 'marketing-seo'
  | 'voice-chatbots'
  | 'education-training'
  | 'healthcare-wellness'
  | 'finance-accounting'
  | 'real-estate'
  | 'hr-recruiting'
  | 'creative-media'
  | 'operations-workflow'
  | 'research-analysis'
  | 'software-development'
  | 'data-visualization'
  | 'problem-solving'
  | 'workflow-automation';

export type IIAgentCapability =
  | 'web-search'
  | 'source-triangulation'
  | 'content-generation'
  | 'data-analysis'
  | 'code-synthesis'
  | 'script-generation'
  | 'browser-automation'
  | 'file-management'
  | 'problem-decomposition'
  | 'stepwise-reasoning'
  | 'pdf-processing'
  | 'image-analysis'
  | 'video-processing'
  | 'deep-research'
  | 'context-management'
  | 'token-optimization'
  | 'workflow-automation'
  | 'alternative-path-exploration';

export interface AutonomousTrigger {
  type: 'schedule' | 'event' | 'condition' | 'api-call';
  schedule?: string; // cron expression
  event?: string; // event name
  condition?: string; // condition to check
  apiEndpoint?: string; // API endpoint to trigger
}

export interface AIPlugExecution {
  id: string;
  plugId: string;
  userId: string;
  input: any;
  output?: any;
  status: 'queued' | 'running' | 'completed' | 'failed';
  startedAt?: string;
  completedAt?: string;
  error?: string;
  cost: number;
}

export interface AIPlugMessage {
  id: string;
  plugId: string;
  userId: string;
  content: string;
  timestamp: string;
  type: 'user' | 'system' | 'delegation';
  priority: 'low' | 'medium' | 'high' | 'urgent';
}

// Import comprehensive registry
import { ALL_AI_PLUGS } from './comprehensive-registry';

// Export the comprehensive registry as the main AI_PLUG_REGISTRY
export const AI_PLUG_REGISTRY: AIPlug[] = ALL_AI_PLUGS;
// Helper functions
export const getPlugById = (id: string): AIPlug | undefined => {
  return AI_PLUG_REGISTRY.find(plug => plug.id === id);
};

export const getPlugsByCategory = (category: string): AIPlug[] => {
  return AI_PLUG_REGISTRY.filter(plug => plug.category === category);
};

export const getPlugsByAccessLevel = (accessLevel: 'ownership' | 'partners' | 'clients'): AIPlug[] => {
  return AI_PLUG_REGISTRY.filter(plug => plug.accessLevel === accessLevel);
};

export const searchPlugs = (query: string): AIPlug[] => {
  const lowerQuery = query.toLowerCase();
  return AI_PLUG_REGISTRY.filter(plug =>
    plug.name.toLowerCase().includes(lowerQuery) ||
    plug.description.toLowerCase().includes(lowerQuery) ||
    plug.category.toLowerCase().includes(lowerQuery)
  );
};
