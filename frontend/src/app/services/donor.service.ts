import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { ApiResponse, Donor } from '../models/models';

/**
 * Donor Service
 * Handles all donor-related API operations
 */
@Injectable({
    providedIn: 'root'
})
export class DonorService {
    private apiUrl = `${environment.apiUrl}/donors`;

    constructor(private http: HttpClient) { }

    /**
     * Get all donors with optional filters
     */
    getAllDonors(bloodGroup?: string, gender?: string, search?: string): Observable<ApiResponse<Donor[]>> {
        let params: any = {};
        if (bloodGroup) params.bloodGroup = bloodGroup;
        if (gender) params.gender = gender;
        if (search) params.search = search;

        return this.http.get<ApiResponse<Donor[]>>(this.apiUrl, { params });
    }

    /**
     * Get a single donor by ID
     */
    getDonorById(id: string): Observable<ApiResponse<Donor>> {
        return this.http.get<ApiResponse<Donor>>(`${this.apiUrl}/${id}`);
    }

    /**
     * Create a new donor
     */
    createDonor(donor: Donor): Observable<ApiResponse<Donor>> {
        return this.http.post<ApiResponse<Donor>>(this.apiUrl, donor);
    }

    /**
     * Update an existing donor
     */
    updateDonor(id: string, donor: Donor): Observable<ApiResponse<Donor>> {
        return this.http.put<ApiResponse<Donor>>(`${this.apiUrl}/${id}`, donor);
    }

    /**
     * Delete a donor
     */
    deleteDonor(id: string): Observable<ApiResponse<null>> {
        return this.http.delete<ApiResponse<null>>(`${this.apiUrl}/${id}`);
    }
}
