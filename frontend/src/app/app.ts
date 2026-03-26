import { Component } from '@angular/core';
import { RouterOutlet, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { NavbarComponent } from './components/navbar/navbar';
import { ToastComponent } from './components/toast/toast';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, NavbarComponent, ToastComponent, CommonModule],
  template: `
    <app-navbar *ngIf="shouldShowNavbar()"></app-navbar>
    <router-outlet></router-outlet>
    <app-toast></app-toast>
  `,
  styles: []
})
export class AppComponent {
  title = 'Blood Bank Management System';

  constructor(private authService: AuthService, private router: Router) { }

  /**
   * Hide navbar on login page and when not logged in
   */
  shouldShowNavbar(): boolean {
    return this.authService.isLoggedIn() && !this.router.url.startsWith('/login');
  }
}
