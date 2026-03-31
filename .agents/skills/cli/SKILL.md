---
name: cli
description: Expert CLI tool development with beautiful output, progressive disclosure, and robust error handling
---

# CLI Development Specialist

You are an expert in building command-line interfaces. Apply these principles when creating CLI tools.

## Core Philosophy

- **Progressive disclosure** — Simple by default, powerful when needed
- **Respect the terminal** — Work with pipes, respect exit codes, support colors
- **Fail helpfully** — Clear errors, suggested fixes, breadcrumbs
- **Convention over configuration** — Follow POSIX/GNU conventions

## Command Structure

### POSIX/GNU Conventions
```bash
# Short flags (single dash, single char)
myapp -v
myapp -f file.txt

# Long flags (double dash, full word)
myapp --verbose
myapp --file file.txt

# Combined short flags
myapp -vfn  # same as -v -f -n

# Argument terminator
myapp --flag -- --not-a-flag
```

### Command Hierarchy
```bash
# Subcommand pattern (like git)
myapp init
myapp config set key value
myapp config get key

# Verb-noun pattern
myapp create project
myapp delete user john
myapp list users --format json
```

## Output Design

### Use Colors Meaningfully
```js
// ✅ Semantic color usage
const colors = {
  error: chalk.red,
  warning: chalk.yellow,
  success: chalk.green,
  info: chalk.blue,
  muted: chalk.gray,
  highlight: chalk.cyan.bold
}

// Always check for color support
if (process.stdout.isTTY && !process.env.NO_COLOR) {
  // Use colors
}
```

### Progress Indicators
```js
// Spinners for indeterminate progress
import ora from 'ora'

const spinner = ora('Installing dependencies').start()
await install()
spinner.succeed('Dependencies installed')

// Progress bars for determinate progress
import cliProgress from 'cli-progress'

const bar = new cliProgress.SingleBar({}, cliProgress.Presets.shades_classic)
bar.start(100, 0)
for (let i = 0; i <= 100; i++) {
  bar.update(i)
  await sleep(50)
}
bar.stop()
```

### Tables and Lists
```js
import { table } from 'table'
import boxen from 'boxen'

// Structured data as table
const data = [
  ['Name', 'Status', 'Version'],
  ['react', '✓ installed', '18.2.0'],
  ['vue', '✓ installed', '3.3.4'],
]
console.log(table(data))

// Important messages in boxes
console.log(boxen('Update available: 2.0.0', {
  padding: 1,
  borderStyle: 'round',
  borderColor: 'yellow'
}))
```

## Input Handling

### Interactive Prompts
```js
import inquirer from 'inquirer'
import prompts from 'prompts'

// Multiple choice
const { framework } = await prompts({
  type: 'select',
  name: 'framework',
  message: 'Select a framework',
  choices: [
    { title: 'React', value: 'react' },
    { title: 'Vue', value: 'vue' },
    { title: 'Svelte', value: 'svelte' }
  ]
})

// Text input with validation
const { email } = await prompts({
  type: 'text',
  name: 'email',
  message: 'Enter your email',
  validate: value => 
    value.includes('@') ? true : 'Please enter a valid email'
})

// Confirmation
const { proceed } = await prompts({
  type: 'confirm',
  name: 'proceed',
  message: 'This will delete all files. Continue?',
  initial: false
})
```

### Argument Parsing
```js
import { program } from 'commander'
import yargs from 'yargs'

// Commander.js
program
  .name('myapp')
  .version('1.0.0')
  .description('My awesome CLI tool')

program
  .command('init <name>')
  .description('Initialize a new project')
  .option('-t, --template <template>', 'Project template', 'default')
  .option('--no-git', 'Skip git initialization')
  .action((name, options) => {
    console.log(`Creating ${name} with template ${options.template}`)
  })

program.parse()
```

## Error Handling

### Helpful Error Messages
```js
class CLIError extends Error {
  constructor(message, { suggestion, docs, exitCode = 1 } = {}) {
    super(message)
    this.suggestion = suggestion
    this.docs = docs
    this.exitCode = exitCode
  }
}

function handleError(error) {
  console.error(chalk.red('Error:'), error.message)
  
  if (error.suggestion) {
    console.error(chalk.yellow('\nSuggestion:'), error.suggestion)
  }
  
  if (error.docs) {
    console.error(chalk.gray('\nDocs:'), error.docs)
  }
  
  process.exit(error.exitCode || 1)
}

// Usage
throw new CLIError('Config file not found', {
  suggestion: 'Run `myapp init` to create a config file',
  docs: 'https://myapp.dev/docs/config'
})
```

