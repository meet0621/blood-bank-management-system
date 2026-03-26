import { Component, OnInit, AfterViewInit, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Chart, registerables } from 'chart.js';
import { ReportService } from '../../services/report.service';
import { SkeletonLoaderComponent } from '../shared/skeleton-loader';
import { ToastService } from '../../services/toast.service';
import { ThemeService } from '../../services/theme.service';
import { fadeInUp, staggerList } from '../../animations';

Chart.register(...registerables);

@Component({
    selector: 'app-reports',
    imports: [CommonModule, SkeletonLoaderComponent],
    templateUrl: './reports.html',
    styleUrl: './reports.css',
    animations: [fadeInUp, staggerList]
})
export class ReportsComponent implements OnInit, AfterViewInit {
    @ViewChild('donationsChart') donationsChartRef!: ElementRef;
    @ViewChild('inventoryBarChart') inventoryBarChartRef!: ElementRef;
    @ViewChild('demandSupplyChart') demandSupplyChartRef!: ElementRef;
    @ViewChild('trendsChart') trendsChartRef!: ElementRef;
    @ViewChild('heatmapChart') heatmapChartRef!: ElementRef;

    inventoryReport: any = null;
    donationsReport: any = null;
    analyticsData: any = null;
    loading = true;
    exporting = false;

    donationsChart: any;
    inventoryBarChart: any;
    demandSupplyChart: any;
    trendsChart: any;
    heatmapChart: any;

    activeTab: 'inventory' | 'donations' | 'analytics' = 'inventory';

    constructor(
        private reportService: ReportService,
        private toastService: ToastService,
        private themeService: ThemeService
    ) { }

    ngOnInit() { this.loadReports(); }
    ngAfterViewInit() { }

    loadReports() {
        this.loading = true;
        Promise.all([
            this.reportService.getInventoryReport().toPromise(),
            this.reportService.getDonationsReport().toPromise(),
            this.reportService.getAnalytics().toPromise(),
        ]).then(([inventoryRes, donationsRes, analyticsRes]) => {
            this.inventoryReport = inventoryRes?.data;
            this.donationsReport = donationsRes?.data;
            this.analyticsData = analyticsRes?.data;
            this.loading = false;
            setTimeout(() => {
                this.createDonationsChart();
                this.createInventoryBarChart();
            }, 150);
        }).catch(() => {
            this.toastService.error('Failed to load reports');
            this.loading = false;
        });
    }

    switchTab(tab: 'inventory' | 'donations' | 'analytics') {
        this.activeTab = tab;
        setTimeout(() => {
            if (tab === 'donations') this.createDonationsChart();
            if (tab === 'inventory') this.createInventoryBarChart();
            if (tab === 'analytics') {
                this.createDemandSupplyChart();
                this.createTrendsChart();
                this.createHeatmapChart();
            }
        }, 100);
    }

    get highestBloodGroup(): any {
        if (!this.donationsReport?.donationsByBloodGroup?.length) return null;
        return this.donationsReport.donationsByBloodGroup.reduce((a: any, b: any) => a.count > b.count ? a : b);
    }

    // ── Export ──
    downloadPDF() {
        this.exporting = true;
        this.reportService.exportPDF().subscribe({
            next: (blob) => {
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'blood_bank_report.pdf';
                a.click();
                URL.revokeObjectURL(url);
                this.toastService.show('PDF downloaded!', 'success');
                this.exporting = false;
            },
            error: () => { this.toastService.show('PDF export failed', 'error'); this.exporting = false; },
        });
    }

    downloadExcel() {
        this.exporting = true;
        this.reportService.exportExcel().subscribe({
            next: (blob) => {
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'blood_bank_report.xlsx';
                a.click();
                URL.revokeObjectURL(url);
                this.toastService.show('Excel downloaded!', 'success');
                this.exporting = false;
            },
            error: () => { this.toastService.show('Excel export failed', 'error'); this.exporting = false; },
        });
    }

