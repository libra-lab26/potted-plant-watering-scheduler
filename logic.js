export function checkBotanicalInput(title, interval) {
    if (!title || title.trim().length === 0) return "Plant name cannot be empty.";
    if (title.length > 40) return "Plant name must be 40 characters or less.";
    const num = Number(interval);
    if (isNaN(num) || num < 1) return "Watering frequency must be at least 1 day.";
    if (num > 365) return "Watering frequency cannot exceed 365 days.";
    return null;
}

export function evaluateSchedule(lastDate, interval, nowMs = Date.now()) {
    const freq = Math.max(1, Number(interval) || 1);
    const lastMs = new Date(lastDate).getTime();
    if (isNaN(lastMs)) return { remainingDays: 0, needsMoistureNow: true, isDueSoon: false, label: "OVERDUE 🥀", badgeStyleClass: "badge-alert" };

    const elapsedDays = Math.floor((nowMs - lastMs) / 86400000);
    const remainingDays = freq - elapsedDays;
    const needsMoistureNow = remainingDays <= 0;
    const isDueSoon = remainingDays === 1;

    let label = needsMoistureNow ? (remainingDays < 0 ? `Overdue by ${Math.abs(remainingDays)}d 🥀` : "WATER REQUIRED 🥀") : (isDueSoon ? "Due Tomorrow ⚠️" : `In ${remainingDays} days 🌿`);
    let badgeStyleClass = needsMoistureNow ? "badge-alert" : (isDueSoon ? "badge-warn" : "badge-optimal");

    return { remainingDays, needsMoistureNow, isDueSoon, label, badgeStyleClass };
}

export function computeTerrariumStats(list, nowMs = Date.now()) {
    if (!Array.isArray(list)) return { totalRecords: 0, overdueRecords: 0, optimalRecords: 0 };
    let overdue = 0, optimal = 0;
    list.forEach(item => {
        const st = evaluateSchedule(item.lastMoistureDate, item.waterInterval, nowMs);
        if (st.needsMoistureNow) overdue++; else optimal++;
    });
    return { totalRecords: list.length, overdueRecords: overdue, optimalRecords: optimal };
}

export function filterBotanicalList(list, category = 'all', nowMs = Date.now()) {
    if (!Array.isArray(list)) return [];
    if (category === 'all') return list;
    return list.filter(item => {
        const st = evaluateSchedule(item.lastMoistureDate, item.waterInterval, nowMs);
        return category === 'overdue' ? st.needsMoistureNow : !st.needsMoistureNow;
    });
}
