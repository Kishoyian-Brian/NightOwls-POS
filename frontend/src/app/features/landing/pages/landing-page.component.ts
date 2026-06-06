import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { AuthService } from '../../../core/authentication/services/auth.service';

@Component({
  selector: 'app-landing-page',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './landing-page.component.html',
  styles: [`.flipped { transform: rotateY(180deg); }`]
})
export class LandingPageComponent {
  activeCard: 'food' | 'drinks' | null = null;
  pin: string[] = [];
  pinError = '';

  constructor(private auth: AuthService, private router: Router) {}

  selectCard(card: 'food' | 'drinks'): void {
    this.activeCard = card;
    this.pin = [];
    this.pinError = '';
  }

  cancel(): void {
    this.activeCard = null;
    this.pin = [];
    this.pinError = '';
  }

  addDigit(digit: string): void {
    if (this.pin.length < 4) {
      this.pin.push(digit);
      if (this.pin.length === 4) this.submitPin();
    }
  }

  removeDigit(): void {
    this.pin.pop();
    this.pinError = '';
  }

  submitPin(): void {
    const password = this.pin.join('');
    const username = this.activeCard === 'food' ? 'waiter' : 'bar';
    const success = this.auth.login(username, password);
    if (success) {
      this.router.navigate(['/' + this.auth.getCurrentUser()!.role]);
    } else {
      this.pinError = 'Incorrect PIN';
      this.pin = [];
    }
  }
}