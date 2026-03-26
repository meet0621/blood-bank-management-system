import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ThemeService } from '../../services/theme.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-navbar',
  imports: [RouterLink, RouterLinkActive, CommonModule],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css'
})
export class NavbarComponent {
  isCollapsed = true;

  constructor(
    public themeService: ThemeService,
    public authService: AuthService,
    private router: Router,
  ) { }

  toggleTheme() {
    this.themeService.toggle();
  }

  logout() {
    this.authService.logout();
    this.isCollapsed = true;
  }

  /**
   * Check if current user has at least one of the given roles
   */
  hasRole(...roles: string[]): boolean {
    return this.authService.hasRole(...roles);
  }
}
