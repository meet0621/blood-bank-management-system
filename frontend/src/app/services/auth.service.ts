import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';

export interface AuthUser {
    _id: string;
    name: string;
    email: string;
    role: 'Admin' | 'Staff' | 'Donor';
    donorId?: string;
}

export interface LoginResponse {
    success: boolean;
    message: string;
    data: AuthUser;
    token: string;
}

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private apiUrl = `${environment.apiUrl}/auth`;
    private currentUserSubject = new BehaviorSubject<AuthUser | null>(this.getStoredUser());
    currentUser$ = this.currentUserSubject.asObservable();

    constructor(private http: HttpClient, private router: Router) { }

    /**
     * Login with email/password
     */
    login(email: string, password: string): Observable<LoginResponse> {
        return this.http.post<LoginResponse>(`${this.apiUrl}/login`, { email, password })
            .pipe(
                tap(response => {
                    if (response.success && response.token) {
                        localStorage.setItem('bb_token', response.token);
                        localStorage.setItem('bb_user', JSON.stringify(response.data));
                        this.currentUserSubject.next(response.data);
                    }
                })
            );
    }

    /**
     * Register new user
     */
    register(userData: { name: string; email: string; password: string; role?: string }): Observable<LoginResponse> {
        return this.http.post<LoginResponse>(`${this.apiUrl}/register`, userData)
            .pipe(
                tap(response => {
                    if (response.success && response.token) {
                        localStorage.setItem('bb_token', response.token);
                        localStorage.setItem('bb_user', JSON.stringify(response.data));
                        this.currentUserSubject.next(response.data);
                    }
                })
            );
    }

    /**
     * Logout user
     */
    logout(): void {
        localStorage.removeItem('bb_token');
        localStorage.removeItem('bb_user');
        this.currentUserSubject.next(null);
        this.router.navigate(['/login']);
    }

    /**
     * Get the current JWT token
     */
    getToken(): string | null {
        return localStorage.getItem('bb_token');
    }

    /**
     * Check if user is logged in
     */
    isLoggedIn(): boolean {
        return !!this.getToken();
    }

    /**
     * Get user role
     */
    getUserRole(): string | null {
        const user = this.currentUserSubject.value;
        return user ? user.role : null;
    }

    /**
     * Get the current user
     */
    getCurrentUser(): AuthUser | null {
        return this.currentUserSubject.value;
    }

    /**
     * Check if user has one of the given roles
     */
    hasRole(...roles: string[]): boolean {
        const role = this.getUserRole();
        return role ? roles.includes(role) : false;
    }

    /**
     * Get user initials for avatar
     */
    getUserInitials(): string {
        const user = this.currentUserSubject.value;
        if (!user) return '??';
        const parts = user.name.split(' ');
        return parts.length >= 2
            ? (parts[0][0] + parts[1][0]).toUpperCase()
            : user.name.substring(0, 2).toUpperCase();
    }

    /**
     * Retrieve stored user from localStorage
     */
    private getStoredUser(): AuthUser | null {
        try {
            const stored = localStorage.getItem('bb_user');
            return stored ? JSON.parse(stored) : null;
        } catch {
            return null;
        }
    }
}
