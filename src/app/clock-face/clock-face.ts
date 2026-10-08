import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

const ROMAN = ['XII', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI'];

/** A classic analog clock face, drawn in SVG. */
@Component({
  selector: 'app-clock-face',
  templateUrl: './clock-face.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ClockFace {
  /** Milliseconds since midnight (0..DAY_MS). */
  readonly dayMs = input.required<number>();
  readonly isPm = input(false);

  protected readonly ticks = Array.from({ length: 60 }, (_, i) => ({
    angle: i * 6,
    major: i % 5 === 0,
  }));

  protected readonly numerals = ROMAN.map((label, i) => {
    const angle = (i * 30 * Math.PI) / 180;
    return { label, x: 100 + 72 * Math.sin(angle), y: 100 - 72 * Math.cos(angle) };
  });

  protected readonly hourAngle = computed(() => {
    const hours = this.dayMs() / 3_600_000;
    return ((hours % 12) / 12) * 360;
  });

  protected readonly minuteAngle = computed(() => {
    const minutes = this.dayMs() / 60_000;
    return ((minutes % 60) / 60) * 360;
  });

  protected readonly secondAngle = computed(() => {
    const seconds = this.dayMs() / 1000;
    return ((seconds % 60) / 60) * 360;
  });
}
