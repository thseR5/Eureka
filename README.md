# Eureka — STEM Discovery Engine

Eureka is an interactive Socratic learning platform for STEM subjects. Designed on cognitive science principles (Bloom's 2-Sigma Problem, Constructivist Learning, and Retrieval Practice), Eureka engages students in dialogue, flags active misconceptions, tracks conceptual progress in real-time, and provides interactive physics simulations for experimental validation—without ever directly revealing the answer.

---

## Key Features

1. **Socratic AI Engine**: Fully guided dialogue using a dynamic system prompt structure that maintains a strict question ladder, adapting hints based on student frustration levels.
2. **Misconception Detection**: Instant client-side trigger matching that flags common historical misunderstandings (e.g., Aristotle's 2000-year gravity error) and guides the AI model to probe the student's reasoning.
3. **Interactive Knowledge Graph**: A dynamic, draggable D3.js force-directed map showing concept node states (Undiscovered, Discovered, Mastered) and slide-up concept details.
4. **Physics Simulator**: A canvas-based mechanical simulation that verifies student predictions against real-time physics models (with optional air resistance settings and expanding impact shockwaves).
5. **Modern 3D Animated UI**: A dark academic styling featuring an interactive 3D particle constellation canvas background and perspective-hover hover tilt elements.

---

## Technology Stack

* **Frontend**: React, Next.js (App Router), TypeScript, Tailwind CSS
* **Animations**: Canvas APIs, D3.js, Vanilla CSS Animations
* **LLM Integration**: SSE token streaming over Next.js App Router API utilizing Google Gemini (`gemini-3.5-flash`).

---

## Local Setup & Development

### 1. Configure Environment Variables
Create a `.env` file in the root folder and add your Gemini API key:
```env
GEMINI_API_KEY=your_gemini_api_key
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Start Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) (or `http://localhost:3001` if port 3000 is occupied) in your browser.

### 4. Build for Production
```bash
npm run build
npm run start
```
