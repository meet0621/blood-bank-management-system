import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-confirm-modal',
    imports: [CommonModule],
    template: `
    @if (show) {
    <div class="modal-overlay" (click)="onCancel()">
      <div class="modal-container" style="max-width:420px" (click)="$event.stopPropagation()">
        <div class="confirm-modal-body">
          <div class="confirm-modal-icon" [ngClass]="variant">
            <i class="bi" [ngClass]="iconClass"></i>
          </div>
          <h4>{{ title }}</h4>
          <p>{{ message }}</p>
        </div>
        <div class="modal-footer-custom" style="justify-content:center">
          <button class="btn-secondary-custom" (click)="onCancel()">Cancel</button>
          <button [ngClass]="variant === 'danger' ? 'btn-danger-custom' : 'btn-primary-custom'" (click)="onConfirm()">
            {{ confirmText }}
          </button>
        </div>
      </div>
    </div>
    }
  `
})
export class ConfirmModalComponent {
    @Input() show = false;
    @Input() title = 'Are you sure?';
    @Input() message = 'This action cannot be undone.';
    @Input() confirmText = 'Confirm';
    @Input() variant: 'danger' | 'warning' | 'info' = 'danger';

    @Output() confirmed = new EventEmitter<void>();
    @Output() cancelled = new EventEmitter<void>();

    get iconClass(): string {
        switch (this.variant) {
            case 'danger': return 'bi-exclamation-triangle-fill';
            case 'warning': return 'bi-question-circle-fill';
            case 'info': return 'bi-info-circle-fill';
        }
    }

    onConfirm() { this.confirmed.emit(); }
    onCancel() { this.cancelled.emit(); }
}
