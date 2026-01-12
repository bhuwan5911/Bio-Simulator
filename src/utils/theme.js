export const THEMES = [
  'Rainbow',
  'Fire',
  'Ocean',
  'Galaxy',
  'Matrix',
  'Portal'
];

export class ThemeManager {
  constructor() {
    this.currentIndex = 0;
  }

  get currentTheme() {
    return THEMES[this.currentIndex];
  }

  cycle() {
    this.currentIndex = (this.currentIndex + 1) % THEMES.length;
    return this.currentTheme;
  }

  /**
   * Get color for a particle.
   * @param {number} i Particle index
   * @param {number} total Total particles
   * @param {number} x Normalized x position (0-1)
   * @param {number} y Normalized y position (0-1)
   * @param {number} life Particle life/intensity (0-1)
   */
  getColor(i, total, x, y, life) {
    const alpha = life.toFixed(2);

    switch (this.currentTheme) {
      case 'Rainbow':
        // Cycle hue based on x position and index
        const hue = (x * 360 + (i / total) * 100) % 360;
        return `hsla(${hue}, 80%, 60%, ${alpha})`;

      case 'Fire':
        // Red to Yellow gradient
        const fireHue = 40 * y; // 0 (red) to 40 (orange/yellow)
        return `hsla(${fireHue}, 100%, 60%, ${alpha})`;

      case 'Ocean':
        // Deep blue to cyan
        const oceanHue = 180 + 60 * y;
        return `hsla(${oceanHue}, 90%, 60%, ${alpha})`;

      case 'Galaxy':
        // Purple/Pink/Blue
        const galaxyHue = 260 + 60 * Math.sin(x * Math.PI);
        return `hsla(${galaxyHue}, 80%, 70%, ${alpha})`;

      case 'Matrix':
        // Matrix Green
        return `hsla(120, 100%, 50%, ${alpha})`;

      case 'Portal':
        // Split screen colors
        if (x < 0.5) {
          // Left: Matrix / Digital Green
          return `hsla(120, 100%, 50%, ${alpha})`;
        } else {
          // Right: Cosmic Purple
          const pBoxHue = 270 + 40 * Math.sin(x * Math.PI * 4);
          return `hsla(${pBoxHue}, 90%, 60%, ${alpha})`;
        }

      default:
        return `rgba(255, 255, 255, ${alpha})`;
    }
  }
}
