# Project Architecture: 24 Hours of Sodom (The Shadow Protocol)

## 1. Project Overview & Philosophy
**Genre**: Interactive Psychological Narrative / Empathy Engine.
**Core Premise**: The player acts as the "Shadow" (inner voice) of Lynn, an autistic woman on an H1B visa, navigating her final 24 hours before a predetermined PIP (Performance Improvement Plan) termination.
**Core Philosophy**: A highly curated, linear pressure-cooker. No random events. Every single choice, consequence, and sensory detail is meticulously hardcoded to accurately simulate Autistic Burnout, sensory overload, and covert workplace bullying. 
**Tech Stack**: Next.js (App Router), React, Tailwind CSS, Google Gemini API (Strictly limited to the final climax).

## 2. Core Game Mechanics

### 2.1 Player Stats (The Survival Trinity)
- **🔋 Energy (0-100)**: Starts low (40). Drained by Masking, socializing, and forcing compliance.
- **🔊 Sensory Overload (0-100)**: Starts high (80). Increases with noise, vague instructions, and ive-aggressive behavior. Triggers UI distortion (blurring, shaking) when >90.
- **👤 Manager Pressure (0-100)**: Starts at 85. Represents Sammie's relentless PIP documentation agenda.

### 2.2 The Linear Timeline (7 Fixed Beats)
Instead of days, the game progresses through **7 Chronological Beats** (e.g., 07:30 AM Subway, 09:30 AM Interrogation, 12:00 PM Hostile Lunch, etc.).
- The game is 100% deterministic. No random events.
- **Consequences**: Every choice a player makes will immediately display a hardcoded `consequenceText` (Sammie's gaslighting response or a sensory description) and apply exact `statsImpact`.

### 2.3 Executive Dysfunction & "The Illusion of Choice"
- **The Mechanic**: Instead of hiding unavailable options when stats pass critical thresholds (e.g., `Energy < 20` or `Sensory Overload > 80`), the game still displays them, but they are **visibly crossed out (struck through) and unclickable**.
- **The Internal Monologue**: Beneath the disabled choice, a visceral explanation appears (e.g.*"Lynn doesn't have enough energy to mask a polite smile right now,"* or *"The fluorescent lights are too loud to formulate a logical defense."*).
- **Narrative Purpose**: This forces the player (The Shadow) to experience the exact frustration of Executive Dysfunction—knowing exactly what the "correct" or "safe" response is, but being trapped in a nervous system that simply cannot execute it, leaving only the most damaging, compliant, or shutdown choices available.

- **Anti-Softlock Rule 1 (The Fawn/Freeze Fallback)**: By design, at least one choice per Beat MUST have no requirements. This represents the ultimate trauma response: pathological compliance (Fawning) or total paralysis (Freezing). The player is forced to click this devastating option when all logical paths are blocked.


## 3. System Architecture (100% Local + 1 Climax API)

### 3.1 The Data Layer (Strictly Hardcoded JSON)
- **`data/timelineEvents.json`**: Contains the array of all 7 Beats. Each Beat object contains the narrative context and choices. 
- **Choice Structure**: Each choice has its own pre-written `consequenceText` and `statsImpact`. Crucially, a choice can optionally include:
  - `requirements`: e.g., `{ minEnergy: 30, maxSensory: 85 }`.
  - `disabledReason`: The text to display when requirements aren't met (e.g., *"Energy depleted: Cannot initiate verbal communication."*).


### 3.2 The Logic Layer (React Hooks)
- **`hooks/useGameEngine.ts`**: Tracks current Beat index (0 to 6), manages stat changes, and checks for "Shutdown Mode". Advances to the next Beat when a choice's consequence is acknowledged by the player.

### 3.3 The UI Layer (Sensory Representation)
- **`components/HUD.tsx`**: Top bar with the 3 stats and the ticking clock (e.g., "07:30 AM").
- **`components/StoryPanel.tsx`**: Renders the narrative and consequence texts. Applies severe CSS text-blur, glitching, and shaking animations based on Sensory Overload.
- **`components/ActionArea.tsx`**: Renders the choices. If a choice fails its `requirements` check, it is rendered with a harsh CSS strikethrough line, lowered opacity, and prominently displays the `disabledReason` in a muted or warning color right below the action text.


### 3.4 The API Layer (The Climax: Terminal Override)
- **`app/api/terminal-override/route.ts`**: The ONLY AI component.
- **Trigger**: Reaching the end of Beat 7 (11:00 PM - The Final Echo). 
- **Mechanic**: The UI shatters. All buttons disappear. A single, blinking text input remains. The player must type a final message to Lynn, who is on the edge of giving up.
- **The Empathy Judge (LLM Prompt Logic)**:
  - **[FAIL]** *Toxic Positivity / Fix-it mode* ("Just cheer up", "Report her to HR", "Find a new job"). -> **Result**: Lynn's fate is unchanged. The screen fades to black. The system breaks her.
  - **[PASS]** *Deep Validation / Radical Acceptance* ("I see how hard you tried. It's not your fault. The world is too loud, but you don't have to mask anymore.") -> **Result**: She decides to keep living. She unmasks, accepts the H1B countdown not as a death sentence, but as a release. True Ending unlocked.



