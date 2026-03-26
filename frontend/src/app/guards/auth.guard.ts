import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

/**
 * Auth guard — redirects to /login if not authenticated
 */
export const authGuard: CanActivateFn = (route, state) => {
    const authService = inject(AuthService);
    const router = inject(Router);

    if (authService.isLoggedIn()) {
        // Check role-based access if route has data.roles
        const requiredRoles = route.data?.['roles'] as string[] | undefined;
        if (requiredRoles && requiredRoles.length > 0) {
            const userRole = authService.getUserRole();
            if (!userRole || !requiredRoles.includes(userRole)) {
                // User doesn't have required role — redirect to dashboard
                router.navigate(['/dashboard']);
                return false;
            }
        }
        return true;
    }

    // Not logged in — redirect to login with return URL
    router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
    return false;
};
