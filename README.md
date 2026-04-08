<div align="center">
  
# ⚡ TECHNEUMA

**The Ultimate Cross-Provider AI Skill Library**

[![npm version](https://img.shields.io/npm/v/techneuma?style=for-the-badge&color=ff69b4)](https://www.npmjs.com/package/techneuma)
[![npm downloads](https://img.shields.io/npm/dt/techneuma?style=for-the-badge&color=blue)](https://www.npmjs.com/package/techneuma)
[![License](https://img.shields.io/badge/license-Apache_2.0-blueviolet?style=for-the-badge)](LICENSE)
[![Skills](https://img.shields.io/badge/skills-63-brightgreen?style=for-the-badge)](https://www.npmjs.com/package/techneuma)
[![Providers](https://img.shields.io/badge/providers-21-orange?style=for-the-badge)](https://www.npmjs.com/package/techneuma)

*63 expert AI agent skills · 20 steering commands · 21 providers*
*Cursor · Claude Code · VS Code Copilot · Gemini · Codex · Kiro · OpenCode · Pi · Trae · Rovo Dev*
*Windsurf · Cline · Aider · Amp · Continue · Zed AI · JetBrains AI · Void · PearAI · Qwen Code*

</div>

---

> **The Problem:** Every LLM learns from the same generic templates. Without guidance, you get non-semantic HTML, terrible variable naming, monolithic components, and "AI slop" aesthetics.
>
> **Techneuma fixes that.** It injects expert-level DOs & DON'Ts directly into your AI's context — turning generic assistants into senior engineers who understand React hooks, SQL injection prevention, proper CSS architecture, and 59 other specialized domains.

---

## 🚀 Installation

### Interactive Installer (Recommended)

```bash
npx techneuma init
```

The CLI launches an interactive prompt — pick one or multiple providers and skills get installed automatically.

### Direct Install

```bash
npx techneuma init cursor       # Install for Cursor
npx techneuma init claude       # Install for Claude Code
npx techneuma init agents       # Install for VS Code Copilot
npx techneuma init gemini       # Install for Gemini CLI
npx techneuma init codex        # Install for Codex CLI
npx techneuma init kiro         # Install for Kiro
npx techneuma init windsurf     # Install for Windsurf
npx techneuma init cline        # Install for Cline
npx techneuma init aider        # Install for Aider
npx techneuma init amp          # Install for Amp
npx techneuma init continue     # Install for Continue
npx techneuma init zed          # Install for Zed AI
npx techneuma init jetbrains    # Install for JetBrains AI
npx techneuma init void         # Install for Void
npx techneuma init pearai       # Install for PearAI
npx techneuma init qwen         # Install for Qwen Code
npx techneuma init trae         # Install for Trae
npx techneuma init trae-cn      # Install for Trae China
npx techneuma init rovo-dev     # Install for Rovo Dev
npx techneuma init opencode     # Install for OpenCode
npx techneuma init pi           # Install for Pi
```

### Other CLI Commands

```bash
npx techneuma list              # Show all available providers
npx techneuma doctor            # Check what's installed in current dir
npx techneuma uninstall cursor  # Remove a specific provider
npx techneuma uninstall all     # Remove all providers
npx techneuma init --force      # Reinstall even if already exists
```

---

## 🛠️ The 63-Skill Arsenal

Every skill teaches your AI expert-level patterns with concrete code examples, strict DOs & DON'Ts, and anti-pattern awareness.

### 🎨 Frontend Frameworks
| Skill | What It Teaches |
|:------|:----------------|
| `react` | Hooks, composition, performance, component architecture |
| `vue` | Composition API, reactivity, SFC patterns |
| `svelte` | Runes, stores, compiler-optimized patterns |
| `angular` | Services, RxJS, dependency injection, enterprise patterns |
| `solidjs` | Fine-grained signals, stores, zero VDOM patterns |
| `nextjs` | App Router, Server Components, full-stack React |
| `nuxt` | Auto-imports, hybrid rendering, server routes |
| `remix` | Loaders/actions, nested routes, progressive enhancement |
| `astro` | Island architecture, content collections, zero-JS defaults |
| `flutter` | Dart, widget trees, cross-platform mobile |
| `react-native` | Native modules, navigation, cross-platform patterns |
| `vite` | Fast HMR, plugin system, build optimization, modern bundling |

### 🎨 Styling & UI
| Skill | What It Teaches |
|:------|:----------------|
| `tailwind` | Utility patterns, custom config, component extraction |
| `css-architecture` | Layers, container queries, custom properties, fluid design |
| `frontend-design` | Anti-slop aesthetics, distinctive production interfaces |
| `web-components` | Custom Elements, Shadow DOM, Lit, framework-agnostic UI |
| `htmx` | Hypermedia-driven architecture, partial page updates |
| `storybook` | Component-driven development, testing, documentation |
| `threejs` | 3D graphics, WebGL, animations, immersive web experiences |
| `pwa` | Service workers, offline support, native-like capabilities |

### ⚙️ Backend & Architecture
| Skill | What It Teaches |
|:------|:----------------|
| `api-design` | RESTful patterns, versioning, error handling |
| `backend-design` | Services, jobs, integration boundaries, failure handling |
| `graphql` | Schema design, resolvers, client integration |
| `database` | Schema patterns, queries, indexing, migrations |
| `websockets` | Real-time communication, scaling, reliability |
| `monorepo` | Turborepo, Nx, pnpm workspaces, shared packages |
| `headless-cms` | Contentful, Sanity, Strapi, content modeling |
| `llm-integration` | OpenAI, Anthropic, local models, prompt engineering |
| `cli` | Beautiful CLI tools, progressive disclosure, error handling |
| `electron` | Desktop apps, security, performance |

### 🔒 Security, QA & DevOps
| Skill | What It Teaches |
|:------|:----------------|
| `security-review` | Auth, data exposure, dependency risk, abuse paths |
| `testing` | Unit, integration, E2E, TDD strategies |
| `qa-strategy` | Release confidence, defect prevention, operational quality |
| `devops-delivery` | CI/CD, deploy, runtime, incident workflows |
| `docker` | Containerization, multi-stage builds, production patterns |
| `performance` | Core Web Vitals, bundle optimization, loading strategies |
| `accessibility` | WCAG compliance, screen readers, inclusive design |
| `authentication` | OAuth, JWT, sessions, security best practices |

### 🧠 Architecture & Patterns
| Skill | What It Teaches |
|:------|:----------------|
| `typescript` | Type safety, generics, utility types, strict patterns |
| `state-management` | React/Vue/framework-agnostic state solutions |
| `internationalization` | i18n/l10n, locale routing, cultural adaptation |
| `search` | Elasticsearch, Algolia, Meilisearch, full-text search |
| `data-engineering` | Pipelines, data models, transformation, governance |

### 🎯 20 Steering Commands
| Command | Purpose |
|:--------|:--------|
| `/audit` | Deep technical checks (a11y, perf, responsive, security) |
| `/critique` | UX/architecture review with firm heuristics |
| `/normalize` | Align with design system and repo standards |
| `/polish` | Final 10% — flawless cleanup before shipping |
| `/distill` | Strip unnecessary complexity (KISS) |
| `/harden` | Bulletproof error handling, edge cases, typing |
| `/optimize` | Maximize performance, tree-shaking, rendering |
| `/extract` | Refactor into reusable, atomic components |
| `/overdrive` | Push boundaries with extraordinary solutions |
| `/adapt` | Responsive & cross-platform adaptation |
| `/animate` | Purposeful motion & micro-interactions |
| `/arrange` | Layout, spacing, and visual rhythm |
| `/colorize` | Strategic color for engagement |
| `/clarify` | Fix unclear UX copy and labels |
| `/bolder` | Amplify safe/boring designs |
| `/quieter` | Tone down aggressive visuals |
| `/delight` | Moments of joy and personality |
| `/onboard` | First-time UX and empty states |
| `/typeset` | Typography hierarchy and readability |
| `/teach-impeccable` | One-time design context setup |

---

## 🖥️ Supported Providers

| Provider | Folder | Status |
|:---------|:-------|:-------|
| 🖱️ **Cursor** | `.cursor/` | ✅ Full support |
| 🤖 **Claude Code** | `.claude/` | ✅ Full support |
| 🧑‍💻 **VS Code Copilot** | `.agents/` | ✅ Full support |
| ♊ **Gemini CLI** | `.gemini/` | ✅ Full support |
| 📦 **Codex CLI** | `.codex/` | ✅ Full support |
| 🌀 **Kiro** | `.kiro/` | ✅ Full support |
| 🏄 **Windsurf** | `.windsurf/` | ✅ Full support |
| ⚡ **Cline** | `.cline/` | ✅ Full support |
| 🛠️ **Aider** | `.aider/` | ✅ Full support |
| 🔋 **Amp** | `.amp/` | ✅ Full support |
| ▶️ **Continue** | `.continue/` | ✅ Full support |
| ⚙️ **Zed AI** | `.zed/` | ✅ Full support |
| 🧠 **JetBrains AI** | `.junie/` | ✅ Full support |
| 🕳️ **Void** | `.void/` | ✅ Full support |
| 🍐 **PearAI** | `.pearai/` | ✅ Full support |
| 🐼 **Qwen Code** | `.qwen/` | ✅ Full support |
| 🧩 **Rovo Dev** | `.rovodev/` | ✅ Full support |
| 🔺 **Trae** | `.trae/` | ✅ Full support |
| 🔻 **Trae China** | `.trae-cn/` | ✅ Full support |
| 🔓 **OpenCode** | `.opencode/` | ✅ Full support |
| 🥧 **Pi** | `.pi/` | ✅ Full support |

---

## 💡 Usage

Once installed, the skill folders live in your project. Your AI automatically picks them up — no extra config.

**Talk to your AI like this:**

```
"Please /audit the authentication flow in auth.ts and ensure it follows
our /security-review standards."

"Build a new hero section using /astro with /tailwind styling.
Make it /bolder and /animate the entry."

"Refactor this component. /extract reusable hooks, then /polish the result."
```

---

## 📦 Manual Build (Contributors)

```bash
git clone https://github.com/firdausmntp/techneuma.git
cd techneuma
bun install
bun run build    # Compiles 63 skills × 21 providers into dist/
bun test         # Run test suite
```

---

## 🤝 Contributing

1. Add a new skill in `source/skills/<name>/SKILL.md`
2. Follow the YAML frontmatter format: `name`, `description`
3. Include concrete code examples with DO/DON'T sections
4. Run `bun run build` to verify output counts
5. Submit a PR

See [DEVELOP.md](DEVELOP.md) for architecture details.

---

<div align="center">

**License:** Apache 2.0 — [LICENSE](LICENSE)

Built with 💙 by **Firdaus Satrio Utomo** & open-source contributors
Core systems adapted from Anthropic's frontend-design and Paul Bakaus' Impeccable

[npm](https://www.npmjs.com/package/techneuma) · [GitHub](https://github.com/firdausmntp/techneuma)

</div>