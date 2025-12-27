/**
 * Synthetic User Generator Hook
 * 
 * Implements the "Bell Curve" distribution logic to generate realistic
 * cohorts of synthetic users.
 * 
 * Distribution:
 * - 10% Alpha Users (High engagement, detailed)
 * - 60% Standard Users (Average)
 * - 20% Strugglers (Need help, errors)
 * - 10% Edge Cases (Accessibility, non-native, etc)
 */

import { useState } from 'react';
import { 
  SyntheticUserProfile, 
  SyntheticDemographics, 
  SyntheticPsychographics, 
  SyntheticContext, 
  SimulationRules, 
  PersonalityTrait,
  LearningStyle
} from './SyntheticUserSchema';

// --- SEED LISTS FOR RANDOM GENERATION ---
const NAMES_FEMALE = ["Emma", "Olivia", "Ava", "Isabella", "Sophia", "Mia", "Amelia", "Harper", "Evelyn", "Abigail", "Sarah", "Jessica", "Maya", "Priya"];
const NAMES_MALE = ["Liam", "Noah", "Oliver", "Elijah", "James", "William", "Benjamin", "Lucas", "Henry", "Alexander", "Michael", "David", "Arjun", "Wei"];
const MAJORS = ["Computer Science", "Biology", "Psychology", "Business", "Graphic Design", "Nursing", "Engineering", "English Lit", "History"];
const LOCATIONS = ["Savannah, GA", "Austin, TX", "New York, NY", "Seattle, WA", "Columbus, OH", "Remote (Rural)", "London, UK", "Toronto, CA"];
const STRESSORS = ["Mid-Semester Panic", "Finals Week", "Calm", "Bored", "Excited", "Overwhelmed via Work"];

const getRandom = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];
const getWeightedRandom = <T>(arr: T[], weights: number[]): T => {
  const totalWeight = weights.reduce((a, b) => a + b, 0);
  let random = Math.random() * totalWeight;
  for (let i = 0; i < arr.length; i++) {
    if (random < weights[i]) return arr[i];
    random -= weights[i];
  }
  return arr[0];
};

