import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { ToastService, Toast } from '../../services/toast.service';

@Component({
    selector: 'app-toast',
    imports: [CommonModule],
    template: `
    <div class="toast-wrapper">
      @for (toast of toasts; track toast) {
      <div class="toast-item" [ngClass]="toast.type">
        <i class="bi" [ngClass]="getIcon(toast.type)"></i>
        <span class="toast-msg">{{ toast.message }}</span>
        <button class="toast-close" (click)="removeToast(toast)">
          <i class="bi bi-x-lg"></i>
        </button>
      </div>
      }
    </div>
  `
})
export class ToastComponent implements OnInit, OnDestroy {
    toasts: Toast[] = [];
    private subscription?: Subscription;

    constructor(private toastService: ToastService) { }

    ngOnInit() {
        this.subscription = this.toastService.toast$.subscribe(toast => {
            this.toasts.push(toast);
            setTimeout(() => this.removeToast(toast), toast.duration || 3000);
        });
    }

    ngOnDestroy() { this.subscription?.unsubscribe(); }

    removeToast(toast: Toast) {
        this.toasts = this.toasts.filter(t => t !== toast);
    }

    getIcon(type: string): string {
        switch (type) {
            case 'success': return 'bi-check-circle-fill';
            case 'error': return 'bi-x-circle-fill';
            case 'warning': return 'bi-exclamation-triangle-fill';
            case 'info': return 'bi-info-circle-fill';
            default: return 'bi-info-circle-fill';
        }
    }
}
