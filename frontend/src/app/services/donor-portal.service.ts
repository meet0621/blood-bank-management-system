import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { ApiResponse } from '../models/models';

@Injectable({
    providedIn: 'root'
})
export class DonorPortalService {
    private apiUrl = `${environment.apiUrl}/donor-portal`;

    constructor(private http: HttpClient) { }

    getProfile(): Observable<ApiResponse<any>> {
        return this.http.get<ApiResponse<any>>(`${this.apiUrl}/profile`);
    }

    getDonationHistory(): Observable<ApiResponse<any[]>> {
        return this.http.get<ApiResponse<any[]>>(`${this.apiUrl}/history`);
    }

    getAppointments(): Observable<ApiResponse<any[]>> {
        return this.http.get<ApiResponse<any[]>>(`${this.apiUrl}/appointments`);
    }

    bookAppointment(data: { date: string; timeSlot: string; notes?: string }): Observable<ApiResponse<any>> {
        return this.http.post<ApiResponse<any>>(`${this.apiUrl}/appointments`, data);
    }

    downloadCertificate(donationId: string): Observable<Blob> {
        return this.http.get(`${this.apiUrl}/certificate/${donationId}`, { responseType: 'blob' });
    }
}
