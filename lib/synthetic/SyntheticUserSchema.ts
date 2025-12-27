/**
 * Synthetic User Profile (SUP) Schema
 * Based on "Simulating the Human in HCD" Research
 * 
 * Defines the comprehensive structure for a synthetic user persona,
 * moving beyond simple "names" to deep demographic and psychographic simulation.
 */

export type PersonalityTrait = 
  | 'Openness: High' | 'Openness: Medium' | 'Openness: Low'
  | 'Conscientiousness: High' | 'Conscientiousness: Medium' | 'Conscientiousness: Low'
  | 'Extraversion: High' | 'Extraversion: Medium' | 'Extraversion: Low'
  | 'Agreeableness: High' | 'Agreeableness: Medium' | 'Agreeableness: Low'
  | 'Neuroticism: High' | 'Neuroticism: Medium' | 'Neuroticism: Low';

export type LearningStyle = 'Visual-Kinesthetic' | 'Auditory' | 'Textual' | 'Social' | 'Solitary';

export interface SyntheticDemographics {
  age: number;
  gender: string;
  location: string;
  education_level: string;
  major?: string;
  occupation?: string;
  income_level?: string;
}

export interface SyntheticPsychographics {
  personality_traits: PersonalityTrait[];
  learning_style: LearningStyle;
  motivation_trigger: string;
  frustration_trigger: string;
  goals: string[];
  fears: string[];
}

export interface SyntheticContext {
  tech_literacy: 'Low' | 'Medium' | 'High (Mobile)' | 'High (Desktop)' | 'Expert';
  accessibility_needs: string[]; // e.g. "Screen Reader", "Color Blindness", "None"
  current_stress_level: string;
  device_type: 'Mobile' | 'Laptop' | 'Tablet' | 'Desktop';
  connection_quality: '4G' | '5G' | 'Fiber' | 'Spotty';
}

export interface SimulationRules {
  verbosity: 'Low' | 'Medium' | 'High';
  tone: string; // e.g. "Casual/Anxious", "Formal/Direct"
  error_rate: number; // 0.0 to 1.0, simulates typos and misunderstandings
  response_latency: number; // Simulated delay in ms
}

export interface SyntheticUserProfile {
  sup_id: string; // user_001
  name: string;
  avatar_seed?: string; // For generating persistent visual avatars
  demographics: SyntheticDemographics;
  psychographics: SyntheticPsychographics;
  context: SyntheticContext;
  simulation_rules: SimulationRules;
  
  // Cohort assignment logic
  cohort_segment: 'Alpha' | 'Standard' | 'Struggler' | 'Edge Case';
}

/**
 * Prompt Injection Helper
 * Generates the "P2" (Personality Prompting) System Prompt for LLM simulation
 */
export function generatePersonaSystemPrompt(profile: SyntheticUserProfile): string {
  return `
You are simulating a specific human persona. DO NOT break character.
NAME: ${profile.name}
AGE: ${profile.demographics.age}
LOCATION: ${profile.demographics.location}

PERSONALITY TRAITS:
${profile.psychographics.personality_traits.join('\n')}

LEARNING STYLE: ${profile.psychographics.learning_style}
STRESS LEVEL: ${profile.context.current_stress_level}

SIMULATION RULES:
- Tone: ${profile.simulation_rules.tone}
- Verbosity: ${profile.simulation_rules.verbosity}
- Tech Literacy: ${profile.context.tech_literacy}
${profile.simulation_rules.error_rate > 0.05 ? `- You make minor typos or grammatical errors roughly ${(profile.simulation_rules.error_rate * 100).toFixed(0)}% of the time.` : ''}

CONTEXT:
You are interacting with a digital platform. Your motivation is "${profile.psychographics.motivation_trigger}".
You get frustrated by "${profile.psychographics.frustration_trigger}".

Respond ONLY as this persona would. Do not sound like an AI assistant.
`.trim();
}
