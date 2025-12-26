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
    description: 'Master Orchestrator. Manages the nervous system and delegates tasks.',
    status: 'active',
    capabilities: ['Task Delegation', 'Context Management', 'User Intent Analysis'],
    icon: '🤖'
  },
  {
    id: 'voice-agent',
    name: 'Voice Agent',
    role: 'finder', // harnessing 'finder' role for input/output for now
    repo_source: 'eleven-labs-integration',
    description: 'Handles STT/TTS and voice stream processing.',
    status: 'active',
    capabilities: ['Speech-to-Text', 'Text-to-Speech', 'Voice Cloning'],
    icon: '🎙️'
  },
  {
    id: 'code-gen-agent',
    name: 'Code Generation Agent',
    role: 'maker',
    repo_source: 'codex-as-mcp',
    description: 'Generates and refactors code across the stack.',
    status: 'active',
    capabilities: ['Code Generation', 'Refactoring', 'Unit Testing'],
    icon: '⚡'
  },
  {
    id: 'backend-agent',
    name: 'Backend Agent',
    role: 'maker',
    repo_source: 'firebase-functions',
    description: 'Manages API endpoints, database schemas, and serverless functions.',
    status: 'active',
    capabilities: ['API Design', 'DB Schema', 'Serverless'],
    icon: '⚙️'
  },
  {
    id: 'frontend-agent',
    name: 'Frontend Agent',
    role: 'maker',
    repo_source: 'react-shadcn',
    description: 'Constructs UI components and manages client-side state.',
    status: 'active',
    capabilities: ['React', 'CSS/Tailwind', 'State Management'],
    icon: '🎨'
  },
  {
    id: 'testing-agent',
    name: 'Testing Agent',
    role: 'debugger',
    repo_source: 'playwright-suite',
    description: 'Runs E2E tests and verifies system integrity.',
    status: 'standby',
    capabilities: ['E2E Testing', 'Visual Regression', 'Load Testing'],
    icon: '🧪'
  },
  {
    id: 'deploy-agent',
    name: 'Deploy Agent',
    role: 'maker',
    repo_source: 'firebase-tools',
    description: 'Manages CI/CD pipelines and deployment targets (Firebase/GCP).',
    status: 'standby',
    capabilities: ['CI/CD', 'Hosting Config', 'Environment Sync'],
    icon: '🚀'
  }
];
