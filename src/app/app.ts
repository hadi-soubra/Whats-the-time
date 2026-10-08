import { ChangeDetectionStrategy, Component, DestroyRef, computed, effect, inject, signal } from '@angular/core';
import { ClockFace } from './clock-face/clock-face';
import { computeLifeClock, parseLocalDate, partOfDay } from './life-clock';

const STORAGE_KEY = 'whats-the-time:settings';
const DEFAULT_LIFESPAN = 80;
const MIN_LIFESPAN = 1;
const MAX_LIFESPAN = 150;

interface Settings {
  birthday: string;
  lifespan: number;
}

function loadSettings(): Settings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<Settings>;
      return {
        birthday: typeof parsed.birthday === 'string' ? parsed.birthday : '',
        lifespan: typeof parsed.lifespan === 'number' ? parsed.lifespan : DEFAULT_LIFESPAN,
      };
    }
  } catch {
    // Storage unavailable (private mode, blocked cookies) — fall back to defaults.
  }
  return { birthday: '', lifespan: DEFAULT_LIFESPAN };
}

function pad(n: number): string {
  return n.toString().padStart(2, '0');
}

@Component({
  selector: 'app-root',
  imports: [ClockFace],
  templateUrl: './app.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App {
  private readonly initial = loadSettings();

  protected readonly birthday = signal(this.initial.birthday);
  protected readonly lifespan = signal(this.initial.lifespan);
  protected readonly now = signal(new Date());

  protected readonly today = (() => {
    const d = new Date();
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  })();
  protected readonly minLifespan = MIN_LIFESPAN;
  protected readonly maxLifespan = MAX_LIFESPAN;

  private readonly birthDate = computed(() => parseLocalDate(this.birthday()));

  protected readonly error = computed(() => {
    const birth = this.birthDate();
    const lifespan = this.lifespan();
    if (this.birthday() && !birth) return 'That doesn’t look like a valid date.';
    if (birth && birth.getTime() > this.now().getTime()) return 'Your birthday can’t be in the future.';
    if (!Number.isInteger(lifespan) || lifespan < MIN_LIFESPAN || lifespan > MAX_LIFESPAN) {
      return `Pick an age between ${MIN_LIFESPAN} and ${MAX_LIFESPAN}.`;
    }
    return null;
  });

  protected readonly clock = computed(() => {
    const birth = this.birthDate();
    if (!birth || this.error()) return null;
    return computeLifeClock(birth, this.lifespan(), this.now());
  });

  protected readonly digital = computed(() => {
    const c = this.clock();
    if (!c) return { time: '--:--:--', meridiem: '' };
    const h12 = c.hours % 12 === 0 ? 12 : c.hours % 12;
    return {
      time: `${pad(h12)}:${pad(c.minutes)}:${pad(c.seconds)}`,
      meridiem: c.hours % 24 < 12 ? 'AM' : 'PM',
    };
  });

  protected readonly headline = computed(() => {
    const c = this.clock();
    if (!c) return null;
    if (c.overtime) return 'It’s past midnight. Every moment from here is a bonus.';
    const h12 = c.hours % 12 === 0 ? 12 : c.hours % 12;
    return `It’s ${h12}:${pad(c.minutes)} — ${partOfDay(c.hours)} of your life.`;
  });

  protected readonly stats = computed(() => {
    const c = this.clock();
    if (!c) return null;
    const daysPerMinute = c.msPerClockMinute / 86_400_000;
    const yearsPerHour = (c.msPerClockMinute * 60) / (365.2425 * 86_400_000);
    return {
      age: c.ageYears.toFixed(8),
      percent: (c.fraction * 100).toFixed(7),
      perMinute: `${daysPerMinute.toFixed(1)} days`,
      perHour: `${yearsPerHour.toFixed(2)} years`,
    };
  });

  constructor() {
    const timer = setInterval(() => this.now.set(new Date()), 100);
    inject(DestroyRef).onDestroy(() => clearInterval(timer));

    effect(() => {
      const settings: Settings = { birthday: this.birthday(), lifespan: this.lifespan() };
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
      } catch {
        // Ignore — the app still works, it just won't remember.
      }
    });
  }

  protected onBirthday(event: Event): void {
    this.birthday.set((event.target as HTMLInputElement).value);
  }

  protected onLifespan(event: Event): void {
    this.lifespan.set((event.target as HTMLInputElement).valueAsNumber);
  }
}
