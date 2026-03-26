import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CampService } from '../../services/camp.service';
import { DonorService } from '../../services/donor.service';
import { ToastService } from '../../services/toast.service';
import { Camp, Donor, CampReport } from '../../models/models';
import { fadeInUp, staggerList } from '../../animations';

@Component({
    selector: 'app-camps',
    imports: [CommonModule, FormsModule],
    templateUrl: './camps.html',
    styleUrl: './camps.css',
    animations: [fadeInUp, staggerList],
})
export class CampsComponent implements OnInit {
    camps: Camp[] = [];
    donors: Donor[] = [];
    report: CampReport | null = null;
    isLoading = true;

    // Filter
    filterStatus = '';

    // Form
    showForm = false;
    editingCamp: Camp | null = null;
    formData = {
        campName: '',
        location: '',
        organizerName: '',
        date: '',
        targetUnits: 50,
        status: 'Upcoming' as 'Upcoming' | 'Ongoing' | 'Completed',
    };

    // Add donor modal
    showAddDonor = false;
    selectedCamp: Camp | null = null;
    addDonorId = '';

    constructor(
        private campService: CampService,
        private donorService: DonorService,
        private toast: ToastService,
    ) { }

    ngOnInit(): void {
        this.loadCamps();
        this.loadDonors();
        this.loadReport();
    }

    loadCamps(): void {
        this.isLoading = true;
        this.campService.getAll(this.filterStatus || undefined).subscribe({
            next: (res) => { this.camps = res.data; this.isLoading = false; },
            error: () => { this.toast.show('Failed to load camps', 'error'); this.isLoading = false; },
        });
    }

    loadDonors(): void {
        this.donorService.getAllDonors().subscribe({
            next: (res: any) => { this.donors = res.data || res; },
        });
    }

    loadReport(): void {
        this.campService.getReport().subscribe({
            next: (res) => { this.report = res.data; },
        });
    }

    applyFilter(): void {
        this.loadCamps();
    }

    openForm(camp?: Camp): void {
        this.showForm = true;
        if (camp) {
            this.editingCamp = camp;
            this.formData = {
                campName: camp.campName,
                location: camp.location,
                organizerName: camp.organizerName,
                date: new Date(camp.date).toISOString().split('T')[0],
                targetUnits: camp.targetUnits,
                status: camp.status,
            };
        } else {
            this.editingCamp = null;
            this.formData = { campName: '', location: '', organizerName: '', date: '', targetUnits: 50, status: 'Upcoming' };
        }
    }

    closeForm(): void {
        this.showForm = false;
        this.editingCamp = null;
    }

    saveCamp(): void {
        if (!this.formData.campName || !this.formData.location || !this.formData.date) {
            this.toast.show('Please fill all required fields', 'warning');
            return;
        }

        const obs = this.editingCamp
            ? this.campService.update(this.editingCamp._id!, this.formData)
            : this.campService.create(this.formData);

        obs.subscribe({
            next: () => {
                this.toast.show(this.editingCamp ? 'Camp updated!' : 'Camp created!', 'success');
                this.showForm = false;
                this.editingCamp = null;
                this.loadCamps();
                this.loadReport();
            },
            error: (err) => this.toast.show(err.error?.message || 'Failed to save', 'error'),
        });
    }

    deleteCamp(camp: Camp): void {
        if (!confirm(`Delete camp "${camp.campName}"?`)) return;
        this.campService.delete(camp._id!).subscribe({
            next: () => { this.toast.show('Camp deleted', 'success'); this.loadCamps(); this.loadReport(); },
            error: () => this.toast.show('Failed to delete', 'error'),
        });
    }

    openAddDonor(camp: Camp): void {
        this.selectedCamp = camp;
        this.addDonorId = '';
        this.showAddDonor = true;
    }

    addDonorToCamp(): void {
        if (!this.addDonorId || !this.selectedCamp) return;
        this.campService.addDonor(this.selectedCamp._id!, this.addDonorId).subscribe({
            next: () => {
                this.toast.show('Donor added to camp!', 'success');
                this.showAddDonor = false;
                this.loadCamps();
                this.loadReport();
            },
            error: (err) => this.toast.show(err.error?.message || 'Failed to add donor', 'error'),
        });
    }

    getStatusBadge(status: string): string {
        switch (status) {
            case 'Upcoming': return 'badge-info';
            case 'Ongoing': return 'badge-warning';
            case 'Completed': return 'badge-success';
            default: return 'badge-secondary';
        }
    }

    getProgress(camp: Camp): number {
        return camp.targetUnits > 0 ? Math.round((camp.actualUnitsCollected / camp.targetUnits) * 100) : 0;
    }

    formatDate(date: Date | string): string {
        return new Date(date).toLocaleDateString('en-IN', {
            day: '2-digit', month: 'short', year: 'numeric'
        });
    }

    getDonorCount(camp: Camp): number {
        return camp.donorIds ? camp.donorIds.length : 0;
    }
}
