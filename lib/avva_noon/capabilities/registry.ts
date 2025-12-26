/**
 * AVVA NOON Capability Registry
 * Defines the "Skills" of the central brain.
 */

export type CapabilityType = 'intelligence' | 'crawler' | 'spatial' | 'creative';

export interface Capability {
  id: string;
  name: string;
  type: CapabilityType;
  description: string;
  status: 'active' | 'dormant' | 'maintenance';
}

export class CapabilityRegistry {
  private capabilities: Map<string, Capability> = new Map();

  constructor() {
    this.registerDefaults();
  }

  private registerDefaults() {
    this.register({
      id: 'market_intel',
      name: 'Market Intelligence Engine',
      type: 'intelligence',
      description: 'Social listening and demand signal detection.',
      status: 'active'
    });

    this.register({
      id: 'auto_invite',
      name: 'Auto-Invite Crawler',
      type: 'crawler',
      description: 'Automated partner discovery and invitation system.',
      status: 'active'
    });

    this.register({
      id: 'jigsaw_map',
      name: 'Interactive World Map',
      type: 'spatial',
      description: 'Geospatial talent visualization engine.',
      status: 'active'
    });

    // Sacred Layers
    this.register({
      id: 'lll_protocol',
      name: 'LLL Protocol (Look, Listen, Learn)',
      type: 'intelligence',
      description: 'Virtue Attunement Layer for user intent analysis.',
      status: 'active'
    });

    this.register({
      id: 'fdh_cycle',
      name: 'FDH Cycle (Foster, Develop, Hone)',
      type: 'creative',
      description: 'Virtue Evolution Matrix for solution optimization.',
      status: 'active'
    });
  }

  public register(cap: Capability) {
    this.capabilities.set(cap.id, cap);
  }

  public listActive(): Capability[] {
    return Array.from(this.capabilities.values()).filter(c => c.status === 'active');
  }

  public async loadAll() {
    // Simulate async loading of neural weights
    return new Promise(resolve => setTimeout(resolve, 500));
  }
}
