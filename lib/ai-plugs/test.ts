/**
 * AI Plug System Test Script
 * Validates the enhanced AI plug registry and II-Agent capabilities
 */

import { AI_PLUG_REGISTRY, IIAgentCapability } from './registry';
import { aiPlugEngine } from './engine';

async function testAIPlugSystem() {
  console.log('🧪 Testing AI Plug System with II-Agent Capabilities\n');

  // Test 1: Verify registry loading
  console.log('1. Testing AI Plug Registry...');
  console.log(`   Found ${AI_PLUG_REGISTRY.length} AI plugs in registry`);

  const categories = [...new Set(AI_PLUG_REGISTRY.map(p => p.category))];
  console.log(`   Categories: ${categories.join(', ')}`);

  // Test 2: Check II-Agent capabilities
  console.log('\n2. Testing II-Agent Capabilities...');
  const allCapabilities = new Set<IIAgentCapability>();
  AI_PLUG_REGISTRY.forEach(plug => {
    plug.iiAgentCapabilities.forEach(cap => allCapabilities.add(cap));
  });

  console.log(`   Available capabilities: ${Array.from(allCapabilities).join(', ')}`);

  // Test 3: Validate capability checking
  console.log('\n3. Testing Capability Validation...');
  const testCapabilities: IIAgentCapability[] = ['content-generation', 'web-search', 'data-analysis'];
  testCapabilities.forEach(cap => {
    const hasCap = aiPlugEngine.hasCapability(cap);
    console.log(`   ${cap}: ${hasCap ? '✅' : '❌'}`);
  });

  // Test 4: Execute a sample plug
  console.log('\n4. Testing Plug Execution...');
  const testPlug = AI_PLUG_REGISTRY.find(p => p.id === 'resume-tailor-pro');
  if (testPlug) {
    console.log(`   Executing: ${testPlug.name}`);

    try {
      const execution = await aiPlugEngine.executePlug(
        testPlug.id,
        'test-user',
        {
          resume: 'Sample resume content',
          jobDescription: 'Software Engineer position requiring React, TypeScript, Node.js'
        },
        (progress) => console.log(`   Progress: ${progress}`)
      );

      console.log(`   Status: ${execution.status}`);
      console.log(`   Cost: $${execution.cost}`);
      if (execution.output) {
        console.log(`   Output: ${JSON.stringify(execution.output).substring(0, 100)}...`);
      }
    } catch (error) {
      console.error(`   Error: ${error}`);
    }
  } else {
    console.log('   ❌ Test plug not found');
  }

  // Test 5: Check autonomous triggers
  console.log('\n5. Testing Autonomous Triggers...');
  const plugsWithTriggers = AI_PLUG_REGISTRY.filter(p => p.autonomousTriggers && p.autonomousTriggers.length > 0);
  console.log(`   Plugs with autonomous triggers: ${plugsWithTriggers.length}`);

  plugsWithTriggers.forEach(plug => {
    console.log(`   - ${plug.name}: ${plug.autonomousTriggers?.map(t => t.type).join(', ')}`);
  });

  // Test 6: Validate pricing structure
  console.log('\n6. Testing Pricing Structure...');
  const pricingStats = AI_PLUG_REGISTRY.reduce((acc, plug) => {
    acc[plug.pricing.unit] = (acc[plug.pricing.unit] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  console.log('   Pricing distribution:');
  Object.entries(pricingStats).forEach(([unit, count]) => {
    console.log(`   - ${unit}: ${count} plugs`);
  });

  // Test 7: Check delegation system
  console.log('\n7. Testing Delegation System...');
  const delegationQueues = aiPlugEngine.getDelegationQueue('test-agent');
  console.log(`   Current delegation queue length: ${delegationQueues.length}`);

  console.log('\n✅ AI Plug System Test Complete!');
}

// Export for use in other files
// Run test if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  testAIPlugSystem().catch(console.error);
}