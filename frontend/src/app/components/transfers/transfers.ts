import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TransferService } from '../../services/transfer.service';
import { ToastService } from '../../services/toast.service';
import { BloodTransfer, Hospital, BLOOD_GROUPS } from '../../models/models';
import { SkeletonLoaderComponent } from '../shared/skeleton-loader';
import { fadeInUp, staggerList } from '../../animations';

@Component({
    selector: 'app-transfers',
    imports: [CommonModule, FormsModule, SkeletonLoaderComponent],
    templateUrl: './transfers.html',
    styleUrl: './transfers.css',
    animations: [fadeInUp, staggerList]
})
export class TransfersComponent implements OnInit {
    transfers: BloodTransfer[] = [];
    hospitals: Hospital[] = [];
    loading = true;
    showModal = false;
    editMode = false;
    statusFilter = '';
    bloodGroups = BLOOD_GROUPS;
    components = ['Whole Blood', 'Packed RBCs', 'Platelets', 'Fresh Frozen Plasma', 'Cryoprecipitate'];

    form: any = {
        fromHospital: '', toHospital: '', bloodGroup: 'A+', component: 'Whole Blood', units: 1, requestedBy: '', notes: '',
    };
    editId = '';

    constructor(
        private transferService: TransferService,
        private toastService: ToastService,
    ) { }

    ngOnInit() {
        this.loadTransfers();
        this.loadHospitals();
    }

    loadTransfers() {
        this.loading = true;
        this.transferService.getAll().subscribe({
            next: (res) => { this.transfers = res.data; this.loading = false; },
            error: () => { this.toastService.error('Failed to load transfers'); this.loading = false; },
        });
    }

    loadHospitals() {
        this.transferService.getHospitals().subscribe({
            next: (res) => { this.hospitals = res.data; },
            error: () => { },
        });
    }

    get filteredTransfers(): BloodTransfer[] {
        if (!this.statusFilter) return this.transfers;
        return this.transfers.filter(t => t.status === this.statusFilter);
    }

    get pendingCount(): number {
        return this.transfers.filter(t => t.status === 'Pending').length;
    }

    get totalUnitsTransferred(): number {
        return this.transfers.filter(t => t.status === 'Delivered' || t.status === 'Approved').reduce((sum, t) => sum + t.units, 0);
    }

    hospitalName(h: string | Hospital): string {
        return typeof h === 'string' ? h : (h?.name || 'Unknown');
    }

    openCreate() {
        this.editMode = false;
        this.form = { fromHospital: '', toHospital: '', bloodGroup: 'A+', component: 'Whole Blood', units: 1, requestedBy: '', notes: '' };
        this.showModal = true;
    }

    openEdit(transfer: BloodTransfer) {
        this.editMode = true;
        this.editId = transfer._id || '';
        const fromId = typeof transfer.fromHospital === 'string' ? transfer.fromHospital : transfer.fromHospital?._id || '';
        const toId = typeof transfer.toHospital === 'string' ? transfer.toHospital : transfer.toHospital?._id || '';
        this.form = {
            fromHospital: fromId, toHospital: toId, bloodGroup: transfer.bloodGroup,
            component: transfer.component, units: transfer.units, requestedBy: transfer.requestedBy || '', notes: transfer.notes || '',
        };
        this.showModal = true;
    }

    save() {
        if (this.editMode) {
            this.transferService.update(this.editId, this.form).subscribe({
                next: () => { this.toastService.show('Transfer updated', 'success'); this.showModal = false; this.loadTransfers(); },
                error: (err) => { this.toastService.show(err.error?.message || 'Update failed', 'error'); },
            });
        } else {
            this.transferService.create(this.form).subscribe({
                next: () => { this.toastService.show('Transfer request created', 'success'); this.showModal = false; this.loadTransfers(); },
                error: (err) => { this.toastService.show(err.error?.message || 'Create failed', 'error'); },
            });
        }
    }

    approve(id: string) {
        this.transferService.approve(id).subscribe({
            next: (res) => { this.toastService.show(res.message || 'Transfer approved', 'success'); this.loadTransfers(); },
            error: (err) => { this.toastService.show(err.error?.message || 'Approval failed', 'error'); },
        });
    }

    reject(id: string) {
        this.transferService.reject(id).subscribe({
            next: () => { this.toastService.show('Transfer rejected', 'success'); this.loadTransfers(); },
            error: (err) => { this.toastService.show(err.error?.message || 'Rejection failed', 'error'); },
        });
    }

    deleteTransfer(id: string) {
        this.transferService.delete(id).subscribe({
            next: () => { this.toastService.show('Transfer deleted', 'success'); this.loadTransfers(); },
            error: () => { this.toastService.show('Delete failed', 'error'); },
        });
    }
}
