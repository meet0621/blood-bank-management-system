import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BloodBankService } from '../../services/blood-bank.service';
import { ExpiryService } from '../../services/expiry.service';
import { BloodBank, BloodUnit, ComponentInventoryGroup } from '../../models/models';
import { SkeletonLoaderComponent } from '../shared/skeleton-loader';
import { ToastService } from '../../services/toast.service';
import { fadeInUp, staggerList } from '../../animations';

@Component({
  selector: 'app-inventory',
  imports: [CommonModule, SkeletonLoaderComponent],
  templateUrl: './inventory.html',
  styleUrl: './inventory.css',
  animations: [fadeInUp, staggerList]
})
export class InventoryComponent implements OnInit {
  bloodBank: BloodBank | null = null;
  componentInventory: ComponentInventoryGroup[] = [];
  expiringUnits: BloodUnit[] = [];
  loading = true;
  maxQuantity = 20;
  viewMode: 'grouped' | 'detailed' = 'grouped';

  constructor(
    private bloodBankService: BloodBankService,
    private expiryService: ExpiryService,
    private toastService: ToastService
  ) { }

  ngOnInit() { this.loadInventory(); }

  loadInventory() {
    this.loading = true;
    this.bloodBankService.getInventory().subscribe({
      next: (response) => {
        this.bloodBank = response.data;
        if (this.bloodBank?.inventory) {
          const maxQ = Math.max(...this.bloodBank.inventory.map(i => i.quantity));
          this.maxQuantity = Math.max(maxQ + 5, 20);
        }
        this.loading = false;
      },
      error: () => { this.toastService.error('Failed to load inventory'); this.loading = false; }
    });

    this.bloodBankService.getComponentInventory().subscribe({
      next: (response) => {
        this.componentInventory = response.data.inventory;
      },
      error: () => { }
    });

    this.expiryService.getExpiringUnits(7).subscribe({
      next: (response) => {
        this.expiringUnits = response.data;
      },
      error: () => { }
    });
  }

  flagExpired() {
    this.expiryService.flagExpiredUnits().subscribe({
      next: (response) => {
        this.toastService.success(response.message);
        this.loadInventory();
      },
      error: () => { this.toastService.error('Failed to flag expired units'); }
    });
  }

  // Aggregate inventory by blood group
  get groupedInventory(): { bloodGroup: string; totalQuantity: number }[] {
    if (!this.bloodBank) return [];
    const groups: Record<string, number> = {};
    for (const item of this.bloodBank.inventory) {
      const bg = item.bloodGroup;
      groups[bg] = (groups[bg] || 0) + item.quantity;
    }
    return Object.entries(groups).map(([bloodGroup, totalQuantity]) => ({ bloodGroup, totalQuantity }));
  }

  getProgressWidth(quantity: number): number {
    return Math.min((quantity / this.maxQuantity) * 100, 100);
  }

  getStockLevel(quantity: number): 'high' | 'medium' | 'low' {
    if (quantity >= 10) return 'high';
    if (quantity >= 5) return 'medium';
    return 'low';
  }

  getStatusText(quantity: number): string {
    if (quantity >= 10) return 'Adequate';
    if (quantity >= 5) return 'Low Stock';
    return 'Critical';
  }

  getStatusIcon(quantity: number): string {
    if (quantity >= 10) return 'bi-check-circle-fill';
    if (quantity >= 5) return 'bi-exclamation-circle-fill';
    return 'bi-exclamation-triangle-fill';
  }

  getExpiryStatusText(expiryDate: Date | string | undefined): string {
    if (!expiryDate) return 'Unknown';
    const days = this.getDaysUntilExpiry(expiryDate);
    if (days <= 0) return '🔴 Expired';
    if (days <= 3) return '🔴 Critical';
    if (days <= 7) return '🟠 Expiring Soon';
    return '🟢 Valid';
  }

  getExpiryBadgeClass(expiryDate: Date | string | undefined): string {
    if (!expiryDate) return 'badge-pending';
    const days = this.getDaysUntilExpiry(expiryDate);
    if (days <= 3) return 'badge-rejected';
    if (days <= 7) return 'badge-pending';
    return 'badge-approved';
  }

  getDaysUntilExpiry(expiryDate: Date | string): number {
    const expiry = new Date(expiryDate);
    const now = new Date();
    return Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  }

  get totalUnits(): number {
    if (!this.bloodBank) return 0;
    return this.bloodBank.inventory.reduce((sum, i) => sum + i.quantity, 0);
  }

  get criticalItems(): any[] {
    return this.groupedInventory.filter(i => i.totalQuantity < 5);
  }

  get adequateItems(): any[] {
    return this.groupedInventory.filter(i => i.totalQuantity >= 10);
  }
}
