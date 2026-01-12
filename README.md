# ✨ Particle Bio-Simulator

A real-time interactive simulation that transforms your body into a fluid particle system using **MediaPipe** and **HTML5 Canvas**.

![Demo](https://via.placeholder.com/800x450?text=Particle+Bio-Simulator+Demo)
*(Replace this with a screenshot or gif of your project!)*

## 🚀 Features

*   **Real-time Tracking**: Uses **MediaPipe Holistic** to track both Face (468 landmarks) and Hands (21 landmarks) simultaneously.
*   **High-Performance**: Manages **15,000+ particles** using TypedArrays for smooth 60FPS rendering on standard hardware.
*   **Mirror Dimension Mode**: A unique split-screen experience:
    *   **Left Side (Matrix)**: Green square particles with gravity physics.
    *   **Right Side (Cosmic)**: Purple circular particles with anti-gravity float physics.
*   **Organic Flow**: Particles don't just stick to points; they "attract" and flow like liquid to form your shape.
*   **Multiple Themes**: Cycle through visual themes like **Fire**, **Ocean**, **Galaxy**, and the unique **Portal** mode.
*   **Gesture Control**: Make a **Fist ✊** to cycle through themes instantly (or use the 'T' key).

## 🛠️ Tech Stack

*   **Vite**: Fast development build tool.
*   **MediaPipe**: Advanced Computer Vision (Holistic Model).
*   **JavaScript (ES6)**: Pure vanilla logic for maximum control.
*   **Canvas API**: Low-level 2D rendering.
*   **CSS3**: Glassmorphism UI styling.

## 🎮 How to Run

1.  **Clone the repo**
    ```bash
    git clone https://github.com/bhuwan5911/Bio-Simulator.git
    cd Bio-Simulator
    ```

2.  **Install Dependencies**
    ```bash
    npm install
    ```

3.  **Start the Server**
    ```bash
    npm run dev
    ```

4.  **Allow Camera Access**: The app needs your webcam to track movement. All processing is done **locally** in your browser. No video is ever sent to a server.

## ⌨️ Controls

*   **SPACE**: Toggle between **Attract** (Shape) and **Repel** (Scatter) modes.
*   **V**: Toggle the **Debug View** (Camera feed + Skeletons).
*   **T** (or Click Button): Cycle through visual **Themes**.
*   **Fist Gesture ✊**: Cycle Theme.

## 👨‍💻 Created By

**Bhuwan** - *Exploring the intersection of Code and Reality.*

---
*Built with ❤️ and ☕*
