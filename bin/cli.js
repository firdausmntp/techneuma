#!/usr/bin/env node

/**
 * ⚡ Techneuma CLI v0.1.0
 * Cross-provider AI skill installer for modern development tools
 */

import fs from "fs";
import path from "path";
import readline from "readline";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ─── Provider Registry ───────────────────────────────────────────────
const PROVIDERS = {
  cursor:      { folder: "cursor/.cursor",           dot: ".cursor",     label: "Cursor",                 icon: "🖱️" },
  claude:      { folder: "claude-code/.claude",       dot: ".claude",     label: "Claude Code",            icon: "🤖" },
  agents:      { folder: "agents/.agents",            dot: ".agents",     label: "VS Code Copilot Agents", icon: "🧑‍💻" },
  gemini:      { folder: "gemini/.gemini",            dot: ".gemini",     label: "Gemini CLI",             icon: "♊" },
  codex:       { folder: "codex/.codex",              dot: ".codex",      label: "Codex CLI",              icon: "📦" },
  opencode:    { folder: "opencode/.opencode",        dot: ".opencode",   label: "OpenCode",               icon: "🔓" },
  pi:          { folder: "pi/.pi",                    dot: ".pi",         label: "Pi",                     icon: "🥧" },
  kiro:        { folder: "kiro/.kiro",                dot: ".kiro",       label: "Kiro",                   icon: "🌀" },
  trae:        { folder: "trae/.trae",                dot: ".trae",       label: "Trae",                   icon: "🔺" },
  "trae-cn":   { folder: "trae-cn/.trae-cn",          dot: ".trae-cn",    label: "Trae China",             icon: "🔻" },
  "rovo-dev":  { folder: "rovo-dev/.rovodev",          dot: ".rovodev",    label: "Rovo Dev",               icon: "🧩" },
  windsurf:    { folder: "windsurf/.windsurf",        dot: ".windsurf",   label: "Windsurf",               icon: "🏄" },
  cline:       { folder: "cline/.cline",              dot: ".cline",      label: "Cline",                  icon: "⚡" },
  aider:       { folder: "aider/.aider",              dot: ".aider",      label: "Aider",                  icon: "🛠️" },
  amp:         { folder: "amp/.amp",                  dot: ".amp",        label: "Amp",                    icon: "🔋" },
  "continue":  { folder: "continue-dev/.continue",    dot: ".continue",   label: "Continue",               icon: "▶️" },
  zed:         { folder: "zed/.zed",                  dot: ".zed",        label: "Zed AI",                 icon: "⚙️" },
  jetbrains:   { folder: "jetbrains/.junie",          dot: ".junie",      label: "JetBrains AI (Junie)",   icon: "🧠" },
  void:        { folder: "void/.void",                dot: ".void",       label: "Void",                   icon: "🕳️" },
  pearai:      { folder: "pearai/.pearai",            dot: ".pearai",     label: "PearAI",                 icon: "🍐" },
  qwen:        { folder: "qwen/.qwen",                dot: ".qwen",      label: "Qwen Code",              icon: "🐼" },
};

const PROVIDER_NAMES = Object.keys(PROVIDERS);

// ─── Helpers ─────────────────────────────────────────────────────────
function copyDirSync(src, dest) {
  fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    entry.isDirectory() ? copyDirSync(srcPath, destPath) : fs.copyFileSync(srcPath, destPath);
  }
}

function countFiles(dir) {
  let count = 0;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    count += entry.isDirectory() ? countFiles(path.join(dir, entry.name)) : 1;
  }
  return count;
}

function ask(question) {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  return new Promise((resolve) => rl.question(question, (ans) => { rl.close(); resolve(ans.trim()); }));
}

// ─── Branding ────────────────────────────────────────────────────────
const CYAN = "\x1b[36m";
const GREEN = "\x1b[32m";
const YELLOW = "\x1b[33m";
const RED = "\x1b[31m";
const BOLD = "\x1b[1m";
const DIM = "\x1b[2m";
const RESET = "\x1b[0m";

function banner() {
  console.log(`
${CYAN}${BOLD}  ╔══════════════════════════════════════════════╗
  ║            ⚡  T E C H N E U M A  ⚡           ║
  ║    Cross-Provider AI Skill Library v0.1.0      ║
  ╚══════════════════════════════════════════════════╝${RESET}
`);
}

