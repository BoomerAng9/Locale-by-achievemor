import { BarsResolverOutput } from '../types';

export function resolveBars(stanza: string): BarsResolverOutput {
  const normalized = stanza.toUpperCase();
  
  // Simple regex parsers
  const scopeMatch = normalized.match(/SCOPE:\s*\[(.*?)\]/);
  const vibeMatch = normalized.match(/VIBE:\s*\[(.*?)\]/);
  const urgencyMatch = normalized.match(/URGENCY:\s*\[(.*?)\]/);
  
  const scope = scopeMatch ? scopeMatch[1].split(',').map(s => s.trim()) : [];
  const vibe = vibeMatch ? vibeMatch[1].split(',').map(s => s.trim()) : [];
  
  let urgency: 'LOW' | 'MED' | 'HIGH' = 'MED';
  if (urgencyMatch) {
    const u = urgencyMatch[1].trim();
    if (u === 'HIGH' || u === 'URGENT') urgency = 'HIGH';
    if (u === 'LOW') urgency = 'LOW';
  }
  
  // Synthesize Summary
  let summary = "A project";
  if (scope.length > 0) {
    summary += ` focusing on ${scope.join(' and ')}`;
  } else {
    summary += " with undefined scope";
  }
  
  if (vibe.length > 0) {
    summary += `, requesting a ${vibe.join('/')} aesthetic`;
  }
  
  summary += `. Urgency level is ${urgency}.`;
  
  return {
    scope,
    vibe,
    urgency,
    summary
  };
}