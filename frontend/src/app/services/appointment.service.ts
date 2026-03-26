import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Appointment, TimeSlot, ApiResponse } from '../models/models';

@Injectable({
    providedIn: 'root'
})
export class AppointmentService {
    private apiUrl = `${environment.apiUrl}/appointments`;

    constructor(private http: HttpClient) { }

    getAll(filters?: { date?: string; status?: string; donorId?: string }): Observable<ApiResponse<Appointment[]>> {
        let params = new HttpParams();
        if (filters?.date) params = params.set('date', filters.date);
        if (filters?.status) params = params.set('status', filters.status);
        if (filters?.donorId) params = params.set('donorId', filters.donorId);
        return this.http.get<ApiResponse<Appointment[]>>(this.apiUrl, { params });
    }

    getToday(): Observable<ApiResponse<Appointment[]>> {
        return this.http.get<ApiResponse<Appointment[]>>(`${this.apiUrl}/today`);
    }

    getAvailableSlots(date: string): Observable<ApiResponse<TimeSlot[]>> {
        return this.http.get<ApiResponse<TimeSlot[]>>(`${this.apiUrl}/slots`, {
            params: new HttpParams().set('date', date)
        });
    }

    create(appointment: Partial<Appointment>): Observable<ApiResponse<Appointment>> {
        return this.http.post<ApiResponse<Appointment>>(this.apiUrl, appointment);
    }

    update(id: string, data: Partial<Appointment>): Observable<ApiResponse<Appointment>> {
        return this.http.put<ApiResponse<Appointment>>(`${this.apiUrl}/${id}`, data);
    }

    delete(id: string): Observable<ApiResponse<null>> {
        return this.http.delete<ApiResponse<null>>(`${this.apiUrl}/${id}`);
    }
}
