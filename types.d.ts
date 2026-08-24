export interface BotanicalRecord {
    id: string;
    plantTitle: string;
    waterInterval: number;
    symbol: string;
    lastMoistureDate: string;
}

export interface ScheduleState {
    remainingDays: number;
    needsMoistureNow: boolean;
    isDueSoon: boolean;
    label: string;
    badgeStyleClass: string;
}

export interface TerrariumStats {
    totalRecords: number;
    overdueRecords: number;
    optimalRecords: number;
}
