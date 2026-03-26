import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Camp, CampReport, ApiResponse } from '../models/models';

@Injectable({
    providedIn: 'root'
})
export class CampService {
    private apiUrl = `${environment.apiUrl}/camps`;

    constructor(private http: HttpClient) { }

    getAll(status?: string): Observable<ApiResponse<Camp[]>> {
        let params = new HttpParams();
        if (status) params = params.set('status', status);
        return this.http.get<ApiResponse<Camp[]>>(this.apiUrl, { params });
    }

    getById(id: string): Observable<ApiResponse<Camp>> {
        return this.http.get<ApiResponse<Camp>>(`${this.apiUrl}/${id}`);
    }

    create(camp: Partial<Camp>): Observable<ApiResponse<Camp>> {
        return this.http.post<ApiResponse<Camp>>(this.apiUrl, camp);
    }

    update(id: string, data: Partial<Camp>): Observable<ApiResponse<Camp>> {
        return this.http.put<ApiResponse<Camp>>(`${this.apiUrl}/${id}`, data);
    }

    delete(id: string): Observable<ApiResponse<null>> {
        return this.http.delete<ApiResponse<null>>(`${this.apiUrl}/${id}`);
    }

    addDonor(campId: string, donorId: string): Observable<ApiResponse<Camp>> {
        return this.http.post<ApiResponse<Camp>>(`${this.apiUrl}/${campId}/add-donor`, { donorId });
    }

    getReport(): Observable<ApiResponse<CampReport>> {
        return this.http.get<ApiResponse<CampReport>>(`${this.apiUrl}/report/summary`);
    }
}
