import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-skeleton-loader',
    imports: [CommonModule],
    template: `
    @if (type === 'cards') {
    <div class="grid-cols-4" style="margin-bottom:20px">
      @for (i of [1,2,3,4]; track i) {
      <div class="skeleton skeleton-card"></div>
      }
    </div>
    }
    @if (type === 'table') {
    <div class="card-custom">
      <div class="card-custom-body">
        @for (i of rows; track i) {
        <div class="skeleton-table-row">
          <span class="skeleton" style="flex:0.5"></span>
          <span class="skeleton" style="flex:1.5"></span>
          <span class="skeleton" style="flex:0.8"></span>
          <span class="skeleton" style="flex:0.6"></span>
          <span class="skeleton" style="flex:0.8"></span>
        </div>
        }
      </div>
    </div>
    }
    @if (type === 'chart') {
    <div class="card-custom">
      <div class="card-custom-body">
        <div class="skeleton" style="height:280px;border-radius:var(--radius-md)"></div>
      </div>
    </div>
    }
  `
})
export class SkeletonLoaderComponent {
    @Input() type: 'cards' | 'table' | 'chart' = 'table';
    @Input() count = 5;

    get rows(): number[] {
        return Array.from({ length: this.count }, (_, i) => i);
    }
}
