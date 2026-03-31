# ⚡ Techneuma

> **The ultimate multi-domain AI skill library.** Equip your AI codebase assistants with 52 expert technical skills, 20 precise steering commands, and strict architectural DOs & DON'Ts.

Every LLM learned from the same generic templates. Without guidance, you get predictable mistakes: non-semantic HTML, terrible variable naming, monolithic components, and generic "AI slop" aesthetics. 

**Techneuma fights that bias.** Evolved from core concepts like Anthropic's `frontend-design` and the *Impeccable* system, Techneuma has grown into a massive powerhouse covering frontend, backend, native mobile, infrastructure, and QA domains.

### ✨ What's Inside Techneuma?

- **52 Specialized AI Skills**: Deep domain expertise across massive technology stacks (`react`, `angular`, `vue`, `svelte`, `nextjs`, `flutter`), infrastructure (`docker`, `devops`), backend (`api-design`, `database`, `graphql`), and broad domains (`security-review`, `performance`).
- **Strict DOs & DON'Ts**: Every skill comes equipped with an intensive `examples.md` library detailing EXACTLY how the AI should code, and what "lazy" patterns to aggressively avoid.
- **20 Steering Commands**: Specialized invocation commands (like `/audit`, `/harden`, `/polish`) to direct your AI mid-conversation.
- **Universal Build System**: One source of truth automatically compiles into optimized assets for 8+ native AI runtime extensions.

---

## 🛠️ The 52-Skill Arsenal

Techneuma injects expert-level knowledge across multiple software paradigms. Here is a sneak peek of the disciplines included:

### 🎨 Frontend & Mobile
`react`, `react-native`, `vue`, `svelte`, `angular`, `nextjs`, `flutter`, `tailwind`, `frontend-design`, `state-management`

### ⚙️ Backend & Architecture
`backend-design`, `api-design`, `graphql`, `websockets`, `database`, `monorepo`, `electron`, `cli`, `headless-cms`

### 🔒 Security, QA & Infrastructure
`security-review`, `devops-delivery`, `docker`, `testing`, `qa-strategy`, `performance`, `accessibility`, `llm-integration`

---

## 🕹️ The 20 Steering Commands

Take control of your AI's output using precision commands directly in your prompt:

| Command | Action |
|---------|--------------|
| `/audit` | Run deep technical checks (a11y, performance, responsive, security). |
| `/critique` | UX / Architecture review based on heuristics. |
| `/normalize` | Align code with strict design system and repo standards. |
| `/polish` | The final 10% — flawless cleanup before shipping. |
| `/distill` | Strip away unnecessary complexity (KISS principle). |
| `/harden` | Bulletproof error handling, edge cases, and typing. |
| `/optimize` | Maximize performance, tree-shaking, and rendering. |
| `/overdrive` | Push boundaries with technically extraordinary solutions. |
| `/extract` | Refactor inline code into reusable, atomic components. |
| *(Quick Fixes)* | `/adapt`, `/animate`, `/arrange`, `/colorize`, `/clarify`, `/bolder`, `/quieter`, `/delight`, `/onboard`, `/teach-impeccable`, `/typeset` |

---

## 🚀 Installation & Setup

Techneuma is incredibly easy to install locally for your specific IDE using our official `npx` CLI scaffolding!

### 1. Zero-dependency Installation (NPM)
Navigate to your project root and simply run:
```bash
# E.g. npx techneuma init cursor
npx techneuma init <provider>
```

**Available Providers:**
- `cursor` (.cursor)
- `claude` (.claude)
- `agents` (VS Code Copilot .agents)
- `gemini` (.gemini)
- `codex` (.codex)

### 2. Manual Clone & Build (For Contributors)
If you want to contribute, clone the repository and run the build:
```bash
bun install
bun run build
```
*(The `dist/` folder now contains universally compatible outputs for 8+ AI tools!)*

### 💻 VS Code / GitHub Copilot Agents
Techneuma natively supports modern VS Code Copilot `.agents` architectures.
```bash
cp -r dist/agents/.agents your-project/
```

### 🪄 Cursor
Copy the generated Cursor configurations directly into your workspace:
```bash
cp -r dist/cursor/.cursor your-project/
```
*(Requires Agent Skills to be enabled in Cursor Settings)*

### 🤖 Claude Code
Add to a specific project, or your global Claude config:
```bash
# Project-specific
cp -r dist/claude-code/.claude your-project/

# Global (applies to all projects)
cp -r dist/claude-code/.claude/* ~/.claude/
```

### ⚡ Other Supported Harnesses
Simply copy the generated folders from `dist/` for:
- **Gemini CLI** (`.gemini`)
- **Codex CLI** (`.codex`)
- **OpenCode** (`.opencode`)
- **Pi** (`.pi`)
- **Kiro** (`.kiro`)

---

## 💡 Usage Highlights

Once the `.agents`, `.cursor` or `.claude` folders are dropped into your workspace, invoke the commands in your chat interface!

> **You:** "Please `/audit` the authentication flow in `auth.ts` and ensure it follows our `/security-review` standards."

> **You:** "Build a new hero section. Make it `/bolder` and `/animate` the entry sequences."

---

## 🤝 Contributing

We welcome structural improvements, new domains, and refined AI heuristics.
1. Add new skill definitions to `source/skills/`.
2. Document rigorous DO/DON'T metrics in a nested `reference/examples.md` files for your skill.
3. Verify output counts via `bun run build`.

See [DEVELOP.md](DEVELOP.md) for deeper architectural insights.

---
**License**: Apache 2.0. See [LICENSE](LICENSE).  
*Core architectural systems adapted from Anthropic's frontend-design and Impeccable.*