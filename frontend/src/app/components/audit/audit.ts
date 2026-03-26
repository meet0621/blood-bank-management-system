import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuditService } from '../../services/audit.service';
import { SocketService } from '../../services/socket.service';
import { ToastService } from '../../services/toast.service';
import { Subscription } from 'rxjs';
import { fadeInUp, staggerList } from '../../animations';

@Component({
    selector: 'app-audit',
    imports: [CommonModule, FormsModule],
    templateUrl: './audit.html',
    styleUrl: './audit.css',
    animations: [fadeInUp, staggerList]
})
export class AuditComponent implements OnInit, OnDestroy {
    logs: any[] = [];
    stats: any = { total: 0, todayCount: 0, byAction: [], byEntity: [] };
    loading = true;
    private auditSub?: Subscription;

    // Filters
    entityFilter = '';
    actionFilter = '';
    searchQuery = '';

    // Pagination
    currentPage = 1;
    totalPages = 1;
    totalItems = 0;
    pageSize = 20;

    entities = ['Donor', 'Patient', 'BloodUnit', 'Inventory', 'Appointment', 'Camp', 'Transfer', 'User', 'System'];
    actions = ['CREATE', 'UPDATE', 'DELETE', 'APPROVE', 'REJECT', 'BLOOD_REQUEST', 'TRANSFER', 'FLAG_EXPIRED', 'LOGIN', 'REGISTER'];

    constructor(
        private auditService: AuditService,
        private socketService: SocketService,
        private toastService: ToastService
    ) { }

    ngOnInit() {
        this.loadLogs();
        this.loadStats();

        // Real-time updates
        this.auditSub = this.socketService.audit$.subscribe(() => {
            this.loadLogs();
            this.loadStats();
        });
    }

    ngOnDestroy() {
        this.auditSub?.unsubscribe();
    }

    loadLogs() {
        this.loading = true;
        this.auditService.getLogs({
            entity: this.entityFilter || undefined,
            action: this.actionFilter || undefined,
            search: this.searchQuery || undefined,
            page: this.currentPage,
            limit: this.pageSize,
        }).subscribe({
            next: (res) => {
                this.logs = res.data;
                this.totalPages = res.pagination.pages;
                this.totalItems = res.pagination.total;
                this.loading = false;
            },
            error: () => {
                this.toastService.error('Failed to load audit logs');
                this.loading = false;
            }
        });
    }

    loadStats() {
        this.auditService.getStats().subscribe({
            next: (res) => { this.stats = res.data; },
            error: () => { }
        });
    }

    applyFilters() {
        this.currentPage = 1;
        this.loadLogs();
    }

    clearFilters() {
        this.entityFilter = '';
        this.actionFilter = '';
        this.searchQuery = '';
        this.currentPage = 1;
        this.loadLogs();
    }

    goToPage(page: number) {
        if (page < 1 || page > this.totalPages) return;
        this.currentPage = page;
        this.loadLogs();
    }

    getActionIcon(action: string): string {
        const icons: Record<string, string> = {
            'CREATE': 'bi-plus-circle-fill',
            'UPDATE': 'bi-pencil-fill',
            'DELETE': 'bi-trash-fill',
            'APPROVE': 'bi-check-circle-fill',
            'REJECT': 'bi-x-circle-fill',
            'BLOOD_REQUEST': 'bi-droplet-half',
            'TRANSFER': 'bi-arrow-left-right',
            'FLAG_EXPIRED': 'bi-exclamation-triangle-fill',
            'LOGIN': 'bi-box-arrow-in-right',
            'REGISTER': 'bi-person-plus-fill',
        };
        return icons[action] || 'bi-circle';
    }

    getActionClass(action: string): string {
        const classes: Record<string, string> = {
            'CREATE': 'action-create',
            'UPDATE': 'action-update',
            'DELETE': 'action-delete',
            'APPROVE': 'action-approve',
            'REJECT': 'action-reject',
            'BLOOD_REQUEST': 'action-request',
            'TRANSFER': 'action-transfer',
            'FLAG_EXPIRED': 'action-expired',
        };
        return classes[action] || 'action-default';
    }
}