// ─── Install Logic ───────────────────────────────────────────────────
function installProvider(name, { force = false } = {}) {
  const provider = PROVIDERS[name];
  const srcPath = path.join(__dirname, "..", "dist", provider.folder);
  const destPath = path.join(process.cwd(), provider.dot);

  if (!fs.existsSync(srcPath)) {
    console.log(`  ${RED}✗ Source not found for ${provider.label}. Run 'bun run build' first.${RESET}`);
    return false;
  }

  const existed = fs.existsSync(destPath);

  if (existed && !force) {
    console.log(`  ${YELLOW}⚠${RESET} ${provider.icon}  ${BOLD}${provider.label}${RESET} ${DIM}already exists at ${provider.dot}/${RESET} ${DIM}[Skipped — use --force to overwrite]${RESET}`);
    return "skipped";
  }

  copyDirSync(srcPath, destPath);
  const fileCount = countFiles(destPath);

  const action = existed ? "Updated" : "Installed";
  console.log(`  ${GREEN}✓${RESET} ${provider.icon}  ${BOLD}${provider.label}${RESET} → ${DIM}${provider.dot}/${RESET} ${DIM}(${fileCount} files)${RESET} ${DIM}[${action}]${RESET}`);
  return true;
}

// ─── Commands ────────────────────────────────────────────────────────

async function cmdInit(providerArg) {
  const forceFlag = args.includes("--force") || args.includes("-f");

  // If a specific provider was given, install it directly
  if (providerArg && providerArg !== "--force" && providerArg !== "-f") {
    const name = providerArg.toLowerCase();
    if (!PROVIDERS[name]) {
      console.log(`\n  ${RED}✗ Unknown provider: "${providerArg}"${RESET}`);
      console.log(`  ${DIM}Available: ${PROVIDER_NAMES.join(", ")}${RESET}\n`);
      process.exit(1);
    }
    banner();
    console.log(`${BOLD}  Installing skills for ${PROVIDERS[name].label}...${RESET}\n`);
    const ok = installProvider(name, { force: forceFlag });
    if (ok === true) printPostInstall([name]);
    else if (ok === "skipped") printSkippedHint();
    return;
  }

  // Interactive mode
  banner();
  console.log(`${BOLD}  Which providers do you want to install?${RESET}\n`);
  
  PROVIDER_NAMES.forEach((name, i) => {
    const p = PROVIDERS[name];
    console.log(`    ${DIM}${i + 1})${RESET} ${p.icon}  ${BOLD}${p.label}${RESET} ${DIM}(${p.dot})${RESET}`);
  });
  console.log(`    ${DIM}A)${RESET} 🌐  ${BOLD}All Providers${RESET}`);
  console.log();

  const answer = await ask(`  ${CYAN}Enter choices (e.g. 1,3,5 or A for all): ${RESET}`);

  let selected = [];
  if (answer.toLowerCase() === "a" || answer.toLowerCase() === "all") {
    selected = [...PROVIDER_NAMES];
  } else {
    const nums = answer.split(/[,\s]+/).map(Number).filter(Boolean);
    selected = nums.map((n) => PROVIDER_NAMES[n - 1]).filter(Boolean);
  }

  if (selected.length === 0) {
    console.log(`\n  ${RED}✗ No valid providers selected.${RESET}\n`);
    process.exit(1);
  }

  console.log(`\n${BOLD}  Installing ${selected.length} provider(s)...${RESET}\n`);

  const installed = [];
  const skipped = [];
  for (const name of selected) {
    const result = installProvider(name, { force: forceFlag });
    if (result === true) installed.push(name);
    else if (result === "skipped") skipped.push(name);
  }

  if (installed.length > 0) printPostInstall(installed);
  if (skipped.length > 0 && installed.length === 0) printSkippedHint();
}

function cmdList() {
  banner();
  console.log(`${BOLD}  Available Providers:${RESET}\n`);
  PROVIDER_NAMES.forEach((name) => {
    const p = PROVIDERS[name];
    console.log(`    ${p.icon}  ${BOLD}${p.label.padEnd(26)}${RESET} ${DIM}${p.dot}${RESET}`);
  });

  // Count skills
  const skillsPath = path.join(__dirname, "..", "dist", "cursor", ".cursor", "skills");
  if (fs.existsSync(skillsPath)) {
    const skillCount = fs.readdirSync(skillsPath).length;
    console.log(`\n  ${DIM}Each provider ships with ${BOLD}${skillCount} skills${RESET}${DIM} and reference files.${RESET}`);
  }
  console.log();
}

