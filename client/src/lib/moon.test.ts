import { describe, expect, it } from 'vitest';
import { moonPath } from './moon';

describe('moonPath', () => {
  it('draws a full disc at full moon and nothing at new moon', () => {
    // Full: terminator is a full-width half-ellipse bulging left, so the shape is the whole circle.
    expect(moonPath(0.5)).toBe('M 20 4 A 16 16 0 0 1 20 36 A 16 16 0 0 1 20 4 Z');
    // New: the terminator retraces the lit edge, so the shape has no area.
    expect(moonPath(0)).toBe('M 20 4 A 16 16 0 0 1 20 36 A 16 16 0 0 0 20 4 Z');
  });

  it('lights the right side while waxing and the left while waning', () => {
    expect(moonPath(0.25)).toContain('A 16 16 0 0 1 20 36'); // right half arc
    expect(moonPath(0.75)).toContain('A 16 16 0 0 0 20 36'); // left half arc
  });
});
