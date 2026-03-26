import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ToastService } from '../../services/toast.service';

@Component({
    selector: 'app-login',
    imports: [CommonModule, FormsModule, RouterLink],
    templateUrl: './login.html',
    styleUrl: './login.css'
})
export class LoginComponent {
    email = '';
    password = '';
    isLoading = false;
    showPassword = false;
    private returnUrl = '/dashboard';

    constructor(
        private authService: AuthService,
        private toastService: ToastService,
        private router: Router,
        private route: ActivatedRoute,
    ) {
        // If already logged in, redirect based on role
        if (this.authService.isLoggedIn()) {
            const role = this.authService.getUserRole();
            this.router.navigate([role === 'Donor' ? '/donor-portal' : '/dashboard']);
        }

        // Get return URL from query params
        this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/dashboard';
    }

    login(): void {
        if (!this.email || !this.password) {
            this.toastService.show('Please enter email and password', 'warning');
            return;
        }

        this.isLoading = true;
        this.authService.login(this.email, this.password).subscribe({
            next: (response) => {
                this.isLoading = false;
                this.toastService.show(`Welcome back, ${response.data.name}!`, 'success');
                if (response.data.role === 'Donor') {
                    this.router.navigate(['/donor-portal']);
                } else {
                    this.router.navigateByUrl(this.returnUrl);
                }
            },
            error: (error) => {
                this.isLoading = false;
                const message = error.error?.message || 'Login failed. Please try again.';
                this.toastService.show(message, 'error');
            }
        });
    }
}
