import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AppointmentService } from '../../services/appointment.service';
import { DonorService } from '../../services/donor.service';
import { ToastService } from '../../services/toast.service';
import { Appointment, TimeSlot, Donor } from '../../models/models';
import { fadeInUp, staggerList } from '../../animations';

@Component({
    selector: 'app-appointments',
    imports: [CommonModule, FormsModule],
    templateUrl: './appointments.html',
    styleUrl: './appointments.css',
    animations: [fadeInUp, staggerList],
})
export class AppointmentsComponent implements OnInit {
    appointments: Appointment[] = [];
    donors: Donor[] = [];
    availableSlots: TimeSlot[] = [];
    isLoading = true;

    // Filters
    filterDate = '';
    filterStatus = '';

    // Form
    showForm = false;
    formData = {
        donorId: '',
        date: '',
        timeSlot: '',
        notes: '',
    };

    constructor(
        private aptService: AppointmentService,
        private donorService: DonorService,
        private toast: ToastService,
    ) { }

    ngOnInit(): void {
        this.loadAppointments();
        this.loadDonors();
    }

    loadAppointments(): void {
        this.isLoading = true;
        const filters: any = {};
        if (this.filterDate) filters.date = this.filterDate;
        if (this.filterStatus) filters.status = this.filterStatus;

        this.aptService.getAll(filters).subscribe({
            next: (res) => { this.appointments = res.data; this.isLoading = false; },
            error: () => { this.toast.show('Failed to load appointments', 'error'); this.isLoading = false; },
        });
    }

    loadDonors(): void {
        this.donorService.getAllDonors().subscribe({
            next: (res: any) => { this.donors = res.data || res; },
        });
    }

    onDateSelected(): void {
        if (this.formData.date) {
            this.aptService.getAvailableSlots(this.formData.date).subscribe({
                next: (res) => { this.availableSlots = res.data; },
            });
        }
    }

    applyFilters(): void {
        this.loadAppointments();
    }

    resetFilters(): void {
        this.filterDate = '';
        this.filterStatus = '';
        this.loadAppointments();
    }

    openForm(): void {
        this.showForm = true;
        this.formData = { donorId: '', date: '', timeSlot: '', notes: '' };
        this.availableSlots = [];
    }

    closeForm(): void {
        this.showForm = false;
    }

    createAppointment(): void {
        if (!this.formData.donorId || !this.formData.date || !this.formData.timeSlot) {
            this.toast.show('Please fill all required fields', 'warning');
            return;
        }

        this.aptService.create(this.formData).subscribe({
            next: () => {
                this.toast.show('Appointment scheduled!', 'success');
                this.showForm = false;
                this.loadAppointments();
            },
            error: (err) => this.toast.show(err.error?.message || 'Failed to create', 'error'),
        });
    }

    updateStatus(apt: Appointment, status: string): void {
        this.aptService.update(apt._id!, { status: status as any }).subscribe({
            next: () => {
                this.toast.show(`Appointment ${status.toLowerCase()}`, 'success');
                this.loadAppointments();
            },
            error: () => this.toast.show('Failed to update', 'error'),
        });
    }

    deleteAppointment(apt: Appointment): void {
        if (!confirm('Delete this appointment?')) return;
        this.aptService.delete(apt._id!).subscribe({
            next: () => { this.toast.show('Appointment deleted', 'success'); this.loadAppointments(); },
            error: () => this.toast.show('Failed to delete', 'error'),
        });
    }

    getDonorName(donorId: string | Donor): string {
        if (typeof donorId === 'object') return (donorId as Donor).name;
        const d = this.donors.find(d => d._id === donorId);
        return d ? d.name : donorId;
    }

    getDonorBloodGroup(donorId: string | Donor): string {
        if (typeof donorId === 'object') return (donorId as Donor).bloodGroup;
        const d = this.donors.find(d => d._id === donorId);
        return d ? d.bloodGroup : '';
    }

    getStatusBadge(status: string): string {
        switch (status) {
            case 'Scheduled': return 'badge-warning';
            case 'Completed': return 'badge-success';
            case 'Cancelled': return 'badge-danger';
            default: return 'badge-secondary';
        }
    }

    formatDate(date: Date | string): string {
        return new Date(date).toLocaleDateString('en-IN', {
            day: '2-digit', month: 'short', year: 'numeric'
        });
    }
}
