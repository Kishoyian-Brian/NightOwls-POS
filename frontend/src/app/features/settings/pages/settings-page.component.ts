import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SettingsService } from '../services/settings.service';
import { AppSettings } from '../models/settings.model';

@Component({
  selector: 'app-settings-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './settings-page.component.html',
})
export class SettingsPageComponent implements OnInit {
  settings: AppSettings = {
    clubName: 'ClubMaster',
    currency: 'KES',
    lowStockThreshold: 10,
    trackInventory: true,
  };
  saved = false;

  constructor(private settingsService: SettingsService) {}

  ngOnInit(): void {
    this.settings = { ...this.settingsService.getSettings() };
  }

  save(): void {
    this.settingsService.saveSettings({ ...this.settings });
    this.saved = true;
    setTimeout(() => this.saved = false, 2000);
  }
}
