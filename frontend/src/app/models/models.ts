/**
 * Donor interface
 */
export interface Donor {
    _id?: string;
    donorId?: string;
    name: string;
    age: number;
    gender: 'Male' | 'Female' | 'Other';
    bloodGroup: 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';
    address: string;
    contact: string;
    dateOfDonation?: Date | string;
    createdAt?: Date | string;
    updatedAt?: Date | string;
}

/**
 * Patient interface
 */
export interface Patient {
    _id?: string;
    patientId?: string;
    name: string;
    gender: 'Male' | 'Female' | 'Other';
    bloodGroup: 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';
    component?: string;
    contact: string;
    requestStatus?: 'Pending' | 'Approved' | 'Rejected';
    urgencyLevel?: 'Normal' | 'Urgent' | 'Critical';
    hospitalName?: string;
    source?: 'Staff' | 'Public';
    units?: number;
    createdAt?: Date | string;
    updatedAt?: Date | string;
}

/**
 * Blood unit interface
 */
export interface BloodUnit {
    _id?: string;
    bloodId?: string;
    bloodGroup: string;
    componentType: string;
    quantity: number;
    collectedDate?: Date | string;
    expiryDate?: Date | string;
    status?: 'Available' | 'Expired' | 'Used' | 'Transferred';
    donorId?: string | Donor;
    createdAt?: Date | string;
    updatedAt?: Date | string;
}

/**
 * Blood inventory item interface
 */
export interface BloodInventoryItem {
    bloodGroup: 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';
    component?: string;
    quantity: number;
}

/**
 * Component inventory grouped by blood group
 */
export interface ComponentInventoryGroup {
    bloodGroup: string;
    totalQuantity: number;
    components: { component: string; quantity: number }[];
}

/**
 * BloodBank interface
 */
export interface BloodBank {
    _id?: string;
    bankId?: string;
    name: string;
    location: string;
    inventory: BloodInventoryItem[];
    createdAt?: Date | string;
    updatedAt?: Date | string;
}

/**
 * API Response interface
 */
export interface ApiResponse<T> {
    success: boolean;
    data: T;
    message: string;
}

/**
 * Dashboard Stats interface
 */
export interface DashboardStats {
    totalDonors: number;
    totalPatients: number;
    totalBloodUnits: number;
    recentDonations: Donor[];
    inventory: BloodInventoryItem[];
    expiringCount: number;
    expiredCount: number;
}

/**
 * Blood component types
 */
export const BLOOD_COMPONENTS = [
    'Whole Blood',
    'Packed RBCs',
    'Fresh Frozen Plasma',
    'Platelets',
    'Cryoprecipitate',
] as const;

/**
 * Blood groups
 */
export const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'] as const;

/**
 * Appointment interface
 */
export interface Appointment {
    _id?: string;
    appointmentId?: string;
    donorId: string | Donor;
    date: Date | string;
    timeSlot: string;
    status: 'Scheduled' | 'Completed' | 'Cancelled';
    notes?: string;
    createdAt?: Date | string;
    updatedAt?: Date | string;
}

/**
 * Time slot availability
 */
export interface TimeSlot {
    slot: string;
    booked: number;
    available: number;
    isFull: boolean;
}

/**
 * Camp interface
 */
export interface Camp {
    _id?: string;
    campId?: string;
    campName: string;
    location: string;
    organizerName: string;
    date: Date | string;
    targetUnits: number;
    actualUnitsCollected: number;
    donorIds: string[] | Donor[];
    status: 'Upcoming' | 'Ongoing' | 'Completed';
    createdAt?: Date | string;
    updatedAt?: Date | string;
}

/**
 * Camp report summary
 */
export interface CampReport {
    totalCamps: number;
    totalTargetUnits: number;
    totalCollected: number;
    upcoming: number;
    ongoing: number;
    completed: number;
    camps: {
        campName: string;
        date: Date | string;
        targetUnits: number;
        actualUnitsCollected: number;
        status: string;
        donorCount: number;
    }[];
}

/**
 * Hospital interface
 */
export interface Hospital {
    _id?: string;
    hospitalId?: string;
    name: string;
    location: string;
    contact?: string;
    email?: string;
    type: 'Government' | 'Private' | 'Clinic';
    status: 'Active' | 'Inactive';
    createdAt?: Date | string;
    updatedAt?: Date | string;
}

/**
 * Blood Transfer interface
 */
export interface BloodTransfer {
    _id?: string;
    transferId?: string;
    fromHospital: string | Hospital;
    toHospital: string | Hospital;
    bloodGroup: string;
    component: string;
    units: number;
    status: 'Pending' | 'Approved' | 'In Transit' | 'Delivered' | 'Rejected';
    requestedBy?: string;
    notes?: string;
    createdAt?: Date | string;
    updatedAt?: Date | string;
}
