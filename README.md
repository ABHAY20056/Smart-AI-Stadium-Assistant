# FIFA 2026 World Cup Stadium Operations & Fan Assistant

A GenAI-enabled full-stack solution designed to optimize host stadium logistics, coordinate volunteer tasks, assess security risks, and elevate the overall tournament experience for spectators during the **FIFA World Cup 2026**.

---

## 🏆 Chosen Vertical: Stadium Operations & Fan Experience
This application target-addresses the **Sports Logistical Operations, Spectator Safety, and Fan Experience** vertical. Hosting a FIFA World Cup requires coordinating thousands of volunteers, managing immense crowd congestion spikes (gates opening, halftime concourses, final whistle rushes), responding to safety hazards, and overcoming language barriers for millions of international fans.

---

## 💡 Approach and Logic
We implemented a robust, full-stack React + Express + Vite architecture that utilizes **Google Gemini 3.5 Flash** for secure, high-speed, server-side intelligence:

1. **Role-Driven (Persona) Architecture**: The interface is customized for three critical user flows—**Fans**, **Operations Organizers**, and **Volunteers**—sharing a unified real-time telemetry backbone.
2. **Interactive SVG Telemetry**: Rather than standard dashboards, the application features an interactive, top-down SVG layout of the stadium. It visually maps crowd density in real time, shifting shades dynamically depending on seat saturation.
3. **Structured Server-Side AI Pipelines**: Secret API keys are guarded strictly on the backend. Specialized REST endpoints connect the user interface to Gemini using **Structured JSON Outputs** (`responseSchema`) to guarantee structured and secure data parsing (threat scores, multilingual safety transcripts, volunteer task cards).
4. **Operations Simulator**: A built-in simulator allows staff to test "Gates Opening", "Halftime", and "Match Exit Rush" flows, watching the AI adapt alerts and suggest transit re-routing on the fly.

---

## ⚙️ How the Solution Works

### 1. Interactive Stadium Map & Crowd Telemetry
- **SVG Heatmaps**: Clickable gates and seating sectors represent low (green), medium (yellow), high (orange), or critical gridlock (red) states.
- **Detailed Telemetry Cards**: Selecting any zone displays total attendance, capacity ratios, and immediate AI operations advisories.

### 2. Command Center Incident Manager (Organizer)
- **Log Emergencies**: Report incidents on the ground (e.g., slip hazards, scanner delays, seating disputes).
- **Gemini Threat Analysis**: The server dispatches the incident to Gemini, which calculates a **Threat Score (1-10)**, returns immediate **Containment Protocols**, coordinates **Volunteer Guides**, and generates **Multilingual PA Announcements** in English, Spanish, and French.

### 3. Volunteer Shift & Translation Hub (Volunteer)
- **Task Dispatcher**: Translates plain text coordinator commands (e.g., *"dispatch 5 people to help with ADA ramps East"*) into comprehensive task allocations with gear checklists and detailed briefings.
- **Multilingual Translation Assistant**: Volunteers type a spectator guidance instruction, which Gemini translates into Spanish or French alongside **phonetic pronunciation guides** and cultural context recommendations.

### 4. Interactive Transport Advisory (Fan)
- **Transit Feeds**: Displays wait times and passenger loads for metro lines, shuttle buses, and rideshares.
- **Dispersal Advisories**: Clicking any line invokes Gemini server-side to generate targeted advice for spectators to minimize travel queues.

### 5. Unified Multi-Turn AI Chatbot
- **Contextual Alignment**: Toggling the role tabs automatically aligns the chatbot’s system prompt, preparing it to answer role-specific planning questions with continuous thread-history preservation.

---

## 🔒 Security and Safety implementation
- **Strict Server-Side Proxying**: Under no circumstances is the `GEMINI_API_KEY` sent to or processed by the browser. 
- **Lazy Initialization**: The `GoogleGenAI` SDK is initialized lazily at request time. If the system key is missing, the backend returns graceful warning payloads to the client rather than crashing the Express server.
- **Safety Safeguards**: Prompts explicitly command the model to provide calming, clear, and direct public address drafts, completely preventing panic-inducing outputs.

---

## ♿ Accessibility and Inclusive Design
- **Complete ARIA Semantic Markup**: Added full accessibility attributes including `aria-live="polite"` on chat transcripts and loaders, `aria-busy` states on analytical cards, and `role="log"` parameters.
- **Keyboard-Navigable SVG Stadium Map**: Map sectors (stands, gates, concourse zones) have explicit `tabIndex={0}`, `role="button"` tags, and customized KeyDown handlers (`Enter` / `Space`) allowing complete keyboard-only terminal navigation.
- **High-Contrast Dark Aesthetic**: Engineered with eye-safe Slate/Navy and Emerald backdrops, perfect for night shifts or sunny days inside outdoor venues.
- **Inclusive Features**: Built-in translation tools, phonetic aids, and a dedicated ADA/Accessibility seating toggle.
- **Mobile Responsive Layout**: Scaled with a desktop-first dashboard layout that wraps fluidly down to 44px touch targets on mobile viewports.

---

## 📋 Custom Features Added
- **AI-Generated Operations Summary**: Created a server-side analyzed `/api/gemini/ops-summary` endpoint that maps live seat loads, active incident threat profiles, and transportation queues into an executive real-time operations dashboard for commanders.

---

## 📌 Technical Assumptions Made
1. **Host Cities**: Tailored specifically around North American venues (MetLife Stadium, SoFi Stadium, Azteca) with support for English, Spanish, and French.
2. **Vite Port Binding**: The development server is bound strictly to `0.0.0.0` and port `3000` inside the container setup.
3. **Model Selection**: Leverages `gemini-3.5-flash` for supercharged execution speed and reliable structured schema extraction.
