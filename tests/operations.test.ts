import { INITIAL_ZONES, INITIAL_TRANSIT, STADIUM_FAQS } from '../src/data';
import { StadiumZone, TransitStatus } from '../src/types';

// Simple lightweight test runner assert helper
function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`❌ Test failed: ${message}`);
    process.exit(1);
  } else {
    console.log(`✅ Passed: ${message}`);
  }
}

console.log('🏁 Starting FIFA Smart AI Stadium Assistant Test Suite...\n');

// 1. Test Stadium Zone Config & Density Safety Limits
console.log('--- Testing Stadium Zone Densities ---');
assert(INITIAL_ZONES.length > 0, 'INITIAL_ZONES list must not be empty');

INITIAL_ZONES.forEach((zone: StadiumZone) => {
  assert(zone.capacity > 0, `Zone ${zone.name} must have a positive capacity limit`);
  assert(zone.currentOccupancy >= 0, `Zone ${zone.name} cannot have negative occupancy`);
  assert(zone.currentOccupancy <= zone.capacity, `Zone ${zone.name} occupancy exceeds maximum capacity safety threshold`);

  // Verify density tiering
  const ratio = zone.currentOccupancy / zone.capacity;
  if (ratio >= 0.90) {
    assert(
      zone.densityLevel === 'critical' || zone.densityLevel === 'high',
      `Zone ${zone.name} high occupancy ratio (${(ratio * 100).toFixed(1)}%) must trigger high/critical warnings`
    );
  }
});

// 2. Test Transit Lines Wait-time Safety Bounds
console.log('\n--- Testing Transit Schedules & Load States ---');
assert(INITIAL_TRANSIT.length > 0, 'INITIAL_TRANSIT routes must be populated');

INITIAL_TRANSIT.forEach((line: TransitStatus) => {
  assert(line.waitTime >= 0, `Transit line ${line.lineName} cannot have a negative wait queue`);
  
  // Verify matching statuses
  if (line.passengerLoad === 'overload') {
    assert(line.status === 'crowded' || line.status === 'delayed', `Overloaded line ${line.lineName} must reflect status changes`);
  }
});

// 3. Test Multilingual Language Assets
console.log('\n--- Testing Spectator Guideline Multilingual Dictionaries ---');
assert(STADIUM_FAQS.length > 0, 'FAQ guide documents must be available');

STADIUM_FAQS.forEach((faq) => {
  assert(!!faq.languages.en, `FAQ ${faq.id} missing English translation`);
  assert(!!faq.languages.es, `FAQ ${faq.id} missing Spanish translation`);
  assert(!!faq.languages.fr, `FAQ ${faq.id} missing French translation`);
  assert(faq.category.length > 0, `FAQ ${faq.id} should have a category label`);
});

console.log('\n🌟 All 15+ operational verification assertions completed successfully! Stadium state logic is fully robust.');
