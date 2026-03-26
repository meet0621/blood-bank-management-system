import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { ApiResponse, BloodTransfer, Hospital } from '../models/models';

@Injectable({
    providedIn: 'root'
})
export class TransferService {
    private apiUrl = `${environment.apiUrl}/transfers`;

    constructor(private http: HttpClient) { }

    getAll(): Observable<ApiResponse<BloodTransfer[]>> {
        return this.http.get<ApiResponse<BloodTransfer[]>>(this.apiUrl);
    }

    getById(id: string): Observable<ApiResponse<BloodTransfer>> {
        return this.http.get<ApiResponse<BloodTransfer>>(`${this.apiUrl}/${id}`);
    }

    create(data: any): Observable<ApiResponse<BloodTransfer>> {
        return this.http.post<ApiResponse<BloodTransfer>>(this.apiUrl, data);
    }

    update(id: string, data: any): Observable<ApiResponse<BloodTransfer>> {
        return this.http.put<ApiResponse<BloodTransfer>>(`${this.apiUrl}/${id}`, data);
    }

    delete(id: string): Observable<ApiResponse<any>> {
        return this.http.delete<ApiResponse<any>>(`${this.apiUrl}/${id}`);
    }

    approve(id: string): Observable<ApiResponse<BloodTransfer>> {
        return this.http.put<ApiResponse<BloodTransfer>>(`${this.apiUrl}/${id}/approve`, {});
    }

    reject(id: string, notes?: string): Observable<ApiResponse<BloodTransfer>> {
        return this.http.put<ApiResponse<BloodTransfer>>(`${this.apiUrl}/${id}/reject`, { notes });
    }

    getPending(): Observable<ApiResponse<BloodTransfer[]>> {
        return this.http.get<ApiResponse<BloodTransfer[]>>(`${this.apiUrl}/pending`);
    }

    getHospitals(): Observable<ApiResponse<Hospital[]>> {
        return this.http.get<ApiResponse<Hospital[]>>(`${this.apiUrl}/hospitals`);
    }
}
