```markdown
# 🌌 Terminal Override: An ASD Survival Narrative

> "The system's words couldn't reach him. Now, use your own."

**Terminal Override** is a browser-based interactive fiction game that explores the grueling reality of Autistic Burnout, workplace gaslighting, and the H1B visa trap. 

Unlike traditional visual novels where pre-defined choices dictate the ending, this game features a meta-narrative twist: **the system eventually breaks down.** In the final act, players must break the fourth wall and type a genuine message to save the protagonist. A live Large Language Model (LLM) evaluates the player's input in real-time, judging it against clinical empathy criteria (avoiding toxic positivity and neurotypical logic) to determine the final ending.

## Core Features

* **Sensory Overload Mechanics:** UI and narrative text that simulate the physical and mental toll of masking, sensory meltdowns, and executive dysfunction.
* **The "Illusion of Choice":** Traditional dialogue options (e.g., "Work harder," "Beg for mercy") only accelerate the protagonist's downfall, critiquing flawed neurotypical advice.
* **LLM-Powered Meta-Ending:** * Integrates **Google Gemini API** to act as the protagonist's inner consciousness.
  * Real-time semantic analysis: The LLM scans the player's manually typed message to detect "Sensory Validation," "Systemic Empathy," or harmful "Toxic Positivity."
  * Typewriter-style terminal diagnostics that provide clinical feedback on *why* the player's words were helpful or fatal.
* **Educational Post-Mortem:** A data-driven incident report exposing real-world statistics about the 80% unemployment rate among autistic adults and the structural violence of the H1B visa system.

## 🛠️ Tech Stack

* **Frontend:** React (Vite) / JavaScript / CSS3
* **AI Integration:** Google Gen AI SDK (`@google/genai`) 
* **Styling:** Custom CSS with CRT terminal effects, glitch animations, and cyberpunk neon aesthetics.
* **Deployment:** Netlify / Vercel (Fully client-side architecture)

## How to Run Locally

1. **Clone the repository:**
   ```bash
   git clone [https://github.com/yourusername/your-repo-name.git](https://github.com/yourusername/your-repo-name.git)
   cd your-repo-name

```

2. **Install dependencies:**
```bash
npm install

```


3. **Set up Environment Variables:**
Create a `.env` file in the root directory and add your Google Gemini API key:
```env
VITE_GEMINI_API_KEY=your_actual_api_key_here

```


*(Note: Never commit your `.env` file. Ensure it is listed in your `.gitignore`.)*
4. **Start the development server:**
```bash
npm run dev

```



## Thematic Focus: Why this game?

Many interventions for autistic individuals are designed by and for neurotypical minds. Telling an ASD person in active sensory meltdown to "just relax," or pointing out the "logical" solution to an H1B crisis, often registers as profound invalidation. This game is an interactive empathy test, forcing players to abandon cliché comforts and truly *see* the individual behind the diagnosis.

## Contributing

Feel free to open issues or submit pull requests for typo fixes, accessibility improvements, or enhanced UI glitch effects.

```
