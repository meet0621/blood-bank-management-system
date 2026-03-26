import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { ApiResponse, BloodBank, ComponentInventoryGroup } from '../models/models';

/**
 * BloodBank Service
 * Handles blood bank inventory operations
 */
@Injectable({
    providedIn: 'root'
})
export class BloodBankService {
    private apiUrl = `${environment.apiUrl}/bloodbank`;

    constructor(private http: HttpClient) { }

    /**
     * Get current inventory
     */
    getInventory(): Observable<ApiResponse<BloodBank>> {
        return this.http.get<ApiResponse<BloodBank>>(`${this.apiUrl}/inventory`);
    }

    /**
     * Get component-level inventory
     */
    getComponentInventory(): Observable<ApiResponse<{ bankName: string; location: string; inventory: ComponentInventoryGroup[] }>> {
        return this.http.get<ApiResponse<{ bankName: string; location: string; inventory: ComponentInventoryGroup[] }>>(`${this.apiUrl}/component-inventory`);
    }

    /**
     * Update inventory
     */
    updateInventory(inventory: any): Observable<ApiResponse<BloodBank>> {
        return this.http.put<ApiResponse<BloodBank>>(`${this.apiUrl}/inventory`, { inventory });
    }
}
