import { trigger, transition, style, animate, query, stagger, keyframes } from '@angular/animations';

export const fadeInUp = trigger('fadeInUp', [
    transition(':enter', [
        style({ opacity: 0, transform: 'translateY(20px)' }),
        animate('0.4s ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
    ])
]);

export const staggerList = trigger('staggerList', [
    transition('* => *', [
        query(':enter', [
            style({ opacity: 0, transform: 'translateY(15px)' }),
            stagger('50ms', [
                animate('0.3s ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
            ])
        ], { optional: true })
    ])
]);

// Route transition animation
export const routeTransition = trigger('routeTransition', [
    transition('* => *', [
        query(':enter', [
            style({ opacity: 0, transform: 'translateY(10px)' })
        ], { optional: true }),
        query(':leave', [
            animate('0.2s ease-out', style({ opacity: 0, transform: 'translateY(-10px)' }))
        ], { optional: true }),
        query(':enter', [
            animate('0.3s ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
        ], { optional: true })
    ])
]);

// Scale in animation for modals/cards
export const scaleIn = trigger('scaleIn', [
    transition(':enter', [
        style({ opacity: 0, transform: 'scale(0.95)' }),
        animate('0.25s cubic-bezier(0.35, 0, 0.25, 1)', style({ opacity: 1, transform: 'scale(1)' }))
    ])
]);

// Heartbeat animation for logo/ alerts
export const heartbeat = trigger('heartbeat', [
    transition('* => pulse', [
        animate('1s ease-in-out', keyframes([
            style({ transform: 'scale(1)', offset: 0 }),
            style({ transform: 'scale(1.1)', offset: 0.15 }),
            style({ transform: 'scale(1)', offset: 0.3 }),
            style({ transform: 'scale(1.1)', offset: 0.45 }),
            style({ transform: 'scale(1)', offset: 1 })
        ]))
    ])
]);
