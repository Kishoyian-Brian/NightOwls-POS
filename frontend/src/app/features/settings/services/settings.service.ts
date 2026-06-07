import { Injectable } from '@angular/core';
import { AppSettings } from '../models/settings.model';

const DEFAULTS: AppSettings = {
    clubName: 'ClubMaster',
    currency: 'KES',
    lowStockThreshold: 10,
    trackInventory: true,
};

@Injectable({ providedIn: 'root' })
export class SettingsService {
    private readonly KEY = 'cm_settings';

    constructor() {
        if (!localStorage.getItem(this.KEY)) {
            localStorage.setItem(this.KEY, JSON.stringify(DEFAULTS));
        }
    }

    getSettings(): AppSettings {
        return { ...DEFAULTS, ...JSON.parse(localStorage.getItem(this.KEY) || '{}') };
    }

    saveSettings(settings: AppSettings): void {
        localStorage.setItem(this.KEY, JSON.stringify(settings));
    }
}
