/**
 * II-Agent Module - Intelligent Internet Agent Integration
 * 
 * Connects Locale to the Boomer_Ang ecosystem:
 * - ii-agent (Main agent framework)
 * - ii-researcher (Search/research agents)
 * - II-Commons (Dataset tools)
 * - CommonGround (Multi-agent collaboration)
 * - Common_Chronicle (Context → Timeline)
 * - ACHEEVY (Orchestration layer)
 */

export * from './IIAgentBridge';
export { default as IIAgentBridge } from './IIAgentBridge';
export { useIIAgent } from './useIIAgent';
export { default as useIIAgentHook } from './useIIAgent';
