#!/usr/bin/env node

/**
 * ⚡ Techneuma CLI
 * Quickly scaffold AI skills for different harnesses
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const args = process.argv.slice(2);
const command = args[0];
const targetProvider = args[1];

const PROVIDERS = {
  "cursor": "cursor/.cursor",
  "claude": "claude-code/.claude",
  "agents": "agents/.agents",
  "gemini": "gemini/.gemini",
  "codex": "codex/.codex",
  "opencode": "opencode/.opencode",
  "pi": "pi/.pi",
  "kiro": "kiro/.kiro",
};

function copyDirSync(src, dest) {
  fs.mkdirSync(dest, { recursive: true });
  const entries = fs.readdirSync(src, { withFileTypes: true });
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDirSync(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

function showHelp() {
  console.log(`
⚡ Techneuma CLI

Usage:
  npx techneuma init <provider>

Available Providers:
  cursor    (Cursor Settings)
  claude    (Claude Code)
  agents    (VS Code Copilot / Antigravity)
  gemini    (Gemini CLI)
  codex     (Codex CLI)
  opencode  (OpenCode)
  pi        (Pi)
  kiro      (Kiro)

Examples:
  npx techneuma init cursor
  npx techneuma init claude
  `);
}

if (command === "init") {
  const providerName = targetProvider ? targetProvider.toLowerCase() : null;

  if (!providerName || !PROVIDERS[providerName]) {
    console.error(`\n❌ Error: Invalid or missing provider.`);
    showHelp();
    process.exit(1);
  }

  const srcPath = path.join(__dirname, "..", "dist", PROVIDERS[providerName]);
  // The destination is based on the folder name (e.g. .cursor, .claude)
  const destFolderName = PROVIDERS[providerName].split('/')[1]; 
  const destPath = path.join(process.cwd(), destFolderName);

  if (!fs.existsSync(srcPath)) {
    console.error(`\n❌ Error: Source directory not found at ${srcPath}`);
    console.error(`Are you running this from a built package? Make sure to run 'bun run build' first.\n`);
    process.exit(1);
  }

  console.log(`\n🚀 Siphoning Techneuma skills into [${providerName}]...\n`);
  copyDirSync(srcPath, destPath);
  
  console.log(`✅ Successfully installed skills into: ./${destFolderName}`);
  console.log(`💡 Tip: Remember to commit these files so your entire team shares the same AI context!\n`);
} else {
  showHelp();
}
