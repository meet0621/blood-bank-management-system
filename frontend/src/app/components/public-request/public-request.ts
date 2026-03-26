import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { BLOOD_GROUPS } from '../../models/models';

@Component({
    selector: 'app-public-request',
    imports: [CommonModule, FormsModule],
    templateUrl: './public-request.html',
    styleUrl: './public-request.css',
})
export class PublicRequestComponent {
    bloodGroups = BLOOD_GROUPS;
    components = ['Whole Blood', 'Packed RBCs', 'Platelets', 'Fresh Frozen Plasma', 'Cryoprecipitate'];
    submitted = false;
    submitting = false;
    error = '';
    successMessage = '';

    form: any = {
        name: '', gender: 'Male', bloodGroup: 'A+', component: 'Whole Blood',
        contact: '', urgencyLevel: 'Normal', hospitalName: '', units: 1,
    };

    constructor(private http: HttpClient) { }

    submit() {
        this.submitting = true;
        this.error = '';
        this.http.post<any>(`${environment.apiUrl}/patients/public-request`, this.form).subscribe({
            next: (res) => {
                this.submitted = true;
                this.successMessage = res.message || 'Request submitted successfully!';
                this.submitting = false;
            },
            error: (err) => {
                this.error = err.error?.message || 'Failed to submit request. Please try again.';
                this.submitting = false;
            },
        });
    }

    resetForm() {
        this.submitted = false;
        this.error = '';
        this.successMessage = '';
        this.form = { name: '', gender: 'Male', bloodGroup: 'A+', component: 'Whole Blood', contact: '', urgencyLevel: 'Normal', hospitalName: '', units: 1 };
    }
}
