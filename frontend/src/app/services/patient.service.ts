import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { ApiResponse, Patient } from '../models/models';

/**
 * Patient Service
 * Handles patient and blood request operations
 */
@Injectable({
    providedIn: 'root'
})
export class PatientService {
    private apiUrl = `${environment.apiUrl}/patients`;

    constructor(private http: HttpClient) { }

    /**
     * Get all patients with optional filtering
     */
    getAllPatients(bloodGroup?: string, search?: string): Observable<ApiResponse<Patient[]>> {
        let params = new HttpParams();
        if (bloodGroup) params = params.set('bloodGroup', bloodGroup);
        if (search) params = params.set('search', search);
        return this.http.get<ApiResponse<Patient[]>>(this.apiUrl, { params });
    }

    /**
     * Get a single patient by ID
     */
    getPatientById(id: string): Observable<ApiResponse<Patient>> {
        return this.http.get<ApiResponse<Patient>>(`${this.apiUrl}/${id}`);
    }

    /**
     * Create a new patient
     */
    createPatient(patient: Patient): Observable<ApiResponse<Patient>> {
        return this.http.post<ApiResponse<Patient>>(this.apiUrl, patient);
    }

    /**
     * Submit a public blood request (no auth)
     */
    createPublicRequest(patient: Partial<Patient>): Observable<ApiResponse<Patient>> {
        return this.http.post<ApiResponse<Patient>>(`${this.apiUrl}/public-request`, patient);
    }

    /**
     * Update a patient
     */
    updatePatient(id: string, patient: Patient): Observable<ApiResponse<Patient>> {
        return this.http.put<ApiResponse<Patient>>(`${this.apiUrl}/${id}`, patient);
    }

    /**
     * Delete a patient
     */
    deletePatient(id: string): Observable<ApiResponse<null>> {
        return this.http.delete<ApiResponse<null>>(`${this.apiUrl}/${id}`);
    }

    /**
     * Request blood for a patient (with component specification)
     */
    requestBlood(id: string, component: string = 'Whole Blood'): Observable<ApiResponse<Patient>> {
        return this.http.post<ApiResponse<Patient>>(`${this.apiUrl}/${id}/request-blood`, { component });
    }
}
