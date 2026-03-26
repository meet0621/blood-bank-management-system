import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-empty-state',
    imports: [CommonModule],
    template: `
    <div class="empty-state">
      <div class="empty-state-icon">
        <i class="bi" [ngClass]="icon"></i>
      </div>
      <h4>{{ title }}</h4>
      <p>{{ message }}</p>
      <ng-content></ng-content>
    </div>
  `
})
export class EmptyStateComponent {
    @Input() icon = 'bi-inbox';
    @Input() title = 'No data found';
    @Input() message = 'There is nothing to display yet.';
}
