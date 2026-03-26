import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class AuditService {
    private apiUrl = `${environment.apiUrl}/audit`;

    constructor(private http: HttpClient) { }

    getLogs(params: { entity?: string; action?: string; page?: number; limit?: number; search?: string } = {}): Observable<any> {
        let httpParams = new HttpParams();
        if (params.entity) httpParams = httpParams.set('entity', params.entity);
        if (params.action) httpParams = httpParams.set('action', params.action);
        if (params.page) httpParams = httpParams.set('page', params.page.toString());
        if (params.limit) httpParams = httpParams.set('limit', params.limit.toString());
        if (params.search) httpParams = httpParams.set('search', params.search);

        return this.http.get<any>(this.apiUrl, { params: httpParams });
    }

    getStats(): Observable<any> {
        return this.http.get<any>(`${this.apiUrl}/stats`);
    }
}