export const useSyntheticUserGenerator = () => {
  const [isGenerating, setIsGenerating] = useState(false);

  const generateProfile = (segment: 'Alpha' | 'Standard' | 'Struggler' | 'Edge Case', id: string, baseTopic: string): SyntheticUserProfile => {
    const isFemale = Math.random() > 0.5;
    const name = getRandom(isFemale ? NAMES_FEMALE : NAMES_MALE) + ` ${Math.floor(Math.random() * 99)}`; // Basic unique naming
    
    // --- SEGMENT CONFIGURATION ---
    let psycho: Partial<SyntheticPsychographics> = {};
    let rules: Partial<SimulationRules> = {};
    let context: Partial<SyntheticContext> = {};

    switch (segment) {
      case 'Alpha':
        psycho = {
          personality_traits: ['Conscientiousness: High', 'Openness: High', 'Extraversion: High'],
          learning_style: 'Textual', 
          motivation_trigger: 'Mastery and Efficiency',
          frustration_trigger: 'Lack of advanced options',
        };
        rules = { verbosity: 'High', tone: 'Professional/Direct', error_rate: 0.01 };
        context = { tech_literacy: 'Expert', current_stress_level: 'Excited' };
        break;

      case 'Standard':
        psycho = {
          personality_traits: ['Conscientiousness: Medium', 'Openness: Medium', 'Agreeableness: High'],
          learning_style: getRandom(['Visual-Kinesthetic', 'Auditory', 'Social']) as LearningStyle,
          motivation_trigger: 'Getting a good grade',
          frustration_trigger: 'Unclear instructions',
        };
        rules = { verbosity: 'Medium', tone: 'Casual/Inquisitive', error_rate: 0.03 };
        context = { tech_literacy: 'High (Mobile)', current_stress_level: getRandom(STRESSORS) };
        break;

      case 'Struggler':
        psycho = {
          personality_traits: ['Conscientiousness: Low', 'Neuroticism: High'],
          learning_style: 'Visual-Kinesthetic',
          motivation_trigger: 'Peer recognition',
          frustration_trigger: 'Text-heavy documentation',
        };
        rules = { verbosity: 'Low', tone: 'Anxious/Confused', error_rate: 0.15 };
        context = { tech_literacy: 'Medium', current_stress_level: 'Overwhelmed' };
        break;

      case 'Edge Case':
        const issue = getRandom(['Screen Reader User', 'ESL Speaker', 'Slow Internet']);
        psycho = {
          personality_traits: ['Openness: High', 'Neuroticism: Medium'],
          learning_style: 'Solitary',
          motivation_trigger: 'Accessibility and Inclusion',
          frustration_trigger: 'Inaccessible UI elements',
        };
        rules = { verbosity: 'Medium', tone: 'Polite/Patient', error_rate: issue === 'ESL Speaker' ? 0.08 : 0.02 };
        context = { 
          tech_literacy: 'High (Desktop)', 
          accessibility_needs: issue === 'Screen Reader User' ? ['Screen Reader'] : [],
          connection_quality: issue === 'Slow Internet' ? 'Spotty' : 'Fiber'
        };
        break;
    }

    return {
      sup_id: id,
      name,
      cohort_segment: segment,
      demographics: {
        age: 18 + Math.floor(Math.random() * 5),
        gender: isFemale ? "Female" : "Male",
        location: getRandom(LOCATIONS),
        education_level: "Undergraduate",
        major: getRandom(MAJORS),
      },
      psychographics: {
        personality_traits: psycho.personality_traits as PersonalityTrait[],
        learning_style: psycho.learning_style as LearningStyle,
        motivation_trigger: psycho.motivation_trigger || "Completion",
        frustration_trigger: psycho.frustration_trigger || "Boredom",
        goals: ["Pass the class", "Learn the skill"],
        fears: ["Failure", "Looking stupid"],
      },
      context: {
        tech_literacy: (context.tech_literacy || 'Medium') as any,
        accessibility_needs: context.accessibility_needs || [],
        current_stress_level: context.current_stress_level || "Calm",
        device_type: Math.random() > 0.7 ? "Desktop" : "Mobile",
        connection_quality: "4G",
        ...context
      },
      simulation_rules: {
        verbosity: (rules.verbosity || 'Medium') as any,
        tone: rules.tone || 'Neutral',
        error_rate: rules.error_rate || 0.05,
        response_latency: 500 + Math.random() * 2000,
      }
    };
  };

  const generateClassroom = async (count: number, subject: string): Promise<SyntheticUserProfile[]> => {
    setIsGenerating(true);
    
    // Artificial delay to simulate "Thinking/Generation"
    await new Promise(resolve => setTimeout(resolve, 800));

    const distribution = {
      alpha: Math.round(count * 0.10),
      standard: Math.round(count * 0.60),
      struggler: Math.round(count * 0.20),
      edge: Math.round(count * 0.10),
    };

    // Fix rounding errors
    let generatedCount = distribution.alpha + distribution.standard + distribution.struggler + distribution.edge;
    if (generatedCount < count) distribution.standard += (count - generatedCount);

    const users: SyntheticUserProfile[] = [];

    for (let i = 0; i < distribution.alpha; i++) users.push(generateProfile('Alpha', `u_alpha_${i}`, subject));
    for (let i = 0; i < distribution.standard; i++) users.push(generateProfile('Standard', `u_std_${i}`, subject));
    for (let i = 0; i < distribution.struggler; i++) users.push(generateProfile('Struggler', `u_str_${i}`, subject));
    for (let i = 0; i < distribution.edge; i++) users.push(generateProfile('Edge Case', `u_edge_${i}`, subject));

    // Shuffle
    const shuffled = users.sort(() => Math.random() - 0.5);
    
    setIsGenerating(false);
    return shuffled;
  };

  return {
    generateClassroom,
    isGenerating
  };
};
