import { Component, OnInit, AfterViewInit, OnDestroy, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Chart, registerables } from 'chart.js';
import { ReportService } from '../../services/report.service';
import { ExpiryService } from '../../services/expiry.service';
import { AppointmentService } from '../../services/appointment.service';
import { TransferService } from '../../services/transfer.service';
import { DashboardStats, BloodUnit, Appointment, BloodTransfer } from '../../models/models';
import { SkeletonLoaderComponent } from '../shared/skeleton-loader';
import { ToastService } from '../../services/toast.service';
import { ThemeService } from '../../services/theme.service';
import { fadeInUp, staggerList } from '../../animations';
import { SocketService } from '../../services/socket.service';
import { Subscription } from 'rxjs';

Chart.register(...registerables);

@Component({
    selector: 'app-dashboard',
    imports: [CommonModule, RouterLink, SkeletonLoaderComponent],
    templateUrl: './dashboard.html',
    styleUrl: './dashboard.css',
    animations: [fadeInUp, staggerList]
})
export class DashboardComponent implements OnInit, AfterViewInit, OnDestroy {
    @ViewChild('inventoryChart') inventoryChartRef!: ElementRef;

    stats: DashboardStats | null = null;
    loading = true;
    inventoryChart: any;
    expiringUnits: BloodUnit[] = [];
    todaysAppointments: Appointment[] = [];
    pendingTransfers: BloodTransfer[] = [];

    // For count-up animation
    displayDonors = 0;
    displayPatients = 0;
    displayUnits = 0;
    displayGroups = 0;

    private subs: Subscription[] = [];

    constructor(
        private reportService: ReportService,
        private expiryService: ExpiryService,
        private appointmentService: AppointmentService,
        private transferService: TransferService,
        private toastService: ToastService,
        private themeService: ThemeService,
        private socketService: SocketService
    ) { }

    ngOnInit() {
        this.loadDashboardData();
        this.loadTodaysAppointments();
        this.loadPendingTransfers();

        // Connect Socket.io and listen for real-time changes
        this.socketService.connect();
        this.subs.push(
            this.socketService.inventoryChange$.subscribe(() => this.loadDashboardData()),
            this.socketService.donorChange$.subscribe(() => this.loadDashboardData()),
            this.socketService.patientChange$.subscribe(() => this.loadDashboardData()),
            this.socketService.transferChange$.subscribe(() => this.loadPendingTransfers()),
            this.socketService.appointmentChange$.subscribe(() => this.loadTodaysAppointments()),
        );
    }

    ngOnDestroy() {
        this.subs.forEach(s => s.unsubscribe());
    }

    ngAfterViewInit() { }

    loadDashboardData() {
        this.loading = true;
        this.reportService.getDashboardStats().subscribe({
            next: (response) => {
                this.stats = response.data;
                this.loading = false;
                setTimeout(() => {
                    this.createInventoryChart();
                    this.animateNumbers();
                }, 150);
                // Load expiring units
                this.loadExpiringUnits();
            },
            error: (error) => {
                console.error('Error loading dashboard:', error);
                this.toastService.error('Failed to load dashboard data');
                this.loading = false;
            }
        });
    }

    loadExpiringUnits() {
        this.expiryService.getExpiringUnits(7).subscribe({
            next: (response) => {
                this.expiringUnits = response.data;
            },
            error: () => { } // Silent fail for expiry widget
        });
    }

    loadTodaysAppointments() {
        this.appointmentService.getToday().subscribe({
            next: (response) => {
                this.todaysAppointments = response.data;
            },
            error: () => { },
        });
    }

    loadPendingTransfers() {
        this.transferService.getPending().subscribe({
            next: (response) => {
                this.pendingTransfers = response.data;
            },
            error: () => { },
        });
    }

    transferHospitalName(h: any): string {
        return typeof h === 'string' ? h : (h?.name || 'Unknown');
    }

    flagExpired() {
        this.expiryService.flagExpiredUnits().subscribe({
            next: (response) => {
                this.toastService.success(response.message);
                this.loadDashboardData(); // Refresh
            },
            error: () => {
                this.toastService.error('Failed to flag expired units');
            }
        });
    }

    // Expiry badge helpers
    getExpiryBadgeClass(expiryDate: Date | string | undefined): string {
        if (!expiryDate) return 'badge-pending';
        const days = this.getDaysUntilExpiry(expiryDate);
        if (days <= 0) return 'badge-rejected';
        if (days <= 3) return 'badge-rejected';
        if (days <= 7) return 'badge-pending';
        return 'badge-approved';
    }