    // ── Charts ──
    createInventoryBarChart() {
        if (!this.inventoryReport || !this.inventoryBarChartRef) return;
        const ctx = this.inventoryBarChartRef.nativeElement.getContext('2d');
        if (this.inventoryBarChart) this.inventoryBarChart.destroy();
        const isDark = this.themeService.isDark;

        const labels = this.inventoryReport.inventory.map((i: any) => i.bloodGroup);
        const data = this.inventoryReport.inventory.map((i: any) => i.quantity);
        const colors = data.map((q: number) => q >= 10 ? 'rgba(16,185,129,0.7)' : q >= 5 ? 'rgba(245,158,11,0.7)' : 'rgba(239,68,68,0.7)');

        this.inventoryBarChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels,
                datasets: [{ label: 'Units', data, backgroundColor: colors, borderRadius: 6, borderSkipped: false }]
            },
            options: {
                responsive: true, maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                    y: { beginAtZero: true, ticks: { color: isDark ? '#94A3B8' : '#64748B' }, grid: { color: isDark ? 'rgba(51,65,85,0.5)' : 'rgba(226,232,240,0.8)' } },
                    x: { ticks: { color: isDark ? '#94A3B8' : '#64748B', font: { weight: 'bold' } }, grid: { display: false } }
                }
            }
        });
    }

    createDonationsChart() {
        if (!this.donationsReport || !this.donationsChartRef) return;
        const ctx = this.donationsChartRef.nativeElement.getContext('2d');
        if (this.donationsChart) this.donationsChart.destroy();
        const isDark = this.themeService.isDark;

        const labels = this.donationsReport.donationsByBloodGroup.map((i: any) => i.bloodGroup);
        const data = this.donationsReport.donationsByBloodGroup.map((i: any) => i.count);

        this.donationsChart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels,
                datasets: [{
                    data,
                    backgroundColor: [
                        'rgba(196,30,58,0.8)', 'rgba(239,68,68,0.7)', 'rgba(59,130,246,0.8)',
                        'rgba(245,158,11,0.8)', 'rgba(16,185,129,0.8)', 'rgba(124,58,237,0.8)',
                        'rgba(236,72,153,0.8)', 'rgba(148,163,184,0.7)'
                    ],
                    borderWidth: 2,
                    borderColor: isDark ? '#1E293B' : '#FFFFFF'
                }]
            },
            options: {
                responsive: true, maintainAspectRatio: false, cutout: '55%',
                plugins: {
                    legend: {
                        position: 'right',
                        labels: { color: isDark ? '#F1F5F9' : '#1A1A2E', font: { size: 12 }, padding: 16, usePointStyle: true }
                    }
                }
            }
        });
    }

    createDemandSupplyChart() {
        if (!this.analyticsData || !this.demandSupplyChartRef) return;
        const ctx = this.demandSupplyChartRef.nativeElement.getContext('2d');
        if (this.demandSupplyChart) this.demandSupplyChart.destroy();
        const isDark = this.themeService.isDark;

        const ds = this.analyticsData.demandVsSupply;
        this.demandSupplyChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ds.map((d: any) => d.bloodGroup),
                datasets: [
                    { label: 'Supply', data: ds.map((d: any) => d.supply), backgroundColor: 'rgba(16,185,129,0.7)', borderRadius: 4, borderSkipped: false },
                    { label: 'Demand', data: ds.map((d: any) => d.demand), backgroundColor: 'rgba(239,68,68,0.7)', borderRadius: 4, borderSkipped: false },
                ]
            },
            options: {
                responsive: true, maintainAspectRatio: false,
                plugins: { legend: { labels: { color: isDark ? '#F1F5F9' : '#1A1A2E', usePointStyle: true, padding: 16 } } },
                scales: {
                    y: { beginAtZero: true, ticks: { color: isDark ? '#94A3B8' : '#64748B' }, grid: { color: isDark ? 'rgba(51,65,85,0.5)' : 'rgba(226,232,240,0.8)' } },
                    x: { ticks: { color: isDark ? '#94A3B8' : '#64748B', font: { weight: 'bold' } }, grid: { display: false } }
                }
            }
        });
    }

    createTrendsChart() {
        if (!this.analyticsData || !this.trendsChartRef) return;
        const ctx = this.trendsChartRef.nativeElement.getContext('2d');
        if (this.trendsChart) this.trendsChart.destroy();
        const isDark = this.themeService.isDark;

        const trends = this.analyticsData.donationTrends;
        this.trendsChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: trends.labels,
                datasets: [{
                    label: 'Donations',
                    data: trends.data,
                    borderColor: '#C41E3A',
                    backgroundColor: 'rgba(196,30,58,0.1)',
                    fill: true,
                    tension: 0.4,
                    pointBackgroundColor: '#C41E3A',
                    pointRadius: 5,
                    pointHoverRadius: 7,
                }]
            },
            options: {
                responsive: true, maintainAspectRatio: false,
                plugins: { legend: { labels: { color: isDark ? '#F1F5F9' : '#1A1A2E', usePointStyle: true } } },
                scales: {
                    y: { beginAtZero: true, ticks: { color: isDark ? '#94A3B8' : '#64748B', stepSize: 1 }, grid: { color: isDark ? 'rgba(51,65,85,0.5)' : 'rgba(226,232,240,0.8)' } },
                    x: { ticks: { color: isDark ? '#94A3B8' : '#64748B' }, grid: { display: false } }
                }
            }
        });
    }

    createHeatmapChart() {
        if (!this.analyticsData || !this.heatmapChartRef) return;
        const ctx = this.heatmapChartRef.nativeElement.getContext('2d');
        if (this.heatmapChart) this.heatmapChart.destroy();
        const isDark = this.themeService.isDark;

        const colors = [
            'rgba(196,30,58,0.75)', 'rgba(239,68,68,0.7)', 'rgba(59,130,246,0.75)',
            'rgba(245,158,11,0.75)', 'rgba(16,185,129,0.75)', 'rgba(124,58,237,0.75)',
            'rgba(236,72,153,0.75)', 'rgba(148,163,184,0.7)'
        ];

        const datasets = this.analyticsData.heatmapData.map((bg: any, i: number) => ({
            label: bg.bloodGroup,
            data: bg.data,
            backgroundColor: colors[i % colors.length],
            borderRadius: 3,
            borderSkipped: false,
        }));

        this.heatmapChart = new Chart(ctx, {
            type: 'bar',
            data: { labels: this.analyticsData.monthLabels, datasets },
            options: {
                responsive: true, maintainAspectRatio: false,
                plugins: { legend: { labels: { color: isDark ? '#F1F5F9' : '#1A1A2E', usePointStyle: true, font: { size: 11 } } } },
                scales: {
                    y: { beginAtZero: true, stacked: true, ticks: { color: isDark ? '#94A3B8' : '#64748B' }, grid: { color: isDark ? 'rgba(51,65,85,0.5)' : 'rgba(226,232,240,0.8)' } },
                    x: { stacked: true, ticks: { color: isDark ? '#94A3B8' : '#64748B' }, grid: { display: false } }
                }
            }
        });
    }
}
