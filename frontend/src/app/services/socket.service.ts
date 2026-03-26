import { Injectable, OnDestroy } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { Observable, Subject } from 'rxjs';
import { environment } from '../../environments/environment';
import { ToastService } from './toast.service';

@Injectable({
    providedIn: 'root'
})
export class SocketService implements OnDestroy {
    private socket: Socket | null = null;
    private connected = false;

    // Event subjects
    private auditSubject = new Subject<any>();
    private donorChangeSubject = new Subject<any>();
    private patientChangeSubject = new Subject<any>();
    private inventoryChangeSubject = new Subject<any>();
    private transferChangeSubject = new Subject<any>();
    private appointmentChangeSubject = new Subject<any>();

    // Public observables
    audit$ = this.auditSubject.asObservable();
    donorChange$ = this.donorChangeSubject.asObservable();
    patientChange$ = this.patientChangeSubject.asObservable();
    inventoryChange$ = this.inventoryChangeSubject.asObservable();
    transferChange$ = this.transferChangeSubject.asObservable();
    appointmentChange$ = this.appointmentChangeSubject.asObservable();

    constructor(private toastService: ToastService) { }

    connect(): void {
        if (this.connected) return;

        const apiUrl = environment.apiUrl.replace('/api', '');
        this.socket = io(apiUrl, {
            transports: ['websocket', 'polling'],
        });

        this.socket.on('connect', () => {
            this.connected = true;
            console.log('🔌 Socket.io connected');
        });

        this.socket.on('disconnect', () => {
            this.connected = false;
            console.log('❌ Socket.io disconnected');
        });

        // Listen for events
        this.socket.on('audit', (data: any) => {
            this.auditSubject.next(data);
            // Show toast for real-time events
            if (data.action === 'CREATE' || data.action === 'APPROVE') {
                this.toastService.show(`${data.description}`, 'info');
            }
        });

        this.socket.on('donor:change', (data: any) => this.donorChangeSubject.next(data));
        this.socket.on('patient:change', (data: any) => this.patientChangeSubject.next(data));
        this.socket.on('inventory:change', (data: any) => this.inventoryChangeSubject.next(data));
        this.socket.on('transfer:change', (data: any) => this.transferChangeSubject.next(data));
        this.socket.on('appointment:change', (data: any) => this.appointmentChangeSubject.next(data));
    }

    disconnect(): void {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
            this.connected = false;
        }
    }

    isConnected(): boolean {
        return this.connected;
    }

    ngOnDestroy(): void {
        this.disconnect();
    }
}
