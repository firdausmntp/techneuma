<div align="center">
  
  # ⚡ TECHNEUMA ⚡
  
  **The Ultimate Cross-Provider AI Skill & Command Library**
  
  [![NPM Version](https://img.shields.io/npm/v/techneuma?style=for-the-badge&color=ff69b4)](https://www.npmjs.com/package/techneuma)
  [![NPM Downloads](https://img.shields.io/npm/dt/techneuma?style=for-the-badge&color=blue)](https://www.npmjs.com/package/techneuma)
  [![License](https://img.shields.io/badge/License-Apache_2.0-blueviolet?style=for-the-badge)](LICENSE)

  *Equip your AI assistants with 52 expert technical skills, 20 precise steering commands, <br>and strict architectural DOs & DON'Ts for production-grade software.*

</div>

<br>

> ⚠️ **The Problem:** Every LLM learns from the same generic templates. Without guidance, you get predictable mistakes: non-semantic HTML, terrible variable naming, monolithic components, and generic "AI slop" aesthetics.
>
> 💡 **The Solution:** **Techneuma fights that bias.** Evolved from core concepts like Anthropic's `frontend-design` and the *Impeccable* system, Techneuma is a massive powerhouse covering frontend, backend, native mobile, infrastructure, and QA domains.

---

## 🚀 Quick Installation (NPM)

Techneuma is fully interactive and installs in seconds. Open your terminal at your project root and run:

```bash
npx techneuma init <provider>
```

**Supported Providers:**
- `cursor` (Generated in `.cursor/`)
- `claude` (Generated in `.claude/`)
- `agents` (VS Code GitHub Copilot in `.agents/`)
- `gemini` (Generated in `.gemini/`)
- `codex` (Generated in `.codex/`)

*Read more on [npmjs.com/package/techneuma](https://www.npmjs.com/package/techneuma)*

---

## 🛠️ The 52-Skill Arsenal

Techneuma injects expert-level knowledge across multiple software paradigms. Instead of generic AI output, your agent becomes a senior engineer in these specific stacks:

### 🎨 Frontend & Mobile
`react` `react-native` `vue` `svelte` `angular` `nextjs` `flutter` `tailwind` `frontend-design` `state-management` `accessibility`

### ⚙️ Backend & Architecture
`backend-design` `api-design` `graphql` `websockets` `database` `monorepo` `electron` `cli` `headless-cms` `llm-integration` 

### 🔒 Security, QA & Infrastructure
`security-review` `devops-delivery` `docker` `testing` `qa-strategy` `performance`

---

## 🕹️ 20 Precision Steering Commands

Take absolute control of your AI's output using precision commands directly in your chat prompt. Tell the AI exactly how to behave mid-conversation.

| Command | Action / Behavior |
|:---|:---|
| 🛡️ **Architecture & Integrity:** | |
| `/audit` | Run deep technical checks (a11y, performance, responsive, security). |
| `/critique` | UX / Architecture review based on firm heuristics. |
| `/normalize` | Align code with strict design system and repo standards. |
| `/security-review` | Thoroughly assess code for vulnerabilities and exposures. |
| 🧹 **Refactoring & Cleanup:** | |
| `/polish` | The final 10% — flawless cleanup before shipping. |
| `/distill` | Strip away unnecessary complexity (KISS principle). |
| `/harden` | Bulletproof error handling, edge cases, and typing. |
| `/optimize` | Maximize performance, tree-shaking, and rendering. |
| `/extract` | Refactor inline code into reusable, atomic components. |
| 🚀 **Execution & Styling:** | |
| `/overdrive` | Push boundaries with technically extraordinary solutions. |
| *(Quick Modifiers)* | `/adapt`, `/animate`, `/arrange`, `/colorize`, `/clarify`, `/bolder`, `/quieter`, `/delight`, `/onboard`, `/teach-impeccable`, `/typeset` |

---

## 💡 How It Works / Usage

Once installed mapping folders (like `.cursor/` or `.agents/`) are placed in your workspace. From there, your AI automatically understands the custom framework.

**Examples of how to talk to your AI:**
> *"Please `/audit` the authentication flow in `auth.ts` and ensure it follows our `/security-review` standards."*

> *"Build a new hero section. Make it `/bolder` and `/animate` the entry sequences."*

---

## 📦 Manual Build (For Contributors)

Techneuma uses a Universal Build System: One source of truth automatically compiles into optimized assets for 8+ native AI runtime extensions.

```bash
git clone https://github.com/firdausmntp/techneuma.git
cd techneuma
bun install
bun run build
```
*(The `dist/` folder now contains universally compatible outputs for Cursor, Claude, VS Code Agents, Gemini, and Codex!)*

---

## 🤝 Contributing

We welcome structural improvements, new domains, and refined AI heuristics.
1. Add new skill definitions to `source/skills/`.
2. Document rigorous DO/DON'T metrics in a nested `reference/examples.md` file for your skill.
3. Verify output counts via `bun run build`.

See [DEVELOP.md](DEVELOP.md) for deeper architectural insights.

---

<div align="center">
  <b>License</b>: Apache 2.0 | Brought to you with 💙 by Firdaus Satrio Utomo & open-source contributors. <br>
  <i>Core architectural systems adapted from Anthropic's frontend-design and Paul Bakaus' Impeccable.</i>
</div>