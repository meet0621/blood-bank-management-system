import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ThemeService {
    private darkMode = new BehaviorSubject<boolean>(false);
    isDarkMode$ = this.darkMode.asObservable();

    constructor() {
        const saved = localStorage.getItem('bb_theme');
        if (saved === 'dark') {
            this.setDark(true);
        }
    }

    toggle() {
        this.setDark(!this.darkMode.value);
    }

    private setDark(dark: boolean) {
        this.darkMode.next(dark);
        document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light');
        localStorage.setItem('bb_theme', dark ? 'dark' : 'light');
    }

    get isDark(): boolean {
        return this.darkMode.value;
    }
}
