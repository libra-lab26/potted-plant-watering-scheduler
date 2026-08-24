import { checkBotanicalInput, evaluateSchedule, computeTerrariumStats, filterBotanicalList } from './logic.js';

const $ = id => document.getElementById(id);
const els = {};
[
    'botanicalForm', 'inputTitle', 'inputInterval', 'inputSymbol', 'formError',
    'terrariumGrid', 'statTotal', 'statOverdue', 'statOptimal',
    'filterNav', 'liveAnnouncer'
].forEach(id => els[id] = $(id));

const defaultRecords = [
    { id: 't1', plantTitle: 'Desert Cactus', waterInterval: 14, symbol: '🌵', lastMoistureDate: new Date(Date.now() - 5 * 86400000).toISOString() },
    { id: 't2', plantTitle: 'Calathea Orbifolia', waterInterval: 5, symbol: '🥀', lastMoistureDate: new Date(Date.now() - 6 * 86400000).toISOString() },
    { id: 't3', plantTitle: 'English Ivy', waterInterval: 3, symbol: '🌱', lastMoistureDate: new Date(Date.now() - 2 * 86400000).toISOString() }
];

let recordList = JSON.parse(localStorage.getItem('plant_watering_libralab')) || defaultRecords;
let activeFilter = 'all';

function setFieldError(el, msg) {
    if (!el) return;
    el.textContent = msg ? `⚠️ ${msg}` : '';
    el.style.display = msg ? 'block' : 'none';
}

function handleAddRecord(e) {
    if (e) e.preventDefault();
    const title = els.inputTitle.value, interval = els.inputInterval.value, symbol = els.inputSymbol ? els.inputSymbol.value : '🌵';
    const err = checkBotanicalInput(title, interval);
    if (err) return setFieldError(els.formError, err);
    setFieldError(els.formError, null);

    recordList.unshift({ id: 'rec_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4), plantTitle: title.trim(), waterInterval: Number(interval), symbol: symbol || '🌵', lastMoistureDate: new Date().toISOString() });
    saveState();
    els.inputTitle.value = '';
    els.inputInterval.value = '7';
    drawTerrariumView();
}

function applyMoisture(id) {
    recordList = recordList.map(item => item.id === id ? { ...item, lastMoistureDate: new Date().toISOString() } : item);
    saveState();
    drawTerrariumView();
}

function moistureAllOverdue() {
    const now = Date.now();
    recordList = recordList.map(item => evaluateSchedule(item.lastMoistureDate, item.waterInterval, now).needsMoistureNow ? { ...item, lastMoistureDate: new Date().toISOString() } : item);
    saveState();
    drawTerrariumView();
}

function deleteRecord(id) {
    recordList = recordList.filter(item => item.id !== id);
    saveState();
    drawTerrariumView();
}

function setFilterCategory(category) {
    activeFilter = category;
    if (els.filterNav) {
        els.filterNav.querySelectorAll('.btn-filter').forEach(btn => {
            const m = btn.getAttribute('data-filter') === category;
            btn.classList.toggle('active', m);
            btn.setAttribute('aria-pressed', m ? 'true' : 'false');
        });
    }
    drawTerrariumView();
}

function applyPresetSpec(title, interval, symbol) {
    els.inputTitle.value = title;
    els.inputInterval.value = interval;
    if (els.inputSymbol) els.inputSymbol.value = symbol;
    setFieldError(els.formError, null);
}

function saveState() {
    localStorage.setItem('plant_watering_libralab', JSON.stringify(recordList));
}

function drawTerrariumView() {
    const now = Date.now();
    const stats = computeTerrariumStats(recordList, now);
    els.statTotal.textContent = stats.totalRecords;
    els.statOverdue.textContent = stats.overdueRecords;
    els.statOptimal.textContent = stats.optimalRecords;

    const filtered = filterBotanicalList(recordList, activeFilter, now);
    els.liveAnnouncer.textContent = `Displaying ${filtered.length} terrarium plants.`;
    els.terrariumGrid.innerHTML = '';

    if (filtered.length === 0) {
        const p = document.createElement('div');
        p.className = 'empty-placeholder';
        p.textContent = recordList.length === 0 ? "Terrarium is empty. Catalog your first plant above!" : "No plants match selected filter.";
        return els.terrariumGrid.appendChild(p);
    }

    filtered.forEach(item => {
        const st = evaluateSchedule(item.lastMoistureDate, item.waterInterval, now);
        const card = document.createElement('div');
        card.className = `plant-card ${st.needsMoistureNow ? 'card-overdue' : 'card-healthy'}`;

        const header = document.createElement('div');
        header.className = 'card-header';
        const titleBox = document.createElement('div');
        titleBox.className = 'card-title-box';

        const iconEl = document.createElement('span');
        iconEl.className = 'plant-icon';
        iconEl.textContent = st.needsMoistureNow ? '🥀' : item.symbol;

        const nameEl = document.createElement('h3');
        nameEl.className = 'plant-name';
        nameEl.textContent = item.plantTitle;

        titleBox.appendChild(iconEl);
        titleBox.appendChild(nameEl);

        const badge = document.createElement('span');
        badge.className = `badge ${st.badgeStyleClass}`;
        badge.textContent = st.label;

        header.appendChild(titleBox);
        header.appendChild(badge);

        const infoRow = document.createElement('div');
        infoRow.className = 'card-info-row';
        infoRow.textContent = `Water interval: ${item.waterInterval} days`;

        const footer = document.createElement('div');
        footer.className = 'card-footer';

        const waterBtn = document.createElement('button');
        waterBtn.className = 'btn btn-water';
        waterBtn.textContent = '💦 Water Now';
        waterBtn.addEventListener('click', () => applyMoisture(item.id));

        const delBtn = document.createElement('button');
        delBtn.className = 'btn-del';
        delBtn.textContent = '🗑️';
        delBtn.addEventListener('click', () => deleteRecord(item.id));

        footer.appendChild(waterBtn);
        footer.appendChild(delBtn);

        card.appendChild(header);
        card.appendChild(infoRow);
        card.appendChild(footer);
        els.terrariumGrid.appendChild(card);
    });
}

export function initApp() {
    window.triggerSetFilter = setFilterCategory;
    window.triggerApplyPresetSpec = applyPresetSpec;
    window.triggerMoistureAllOverdue = moistureAllOverdue;
    if (els.botanicalForm) els.botanicalForm.addEventListener('submit', handleAddRecord);
    drawTerrariumView();
}
