import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

export interface Toast {
    message: string;
    type: 'success' | 'error' | 'info' | 'warning';
    duration?: number;
}

/**
 * Toast Service
 * Manages toast notifications across the application
 */
@Injectable({
    providedIn: 'root'
})
export class ToastService {
    private toastSubject = new Subject<Toast>();
    public toast$ = this.toastSubject.asObservable();

    /**
     * Show a toast notification
     */
    show(message: string, type: Toast['type'] = 'info', duration: number = 3000) {
        this.toastSubject.next({ message, type, duration });
    }

    /**
     * Show success toast
     */
    success(message: string, duration?: number) {
        this.show(message, 'success', duration);
    }

    /**
     * Show error toast
     */
    error(message: string, duration?: number) {
        this.show(message, 'error', duration);
    }

    /**
     * Show info toast
     */
    info(message: string, duration?: number) {
        this.show(message, 'info', duration);
    }

    /**
     * Show warning toast
     */
    warning(message: string, duration?: number) {
        this.show(message, 'warning', duration);
    }
}
