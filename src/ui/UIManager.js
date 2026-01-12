export class UIManager {
    constructor(callbacks) {
        this.callbacks = callbacks;

        // Elements
        this.introScreen = document.getElementById('intro-screen');
        this.btnEnable = document.getElementById('btn-enable-camera');
        this.controlsPanel = document.getElementById('controls-panel');
        this.shortcutsPanel = document.getElementById('shortcuts-panel');
        this.statusPanel = document.getElementById('status-panel');
        this.debugContainer = document.getElementById('debug-container');
        this.statusText = document.getElementById('status-text');
        this.statusDot = document.getElementById('status-dot');

        // Bindings
        this.btnEnable.addEventListener('click', () => {
            this.introScreen.classList.add('fade-out');
            setTimeout(() => this.introScreen.classList.add('hidden'), 500);

            // Show other panels
            this.controlsPanel.classList.remove('hidden');
            this.shortcutsPanel.classList.remove('hidden');
            this.statusPanel.classList.remove('hidden');
            this.debugContainer.classList.remove('hidden'); // Show debug by default? Prompt says show it.

            this.callbacks.onStart();
        });

        // Mode Buttons
        const modeBtns = document.querySelectorAll('.mode-btn');
        modeBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const mode = e.target.dataset.mode;
                this.setMode(mode);
            });
        });

        // Theme Change Click
        const themeShortcut = this.shortcutsPanel.querySelector('.shortcut:last-child');
        themeShortcut.style.cursor = 'pointer';
        themeShortcut.title = "Click to cycle themes";
        themeShortcut.addEventListener('click', () => {
            if (this.callbacks.onToggleTheme) this.callbacks.onToggleTheme();
        });

        // Keyboard Shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.code === 'Space') {
                this.callbacks.onToggleMode();
            } else if (e.code === 'KeyV') {
                this.toggleDebug();
            } else if (e.code === 'KeyT') { // Added T for Theme
                if (this.callbacks.onToggleTheme) this.callbacks.onToggleTheme();
            }
        });
    }

    setMode(mode) {
        document.querySelectorAll('.mode-btn').forEach(btn => {
            if (btn.dataset.mode === mode) btn.classList.add('active');
            else btn.classList.remove('active');
        });
        this.callbacks.onModeChange(mode);
    }

    toggleDebug() {
        if (this.debugContainer.classList.contains('hidden')) {
            this.debugContainer.classList.remove('hidden');
        } else {
            this.debugContainer.classList.add('hidden');
        }
    }

    updateStatus(text, type = 'normal') {
        this.statusText.textContent = text;
        if (type === 'error') this.statusDot.style.backgroundColor = 'red';
        else if (type === 'success') this.statusDot.style.backgroundColor = '#00ff00';
        else this.statusDot.style.backgroundColor = '#ffaa00';
    }
}
