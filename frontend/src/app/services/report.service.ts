import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { ApiResponse, DashboardStats } from '../models/models';

/**
 * Report Service
 * Handles report, analytics, and export operations
 */
@Injectable({
    providedIn: 'root'
})
export class ReportService {
    private apiUrl = `${environment.apiUrl}/reports`;

    constructor(private http: HttpClient) { }

    getDashboardStats(): Observable<ApiResponse<DashboardStats>> {
        return this.http.get<ApiResponse<DashboardStats>>(`${this.apiUrl}/dashboard`);
    }

    getInventoryReport(): Observable<ApiResponse<any>> {
        return this.http.get<ApiResponse<any>>(`${this.apiUrl}/inventory`);
    }

    getDonationsReport(): Observable<ApiResponse<any>> {
        return this.http.get<ApiResponse<any>>(`${this.apiUrl}/donations`);
    }

    getAnalytics(): Observable<ApiResponse<any>> {
        return this.http.get<ApiResponse<any>>(`${this.apiUrl}/analytics`);
    }

    exportPDF(): Observable<Blob> {
        return this.http.get(`${this.apiUrl}/export/pdf`, { responseType: 'blob' });
    }

    exportExcel(): Observable<Blob> {
        return this.http.get(`${this.apiUrl}/export/excel`, { responseType: 'blob' });
    }
}
