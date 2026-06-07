import { CommonModule } from "@angular/common";
import { Component } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { Router, RouterLink } from "@angular/router";
import { AuthService } from "../../../core/authentication/services/auth.service";
import { LoginRole } from "../../../core/authentication/models/user.model";

@Component({
  selector: 'app-login-page',
  templateUrl: './login-page.component.html',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink]
})
export class LoginPageComponent {
  username = '';
  password = '';
  error = '';
  showPassword = false;

  constructor(private auth: AuthService, private router: Router) {}

  onLogin(): void {
    this.error = '';
    if (!this.username || !this.password) {
      this.error = 'Please enter username and password.';
      return;
    }
    const result = this.auth.login(this.username, this.password);
    if (result === 'ok') {
      const user = this.auth.getCurrentUser()!;
      this.router.navigate([this.auth.homeRouteFor(user.role as LoginRole)]);
    } else if (result === 'no-access') {
      this.error = 'Only waiter, bartender, kitchen, store, and manager accounts can sign in.';
    } else {
      this.error = 'Invalid username or password.';
    }
  }
}
