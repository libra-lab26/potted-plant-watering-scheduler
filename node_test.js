import { test } from 'node:test';
import assert from 'node:assert';
import { checkBotanicalInput, evaluateSchedule, computeTerrariumStats } from './logic.js';

test('checkBotanicalInput validates input constraints', () => {
    assert.strictEqual(checkBotanicalInput('', 7), "Plant name cannot be empty.");
    assert.strictEqual(checkBotanicalInput('Cactus', 0), "Watering frequency must be at least 1 day.");
    assert.strictEqual(checkBotanicalInput('Cactus', 14), null);
});

test('evaluateSchedule correctly calculates moisture countdown', () => {
    const now = new Date('2026-08-24T12:00:00Z').getTime();
    assert.strictEqual(evaluateSchedule('2026-08-24T12:00:00Z', 14, now).remainingDays, 14);
    assert.strictEqual(evaluateSchedule('2026-08-10T12:00:00Z', 7, now).needsMoistureNow, true);
});

test('computeTerrariumStats calculates correct plant tallies', () => {
    const now = new Date('2026-08-24T12:00:00Z').getTime();
    const list = [
        { id: '1', waterInterval: 14, lastMoistureDate: '2026-08-24T12:00:00Z' },
        { id: '2', waterInterval: 3, lastMoistureDate: '2026-08-10T12:00:00Z' }
    ];
    const stats = computeTerrariumStats(list, now);
    assert.strictEqual(stats.totalRecords, 2);
    assert.strictEqual(stats.overdueRecords, 1);
});