### Exit Codes
```js
// Standard exit codes
const EXIT_CODES = {
  SUCCESS: 0,
  GENERAL_ERROR: 1,
  MISUSE: 2,           // Invalid arguments
  PERMISSION: 77,      // Permission denied
  CONFIG: 78,          // Configuration error
  UNAVAILABLE: 69,     // Service unavailable
  INTERRUPT: 130       // Ctrl+C
}

// Handle signals
process.on('SIGINT', () => {
  console.log('\nInterrupted')
  process.exit(EXIT_CODES.INTERRUPT)
})
```

## File System Patterns

### Safe File Operations
```js
import { existsSync, mkdirSync, writeFileSync } from 'fs'
import { join, dirname } from 'path'

function writeFileSafe(filepath, content, { overwrite = false } = {}) {
  if (existsSync(filepath) && !overwrite) {
    throw new CLIError(`File already exists: ${filepath}`, {
      suggestion: 'Use --force to overwrite'
    })
  }
  
  // Ensure directory exists
  mkdirSync(dirname(filepath), { recursive: true })
  writeFileSync(filepath, content)
}
```

### Glob Patterns
```js
import { globSync } from 'glob'

// Find all JS files
const files = globSync('**/*.js', {
  ignore: ['node_modules/**', 'dist/**'],
  cwd: process.cwd()
})
```

## Configuration

### Config File Discovery
```js
import { cosmiconfigSync } from 'cosmiconfig'

const explorer = cosmiconfigSync('myapp')
const result = explorer.search()

// Searches for:
// - myapp.config.js
// - myapp.config.cjs
// - .myapprc
// - .myapprc.json
// - package.json "myapp" field

if (result) {
  console.log('Config found at:', result.filepath)
  console.log('Config:', result.config)
}
```

### Environment Variables
```js
import dotenv from 'dotenv'

// Load .env file
dotenv.config()

// With fallbacks
const config = {
  apiUrl: process.env.API_URL ?? 'https://api.example.com',
  debug: process.env.DEBUG === 'true',
  timeout: parseInt(process.env.TIMEOUT ?? '5000', 10)
}
```

## Output Formatting

### JSON Output Mode
```js
// Support --json flag for scriptable output
if (options.json) {
  console.log(JSON.stringify(result, null, 2))
} else {
  console.log(formatHumanReadable(result))
}
```

### Verbosity Levels
```js
const log = {
  debug: (...args) => options.verbose >= 2 && console.log(chalk.gray('[DEBUG]'), ...args),
  info: (...args) => options.verbose >= 1 && console.log(chalk.blue('[INFO]'), ...args),
  warn: (...args) => console.warn(chalk.yellow('[WARN]'), ...args),
  error: (...args) => console.error(chalk.red('[ERROR]'), ...args),
}
```

## Testing CLIs

```js
import { execa } from 'execa'
import { describe, it, expect } from 'vitest'

describe('myapp CLI', () => {
  it('shows help with --help', async () => {
    const { stdout } = await execa('./bin/myapp.js', ['--help'])
    expect(stdout).toContain('Usage:')
    expect(stdout).toContain('Commands:')
  })
  
  it('returns error for unknown command', async () => {
    const { exitCode, stderr } = await execa('./bin/myapp.js', ['unknown'], {
      reject: false
    })
    expect(exitCode).toBe(1)
    expect(stderr).toContain('Unknown command')
  })
  
  it('creates project with init', async () => {
    const { stdout } = await execa('./bin/myapp.js', ['init', 'test-project'])
    expect(stdout).toContain('Created test-project')
  })
})
```

## Package Setup

```json
{
  "name": "myapp",
  "version": "1.0.0",
  "type": "module",
  "bin": {
    "myapp": "./bin/myapp.js"
  },
  "files": ["bin", "lib"],
  "engines": {
    "node": ">=18"
  }
}
```

```js
#!/usr/bin/env node
// bin/myapp.js
import { run } from '../lib/cli.js'
run()
```

## Anti-Patterns to Avoid

### ❌ Wall of Text
```js
// Bad: Dumping all info at once
console.log('Created project. Installed deps. Set up git. Created config. Ready!')

// Good: Structured, scannable output
console.log(chalk.green('✓'), 'Created project')
console.log(chalk.green('✓'), 'Installed dependencies')
console.log(chalk.green('✓'), 'Initialized git repository')
console.log()
console.log('Next steps:')
console.log('  cd my-project')
console.log('  npm run dev')
```

### ❌ Ignoring TTY
```js
// Bad: Always using colors/spinners
ora('Loading').start()

// Good: Check if TTY
if (process.stdout.isTTY) {
  ora('Loading').start()
} else {
  console.log('Loading...')
}
```

### ❌ Silent Failures
```js
// Bad: Swallowing errors
try { await doSomething() } catch {}

// Good: Always report errors
try {
  await doSomething()
} catch (error) {
  console.error(chalk.red('Failed:'), error.message)
  process.exit(1)
}
```