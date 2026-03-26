import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PatientService } from '../../services/patient.service';
import { Patient, BLOOD_COMPONENTS } from '../../models/models';
import { SkeletonLoaderComponent } from '../shared/skeleton-loader';
import { EmptyStateComponent } from '../shared/empty-state';
import { ConfirmModalComponent } from '../shared/confirm-modal';
import { ToastService } from '../../services/toast.service';
import { fadeInUp, staggerList, scaleIn } from '../../animations';

@Component({
    selector: 'app-patients',
    imports: [CommonModule, FormsModule, SkeletonLoaderComponent, EmptyStateComponent, ConfirmModalComponent],
    templateUrl: './patients.html',
    styleUrl: './patients.css',
    animations: [fadeInUp, staggerList, scaleIn]
})
export class PatientsComponent implements OnInit {
    patients: Patient[] = [];
    loading = true;
    showAddForm = false;

    filterBloodGroup = '';
    searchName = '';

    bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
    genders = ['Male', 'Female', 'Other'];
    components = BLOOD_COMPONENTS;

    patientForm: Patient = this.getEmptyPatient();

    // Component selection for blood request
    requestComponent = 'Whole Blood';

    // Confirm modal state
    showConfirm = false;
    confirmTitle = '';
    confirmMessage = '';
    confirmVariant: 'danger' | 'warning' | 'info' = 'danger';
    confirmAction: (() => void) | null = null;

    constructor(
        private patientService: PatientService,
        private toastService: ToastService
    ) { }

    ngOnInit() { this.loadPatients(); }

    getEmptyPatient(): Patient {
        return { name: '', gender: 'Male', bloodGroup: 'A+', contact: '', component: 'Whole Blood' };
    }

    loadPatients() {
        this.loading = true;
        this.patientService.getAllPatients(this.filterBloodGroup, this.searchName).subscribe({
            next: (response) => { this.patients = response.data; this.loading = false; },
            error: () => { this.toastService.error('Failed to load patients'); this.loading = false; }
        });
    }

    applyFilters() { this.loadPatients(); }
    resetFilters() { this.searchName = ''; this.filterBloodGroup = ''; this.loadPatients(); }

    openAddForm() { this.showAddForm = true; this.patientForm = this.getEmptyPatient(); }
    closeForm() { this.showAddForm = false; this.patientForm = this.getEmptyPatient(); }

    savePatient() {
        this.patientService.createPatient(this.patientForm).subscribe({
            next: (response) => { this.toastService.success(response.message); this.loadPatients(); this.closeForm(); },
            error: () => this.toastService.error('Failed to add patient')
        });
    }

    requestBlood(patient: Patient) {
        if (!patient._id) return;
        this.requestComponent = patient.component || 'Whole Blood';
        this.confirmTitle = 'Request Blood';
        this.confirmMessage = `Request ${this.requestComponent} for ${patient.name} (${patient.bloodGroup})? This will deduct 1 unit from inventory if available.`;
        this.confirmVariant = 'warning';
        this.confirmAction = () => {
            this.patientService.requestBlood(patient._id!, this.requestComponent).subscribe({
                next: (response) => { this.toastService.success(response.message); this.loadPatients(); },
                error: () => this.toastService.error('Blood request failed')
            });
        };
        this.showConfirm = true;
    }

    deletePatient(patient: Patient) {
        if (!patient._id) return;
        this.confirmTitle = 'Delete Patient';
        this.confirmMessage = `Are you sure you want to delete "${patient.name}"? This action cannot be undone.`;
        this.confirmVariant = 'danger';
        this.confirmAction = () => {
            this.patientService.deletePatient(patient._id!).subscribe({
                next: () => { this.toastService.success('Patient deleted successfully'); this.loadPatients(); },
                error: () => this.toastService.error('Failed to delete patient')
            });
        };
        this.showConfirm = true;
    }

    onConfirm() {
        if (this.confirmAction) this.confirmAction();
        this.showConfirm = false;
        this.confirmAction = null;
    }

    onCancelConfirm() {
        this.showConfirm = false;
        this.confirmAction = null;
    }

    getStatusIcon(status?: string): string {
        switch (status) {
            case 'Approved': return 'bi-check-circle-fill';
            case 'Rejected': return 'bi-x-circle-fill';
            default: return 'bi-hourglass-split';
        }
    }

    getStatusClass(status?: string): string {
        switch (status) {
            case 'Approved': return 'badge-approved';
            case 'Rejected': return 'badge-rejected';
            default: return 'badge-pending';
        }
    }

    getUrgencyClass(urgency?: string): string {
        switch (urgency) {
            case 'Critical': return 'badge-rejected';
            case 'Urgent': return 'badge-pending';
            default: return 'badge-approved';
        }
    }

    getSourceClass(source?: string): string {
        return source === 'Public' ? 'badge-info' : 'badge-approved';
    }

    getInitialColor(name: string): string {
        return `hsl(${name.charCodeAt(0) * 37 % 360},55%,50%)`;
    }
}
