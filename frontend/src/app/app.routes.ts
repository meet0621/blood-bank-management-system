import { Routes } from '@angular/router';
import { DashboardComponent } from './components/dashboard/dashboard';
import { DonorsComponent } from './components/donors/donors';
import { PatientsComponent } from './components/patients/patients';
import { InventoryComponent } from './components/inventory/inventory';
import { ReportsComponent } from './components/reports/reports';
import { LoginComponent } from './components/login/login';
import { AppointmentsComponent } from './components/appointments/appointments';
import { CampsComponent } from './components/camps/camps';
import { TransfersComponent } from './components/transfers/transfers';
import { PublicRequestComponent } from './components/public-request/public-request';
import { DonorPortalComponent } from './components/donor-portal/donor-portal';
import { AuditComponent } from './components/audit/audit';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
    { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
    { path: 'login', component: LoginComponent },
    { path: 'request', component: PublicRequestComponent },
    {
        path: 'donor-portal',
        component: DonorPortalComponent,
        canActivate: [authGuard],
        data: { roles: ['Donor'] },
    },
    {
        path: 'dashboard',
        component: DashboardComponent,
        canActivate: [authGuard],
        data: { roles: ['Admin', 'Staff'] },
    },
    {
        path: 'donors',
        component: DonorsComponent,
        canActivate: [authGuard],
        data: { roles: ['Admin', 'Staff'] },
    },
    {
        path: 'patients',
        component: PatientsComponent,
        canActivate: [authGuard],
        data: { roles: ['Admin', 'Staff'] },
    },
    {
        path: 'inventory',
        component: InventoryComponent,
        canActivate: [authGuard],
        data: { roles: ['Admin', 'Staff'] },
    },
    {
        path: 'appointments',
        component: AppointmentsComponent,
        canActivate: [authGuard],
        data: { roles: ['Admin', 'Staff'] },
    },
    {
        path: 'camps',
        component: CampsComponent,
        canActivate: [authGuard],
        data: { roles: ['Admin', 'Staff'] },
    },
    {
        path: 'transfers',
        component: TransfersComponent,
        canActivate: [authGuard],
        data: { roles: ['Admin', 'Staff'] },
    },
    {
        path: 'reports',
        component: ReportsComponent,
        canActivate: [authGuard],
        data: { roles: ['Admin', 'Staff'] },
    },
    {
        path: 'audit',
        component: AuditComponent,
        canActivate: [authGuard],
        data: { roles: ['Admin'] },
    },
    { path: '**', redirectTo: '/dashboard' },
];
