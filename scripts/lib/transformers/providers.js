/**
 * Provider configurations for the transformer factory.
 *
 * Each config specifies:
 * - provider: key into PROVIDER_PLACEHOLDERS (e.g. 'claude-code')
 * - configDir: dot-directory name (e.g. '.claude')
 * - displayName: human-readable name for log output (e.g. 'Claude Code')
 * - frontmatterFields: which optional fields to emit beyond name + description
 * - bodyTransform: optional function (body, skill) => transformed body
 */
export const PROVIDERS = {
  cursor: {
    provider: 'cursor',
    configDir: '.cursor',
    displayName: 'Cursor',
    frontmatterFields: ['license', 'compatibility', 'metadata'],
  },
  'claude-code': {
    provider: 'claude-code',
    configDir: '.claude',
    displayName: 'Claude Code',
    frontmatterFields: ['user-invocable', 'argument-hint', 'license', 'compatibility', 'metadata', 'allowed-tools'],
  },
  gemini: {
    provider: 'gemini',
    configDir: '.gemini',
    displayName: 'Gemini',
    frontmatterFields: [],
  },
  codex: {
    provider: 'codex',
    configDir: '.codex',
    displayName: 'Codex',
    frontmatterFields: ['argument-hint', 'license'],
  },
  agents: {
    provider: 'agents',
    configDir: '.agents',
    displayName: 'Agents',
    frontmatterFields: ['user-invocable', 'argument-hint', 'license', 'compatibility', 'metadata'],
  },
  kiro: {
    provider: 'kiro',
    configDir: '.kiro',
    displayName: 'Kiro',
    frontmatterFields: ['license', 'compatibility', 'metadata'],
  },
  opencode: {
    provider: 'opencode',
    configDir: '.opencode',
    displayName: 'OpenCode',
    frontmatterFields: ['user-invocable', 'argument-hint', 'license', 'compatibility', 'metadata', 'allowed-tools'],
  },
  pi: {
    provider: 'pi',
    configDir: '.pi',
    displayName: 'Pi',
    frontmatterFields: ['license', 'compatibility', 'metadata', 'allowed-tools'],
  },
  'trae-cn': {
    provider: 'trae-cn',
    configDir: '.trae-cn',
    displayName: 'Trae China',
    placeholderProvider: 'trae',
    frontmatterFields: ['user-invocable', 'argument-hint', 'license', 'compatibility', 'metadata'],
  },
  trae: {
    provider: 'trae',
    configDir: '.trae',
    displayName: 'Trae',
    frontmatterFields: ['user-invocable', 'argument-hint', 'license', 'compatibility', 'metadata'],
  },
  'rovo-dev': {
    provider: 'rovo-dev',
    configDir: '.rovodev',
    displayName: 'Rovo Dev',
    frontmatterFields: ['user-invocable', 'argument-hint', 'license', 'compatibility', 'metadata', 'allowed-tools'],
  },
  windsurf: {
    provider: 'windsurf',
    configDir: '.windsurf',
    displayName: 'Windsurf',
    frontmatterFields: ['license'],
  },
  cline: {
    provider: 'cline',
    configDir: '.cline',
    displayName: 'Cline',
    frontmatterFields: ['license'],
  },
  aider: {
    provider: 'aider',
    configDir: '.aider',
    displayName: 'Aider',
    frontmatterFields: ['license'],
  },
  amp: {
    provider: 'amp',
    configDir: '.amp',
    displayName: 'Amp',
    frontmatterFields: ['license'],
  },
  'continue-dev': {
    provider: 'continue-dev',
    configDir: '.continue',
    displayName: 'Continue',
    frontmatterFields: ['license'],
  },
  zed: {
    provider: 'zed',
    configDir: '.zed',
    displayName: 'Zed AI',
    frontmatterFields: ['license'],
  },
  jetbrains: {
    provider: 'jetbrains',
    configDir: '.junie',
    displayName: 'JetBrains AI',
    frontmatterFields: ['license'],
  },
  void: {
    provider: 'void',
    configDir: '.void',
    displayName: 'Void',
    frontmatterFields: ['license'],
  },
  pearai: {
    provider: 'pearai',
    configDir: '.pearai',
    displayName: 'PearAI',
    frontmatterFields: ['license'],
  },
  qwen: {
    provider: 'qwen',
    configDir: '.qwen',
    displayName: 'Qwen Code',
    frontmatterFields: ['license'],
  },
};
