import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DonorPortalService } from '../../services/donor-portal.service';
import { AuthService } from '../../services/auth.service';
import { ToastService } from '../../services/toast.service';
import { fadeInUp, staggerList } from '../../animations';

@Component({
    selector: 'app-donor-portal',
    imports: [CommonModule, FormsModule],
    templateUrl: './donor-portal.html',
    styleUrl: './donor-portal.css',
    animations: [fadeInUp, staggerList]
})
export class DonorPortalComponent implements OnInit {
    activeTab: 'overview' | 'history' | 'appointments' = 'overview';
    loading = true;

    // Profile
    donor: any = null;
    stats: any = { totalDonations: 0, livesSaved: 0, bloodGroup: '' };

    // History
    donationHistory: any[] = [];
    historyLoading = false;

    // Appointments
    appointments: any[] = [];
    appointmentsLoading = false;
    showBookModal = false;
    bookingForm = { date: '', timeSlot: '09:00 - 10:00', notes: '' };
    timeSlots = [
        '09:00 - 10:00', '10:00 - 11:00', '11:00 - 12:00',
        '12:00 - 13:00', '14:00 - 15:00', '15:00 - 16:00', '16:00 - 17:00'
    ];

    userName = '';

    constructor(
        private portalService: DonorPortalService,
        private authService: AuthService,
        private toastService: ToastService
    ) { }

    ngOnInit() {
        const user = this.authService.getCurrentUser();
        this.userName = user?.name || 'Donor';
        this.loadProfile();
    }

    loadProfile() {
        this.loading = true;
        this.portalService.getProfile().subscribe({
            next: (res) => {
                this.donor = res.data.donor;
                this.stats = res.data.stats;
                this.loading = false;
            },
            error: (err) => {
                this.toastService.error(err.error?.message || 'Failed to load profile');
                this.loading = false;
            }
        });
    }

    switchTab(tab: 'overview' | 'history' | 'appointments') {
        this.activeTab = tab;
        if (tab === 'history' && this.donationHistory.length === 0) {
            this.loadHistory();
        }
        if (tab === 'appointments' && this.appointments.length === 0) {
            this.loadAppointments();
        }
    }

    loadHistory() {
        this.historyLoading = true;
        this.portalService.getDonationHistory().subscribe({
            next: (res) => { this.donationHistory = res.data; this.historyLoading = false; },
            error: () => { this.historyLoading = false; }
        });
    }

    loadAppointments() {
        this.appointmentsLoading = true;
        this.portalService.getAppointments().subscribe({
            next: (res) => { this.appointments = res.data; this.appointmentsLoading = false; },
            error: () => { this.appointmentsLoading = false; }
        });
    }

    downloadCertificate(donationId: string) {
        this.portalService.downloadCertificate(donationId).subscribe({
            next: (blob) => {
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `donation_certificate.pdf`;
                a.click();
                window.URL.revokeObjectURL(url);
                this.toastService.success('Certificate downloaded!');
            },
            error: () => this.toastService.error('Failed to download certificate')
        });
    }

    bookAppointment() {
        if (!this.bookingForm.date || !this.bookingForm.timeSlot) return;
        this.portalService.bookAppointment(this.bookingForm).subscribe({
            next: (res) => {
                this.toastService.success(res.message || 'Appointment booked!');
                this.showBookModal = false;
                this.bookingForm = { date: '', timeSlot: '09:00 - 10:00', notes: '' };
                this.loadAppointments();
            },
            error: (err) => this.toastService.error(err.error?.message || 'Failed to book appointment')
        });
    }

    logout() {
        this.authService.logout();
    }
}
