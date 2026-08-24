import { checkBotanicalInput, evaluateSchedule, computeTerrariumStats } from './logic.js';

const $ = id => document.getElementById(id);

export function runTests() {
    console.group('Dark Terrarium Scheduler Unit Tests');
    let passes = 0, fails = 0;
    const logLines = [];

    const assertTest = (name, cond) => {
        if (cond) {
            passes++;
            logLines.push({ name, status: 'OK', class: 'test-ok' });
        } else {
            fails++;
            logLines.push({ name, status: 'FAIL', class: 'test-fail' });
        }
    };

    assertTest("Validate empty title", checkBotanicalInput('', 7) === "Plant name cannot be empty.");
    assertTest("Validate valid spec", checkBotanicalInput('Cactus', 14) === null);
    const now = new Date('2026-08-24T12:00:00Z').getTime();
    assertTest("Optimal plant schedule", evaluateSchedule('2026-08-24T12:00:00Z', 14, now).remainingDays === 14);
    assertTest("Overdue plant schedule", evaluateSchedule('2026-08-10T12:00:00Z', 7, now).needsMoistureNow === true);

    console.groupEnd();

    const w = $('testWidget'), l = $('testLines');
    if (w && l) {
        w.style.display = 'block';
        l.innerHTML = logLines.map(line => `<div class="test-line"><span>${line.name}</span><span class="${line.class}">${line.status}</span></div>`).join('') +
            `<div style="border-top:1px solid rgba(255,255,255,0.08);padding-top:0.3rem;margin-top:0.3rem;font-weight:700;display:flex;justify-content:space-between"><span>Summary:</span><span>${passes} passed / ${fails} failed</span></div>`;
    }
}