    getExpiryStatusClass(expiryDate: Date | string | undefined): string {
        return this.getExpiryBadgeClass(expiryDate);
    }

    getExpiryStatusText(expiryDate: Date | string | undefined): string {
        if (!expiryDate) return 'Unknown';
        const days = this.getDaysUntilExpiry(expiryDate);
        if (days <= 0) return '🔴 Expired';
        if (days <= 3) return '🔴 Critical';
        if (days <= 7) return '🟠 Expiring Soon';
        return '🟢 Valid';
    }

    getExpiryIcon(expiryDate: Date | string | undefined): string {
        if (!expiryDate) return '⏳';
        const days = this.getDaysUntilExpiry(expiryDate);
        if (days <= 0) return '🔴';
        if (days <= 3) return '🔴';
        if (days <= 7) return '🟠';
        return '🟢';
    }

    getDaysUntilExpiry(expiryDate: Date | string): number {
        const expiry = new Date(expiryDate);
        const now = new Date();
        return Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    }

    animateNumbers() {
        if (!this.stats) return;
        this.animateValue(0, this.stats.totalDonors, 1500, (val) => this.displayDonors = val);
        this.animateValue(0, this.stats.totalPatients, 1500, (val) => this.displayPatients = val);
        this.animateValue(0, this.stats.totalBloodUnits, 1500, (val) => this.displayUnits = val);
        this.animateValue(0, 8, 1000, (val) => this.displayGroups = val); // 8 blood groups
    }

    animateValue(start: number, end: number, duration: number, callback: (val: number) => void) {
        if (start === end) return;
        const range = end - start;
        let current = start;
        const increment = end > start ? 1 : -1;
        const stepTime = Math.abs(Math.floor(duration / range));

        const effectiveStepTime = Math.max(stepTime, 10);
        const effectiveIncrement = Math.ceil(range / (duration / effectiveStepTime));

        const timer = setInterval(() => {
            current += effectiveIncrement;
            if ((effectiveIncrement > 0 && current >= end) || (effectiveIncrement < 0 && current <= end)) {
                current = end;
                clearInterval(timer);
            }
            callback(current);
        }, effectiveStepTime);
    }

    get criticalStock(): any[] {
        if (!this.stats) return [];
        return this.stats.inventory.filter(item => item.quantity < 5);
    }

    get lowStock(): any[] {
        if (!this.stats) return [];
        return this.stats.inventory.filter(item => item.quantity >= 5 && item.quantity < 10);
    }

    createInventoryChart() {
        if (!this.stats || !this.inventoryChartRef) return;
        const ctx = this.inventoryChartRef.nativeElement.getContext('2d');
        if (this.inventoryChart) this.inventoryChart.destroy();

        // Aggregate inventory by blood group (sum all components)
        const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
        const groupedData = bloodGroups.map(bg => {
            const items = this.stats!.inventory.filter(i => i.bloodGroup === bg);
            return items.reduce((sum, i) => sum + i.quantity, 0);
        });

        const isDark = this.themeService.isDark;

        const backgroundColors = groupedData.map(q => {
            if (q >= 10) return 'rgba(16,185,129,0.75)';
            if (q >= 5) return 'rgba(245,158,11,0.75)';
            return 'rgba(239,68,68,0.75)';
        });
        const borderColors = groupedData.map(q => {
            if (q >= 10) return '#10B981';
            if (q >= 5) return '#F59E0B';
            return '#EF4444';
        });

        this.inventoryChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: bloodGroups,
                datasets: [{
                    label: 'Units Available',
                    data: groupedData,
                    backgroundColor: backgroundColors,
                    borderColor: borderColors,
                    borderWidth: 2,
                    borderRadius: 6,
                    borderSkipped: false
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    title: {
                        display: true,
                        text: 'Blood Inventory by Group (All Components)',
                        font: { size: 14, weight: 'bold', family: 'Inter' },
                        color: isDark ? '#F1F5F9' : '#1A1A2E',
                        padding: { bottom: 16 }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            stepSize: 5,
                            color: isDark ? '#94A3B8' : '#64748B',
                            font: { family: 'Inter' }
                        },
                        grid: { color: isDark ? 'rgba(51,65,85,0.5)' : 'rgba(226,232,240,0.8)' }
                    },
                    x: {
                        ticks: {
                            color: isDark ? '#94A3B8' : '#64748B',
                            font: { family: 'Inter', weight: 'bold' }
                        },
                        grid: { display: false }
                    }
                }
            }
        });
    }
}