function cmdDoctor() {
  banner();
  console.log(`${BOLD}  Checking installed providers in current directory...${RESET}\n`);

  let foundAny = false;
  for (const name of PROVIDER_NAMES) {
    const p = PROVIDERS[name];
    const dotPath = path.join(process.cwd(), p.dot);
    if (fs.existsSync(dotPath)) {
      const fileCount = countFiles(dotPath);
      console.log(`  ${GREEN}✓${RESET} ${p.icon}  ${BOLD}${p.label}${RESET} ${DIM}(${fileCount} files)${RESET}`);
      foundAny = true;
    }
  }

  if (!foundAny) {
    console.log(`  ${YELLOW}⚠ No Techneuma providers found in this directory.${RESET}`);
    console.log(`  ${DIM}Run 'npx techneuma init' to install.${RESET}`);
  }
  console.log();
}

function cmdUninstall(providerArg) {
  if (!providerArg) {
    console.log(`\n  ${RED}✗ Usage: techneuma uninstall <provider>${RESET}`);
    console.log(`  ${DIM}Available: ${PROVIDER_NAMES.join(", ")}, all${RESET}\n`);
    process.exit(1);
  }

  banner();
  const targets = providerArg.toLowerCase() === "all" ? [...PROVIDER_NAMES] : [providerArg.toLowerCase()];

  for (const name of targets) {
    const p = PROVIDERS[name];
    if (!p) { console.log(`  ${RED}✗ Unknown provider: "${name}"${RESET}`); continue; }

    const dotPath = path.join(process.cwd(), p.dot);
    if (fs.existsSync(dotPath)) {
      fs.rmSync(dotPath, { recursive: true });
      console.log(`  ${GREEN}✓${RESET} ${p.icon}  ${BOLD}${p.label}${RESET} removed ${DIM}(${p.dot})${RESET}`);
    } else {
      console.log(`  ${DIM}—${RESET} ${p.icon}  ${p.label} not found, skipped`);
    }
  }
  console.log();
}

function printPostInstall(names) {
  console.log(`\n  ${GREEN}${BOLD}Done!${RESET} ${names.length} provider(s) installed.\n`);
  console.log(`  ${DIM}Next steps:${RESET}`);
  console.log(`  ${DIM}  • Commit the dotfolders so your team gets the same AI context${RESET}`);
  console.log(`  ${DIM}  • Use /audit, /polish, /harden commands in your AI chat${RESET}`);
  console.log(`  ${DIM}  • Run 'npx techneuma doctor' to verify installations${RESET}`);
  console.log();
}

function printSkippedHint() {
  console.log(`\n  ${DIM}To overwrite existing installations, run with ${BOLD}--force${RESET}${DIM}:${RESET}`);
  console.log(`  ${DIM}  npx techneuma init <provider> --force${RESET}`);
  console.log();
}

function showHelp() {
  banner();
  console.log(`${BOLD}  Usage:${RESET}
  
    ${CYAN}techneuma init${RESET} ${DIM}[provider]${RESET}       Install skills (interactive if no provider given)
    ${CYAN}techneuma init${RESET} ${DIM}[provider] -f${RESET}    Force overwrite existing installation
    ${CYAN}techneuma list${RESET}                   Show all available providers
    ${CYAN}techneuma doctor${RESET}                 Check installed providers in cwd
    ${CYAN}techneuma uninstall${RESET} ${DIM}<provider>${RESET}   Remove a provider (or 'all')
    ${CYAN}techneuma help${RESET}                   Show this help message

  ${BOLD}Flags:${RESET}
    ${DIM}--force, -f${RESET}   Overwrite existing installations

  ${BOLD}Providers:${RESET}
`);
  PROVIDER_NAMES.forEach((name) => {
    const p = PROVIDERS[name];
    console.log(`    ${p.icon}  ${name.padEnd(12)} ${DIM}${p.label}${RESET}`);
  });
  
  console.log(`
  ${BOLD}Examples:${RESET}

    ${DIM}$${RESET} npx techneuma init              ${DIM}# Interactive multi-select${RESET}
    ${DIM}$${RESET} npx techneuma init cursor        ${DIM}# Install Cursor skills${RESET}
    ${DIM}$${RESET} npx techneuma init claude        ${DIM}# Install Claude Code skills${RESET}
    ${DIM}$${RESET} npx techneuma doctor             ${DIM}# Check what's installed${RESET}
    ${DIM}$${RESET} npx techneuma uninstall all      ${DIM}# Remove everything${RESET}
  `);
}

// ─── Entry Point ─────────────────────────────────────────────────────
const args = process.argv.slice(2);
const command = args[0];

switch (command) {
  case "init":
    await cmdInit(args[1]);
    break;
  case "list":
  case "ls":
    cmdList();
    break;
  case "doctor":
  case "check":
    cmdDoctor();
    break;
  case "uninstall":
  case "remove":
    cmdUninstall(args[1]);
    break;
  case "help":
  case "--help":
  case "-h":
    showHelp();
    break;
  default:
    showHelp();
    break;
}
