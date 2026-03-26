import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { ApiResponse, BloodUnit } from '../models/models';

/**
 * Expiry Service
 * Handles blood expiry tracking operations
 */
@Injectable({
    providedIn: 'root'
})
export class ExpiryService {
    private apiUrl = `${environment.apiUrl}/expiry`;

    constructor(private http: HttpClient) { }

    /**
     * Get units expiring within N days
     */
    getExpiringUnits(days: number = 7): Observable<ApiResponse<BloodUnit[]>> {
        return this.http.get<ApiResponse<BloodUnit[]>>(`${this.apiUrl}/expiring`, { params: { days: days.toString() } });
    }

    /**
     * Get already expired units
     */
    getExpiredUnits(): Observable<ApiResponse<BloodUnit[]>> {
        return this.http.get<ApiResponse<BloodUnit[]>>(`${this.apiUrl}/expired`);
    }

    /**
     * Flag expired units and update inventory
     */
    flagExpiredUnits(): Observable<ApiResponse<{ flaggedCount: number }>> {
        return this.http.post<ApiResponse<{ flaggedCount: number }>>(`${this.apiUrl}/flag-expired`, {});
    }
}
