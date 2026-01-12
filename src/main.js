import './styles.css';
import { ParticleSystem } from './particles/ParticleSystem.js';
import { MediaPipeManager } from './tracking/MediaPipeManager.js';
import { UIManager } from './ui/UIManager.js';
import { ThemeManager } from './utils/theme.js';

class App {
  constructor() {
    this.canvas = document.getElementById('particle-canvas');
    this.ctx = this.canvas.getContext('2d');

    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.canvas.width = this.width;
    this.canvas.height = this.height;

    // Components
    this.particleSystem = new ParticleSystem(10000, this.width, this.height);
    this.themeManager = new ThemeManager();

    this.currentMode = 'attract';
    this.currentTargets = [];

    // UI
    this.ui = new UIManager({
      onStart: () => this.start(),
      onModeChange: (mode) => {
        this.currentMode = mode;
      },
      onToggleMode: () => {
        const newMode = this.currentMode === 'attract' ? 'repel' : 'attract';
        this.currentMode = newMode;
        this.ui.setMode(newMode);
      },
      onToggleTheme: () => {
        const theme = this.themeManager.cycle();
        this.ui.updateStatus(`Theme: ${theme}`, 'success');
      }
    });

    // Tracking
    const video = document.getElementById('input-video');
    const debugCanvas = document.getElementById('debug-canvas');

    this.tracker = new MediaPipeManager(video, debugCanvas, {
      onStatus: (msg) => this.ui.updateStatus(msg),
      onTargets: (targets) => {
        this.currentTargets = targets;
      },
      onGestures: (gesture) => {
        if (gesture === 'fist') {
          const theme = this.themeManager.cycle();
          // Flash status?
          this.ui.updateStatus(`Theme: ${theme}`, 'success');
        }
      }
    });

    window.addEventListener('resize', () => this.resize());

    // Start Animation Loop (always running for intro particles?)
    // Or wait for start. Intro screen covers it. 
    this.animate();
  }

  async start() {
    await this.tracker.init();
    this.ui.updateStatus('System Ready', 'success');
  }

  resize() {
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.canvas.width = this.width;
    this.canvas.height = this.height;
    this.particleSystem.resize(this.width, this.height);
    // Tracker height/width update?
    this.tracker.width = this.width;
    this.tracker.height = this.height;
  }

  animate() {
    // Clear with fade effect for trails
    this.ctx.fillStyle = 'rgba(5, 5, 5, 0.2)';
    this.ctx.fillRect(0, 0, this.width, this.height);

    // Update Particles
    // If we have no targets (no detection), maybe attract to center or float?
    // Or just maintain last position.

    let targets = this.currentTargets;
    // If no targets and mode is attract, maybe attract to center?
    // For now, if no targets, they just float with friction/no new force.

    this.particleSystem.update(targets, this.currentMode, this.themeManager.currentTheme);
    this.particleSystem.draw(this.ctx, this.themeManager);

    requestAnimationFrame(() => this.animate());
  }
}

// Init
window.app = new App();
