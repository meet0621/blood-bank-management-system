import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DonorService } from '../../services/donor.service';
import { Donor, BLOOD_COMPONENTS } from '../../models/models';
import { SkeletonLoaderComponent } from '../shared/skeleton-loader';
import { EmptyStateComponent } from '../shared/empty-state';
import { ConfirmModalComponent } from '../shared/confirm-modal';
import { ToastService } from '../../services/toast.service';
import { fadeInUp, staggerList, scaleIn } from '../../animations';

@Component({
  selector: 'app-donors',
  imports: [CommonModule, FormsModule, SkeletonLoaderComponent, EmptyStateComponent, ConfirmModalComponent],
  templateUrl: './donors.html',
  styleUrl: './donors.css',
  animations: [fadeInUp, staggerList, scaleIn]
})
export class DonorsComponent implements OnInit {
  donors: Donor[] = [];
  loading = true;
  showAddForm = false;
  editingDonor: Donor | null = null;

  // Filters
  searchName = '';
  filterBloodGroup = '';
  filterGender = '';

  bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
  genders = ['Male', 'Female', 'Other'];
  components = BLOOD_COMPONENTS;

  // Form model
  donorForm: Donor = this.getEmptyDonor();
  splitComponents = false;
  componentType = 'Whole Blood';

  // Confirm modal
  showConfirm = false;
  confirmTitle = '';
  confirmMessage = '';
  pendingDeleteDonor: Donor | null = null;

  constructor(
    private donorService: DonorService,
    private toastService: ToastService
  ) { }

  ngOnInit() { this.loadDonors(); }

  getEmptyDonor(): Donor {
    return { name: '', age: 18, gender: 'Male', bloodGroup: 'A+', address: '', contact: '' };
  }

  loadDonors() {
    this.loading = true;
    this.donorService.getAllDonors(this.filterBloodGroup, this.filterGender, this.searchName).subscribe({
      next: (response) => { this.donors = response.data; this.loading = false; },
      error: (error) => {
        console.error('Error loading donors:', error);
        this.toastService.error('Failed to load donors');
        this.loading = false;
      }
    });
  }

  applyFilters() { this.loadDonors(); }

  resetFilters() {
    this.searchName = '';
    this.filterBloodGroup = '';
    this.filterGender = '';
    this.loadDonors();
  }

  openAddForm() {
    this.showAddForm = true;
    this.editingDonor = null;
    this.donorForm = this.getEmptyDonor();
    this.splitComponents = false;
    this.componentType = 'Whole Blood';
  }

  openEditForm(donor: Donor) {
    this.showAddForm = true;
    this.editingDonor = donor;
    this.donorForm = { ...donor };
  }

  closeForm() {
    this.showAddForm = false;
    this.editingDonor = null;
    this.donorForm = this.getEmptyDonor();
    this.splitComponents = false;
    this.componentType = 'Whole Blood';
  }

  saveDonor() {
    if (this.editingDonor && this.editingDonor._id) {
      this.donorService.updateDonor(this.editingDonor._id, this.donorForm).subscribe({
        next: (response) => { this.toastService.success(response.message); this.loadDonors(); this.closeForm(); },
        error: () => this.toastService.error('Failed to update donor')
      });
    } else {
      // Add component info to the donor creation payload
      const payload: any = {
        ...this.donorForm,
        splitComponents: this.splitComponents,
        componentType: this.componentType,
      };
      this.donorService.createDonor(payload).subscribe({
        next: (response) => { this.toastService.success(response.message); this.loadDonors(); this.closeForm(); },
        error: (err) => { 
          console.error('Error creating donor:', err);
          console.error('Error response:', err.error);
          const msg = err.error?.message || err.message || 'Failed to add donor';
          console.log('Error message:', msg);
          alert('Error: ' + msg); // Show alert for debugging
          this.toastService.error(msg);
        }
      });
    }
  }

  deleteDonor(donor: Donor) {
    if (!donor._id) return;
    this.pendingDeleteDonor = donor;
    this.confirmTitle = 'Delete Donor';
    this.confirmMessage = `Are you sure you want to delete "${donor.name}"? This action cannot be undone.`;
    this.showConfirm = true;
  }

  confirmDelete() {
    if (!this.pendingDeleteDonor?._id) return;
    this.donorService.deleteDonor(this.pendingDeleteDonor._id).subscribe({
      next: () => { this.toastService.success('Donor deleted successfully'); this.loadDonors(); },
      error: () => this.toastService.error('Failed to delete donor')
    });
    this.showConfirm = false;
    this.pendingDeleteDonor = null;
  }

  cancelDelete() {
    this.showConfirm = false;
    this.pendingDeleteDonor = null;
  }

  getInitialColor(name: string): string {
    return `hsl(${name.charCodeAt(0) * 37 % 360},55%,50%)`;
  }
}
