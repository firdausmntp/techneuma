# CLI Examples - Good Patterns

## Command Structure

### ✅ Good: Progressive Disclosure
```bash
# Simple usage for common cases
myapp deploy

# Detailed options when needed
myapp deploy --env production --region us-east-1 --dry-run

# Help always available
myapp deploy --help
```

### ✅ Good: Consistent Flag Naming
```bash
# Short and long versions
myapp -v, --verbose
myapp -o, --output <file>
myapp -f, --force
myapp -q, --quiet

# Boolean flags don't need values
myapp --dry-run
myapp --no-cache
```

## Output Formatting

### ✅ Good: Colorized Output with Fallback
```javascript
import chalk from 'chalk'

const supportsColor = process.stdout.isTTY && !process.env.NO_COLOR

function log(message, type = 'info') {
  const prefix = {
    info: supportsColor ? chalk.blue('ℹ') : '[INFO]',
    success: supportsColor ? chalk.green('✓') : '[OK]',
    warning: supportsColor ? chalk.yellow('⚠') : '[WARN]',
    error: supportsColor ? chalk.red('✗') : '[ERROR]'
  }
  
  console.log(`${prefix[type]} ${message}`)
}

log('Installing dependencies...', 'info')
log('Build completed', 'success')
log('Deprecated option used', 'warning')
log('Failed to connect', 'error')
```

### ✅ Good: Progress Indicators
```javascript
import ora from 'ora'

async function deploy() {
  const spinner = ora('Deploying...').start()
  
  try {
    spinner.text = 'Building assets...'
    await build()
    
    spinner.text = 'Uploading files...'
    await upload()
    
    spinner.succeed('Deployed successfully!')
  } catch (error) {
    spinner.fail(`Deployment failed: ${error.message}`)
    process.exit(1)
  }
}
```

### ✅ Good: Structured Output Options
```javascript
import { Command } from 'commander'

const program = new Command()

program
  .option('--json', 'Output as JSON')
  .option('--table', 'Output as table')
  .action(async (options) => {
    const data = await fetchData()
    
    if (options.json) {
      console.log(JSON.stringify(data, null, 2))
    } else if (options.table) {
      console.table(data)
    } else {
      data.forEach(item => console.log(`${item.name}: ${item.value}`))
    }
  })
```

## Error Handling

### ✅ Good: Helpful Error Messages
```javascript
class CLIError extends Error {
  constructor(message, { suggestion, code, context } = {}) {
    super(message)
    this.suggestion = suggestion
    this.code = code
    this.context = context
  }
}

function handleError(error) {
  console.error(chalk.red(`Error: ${error.message}`))
  
  if (error.context) {
    console.error(chalk.gray(`  Context: ${error.context}`))
  }
  
  if (error.suggestion) {
    console.error(chalk.yellow(`  Suggestion: ${error.suggestion}`))
  }
  
  process.exit(error.code || 1)
}

// Usage
throw new CLIError('Config file not found', {
  suggestion: 'Run `myapp init` to create one',
  context: 'Looking for: ./myapp.config.js',
  code: 2
})

// Output:
// Error: Config file not found
//   Context: Looking for: ./myapp.config.js
//   Suggestion: Run `myapp init` to create one
```

## Interactive Prompts

### ✅ Good: Smart Defaults
```javascript
import inquirer from 'inquirer'

const answers = await inquirer.prompt([
  {
    type: 'input',
    name: 'name',
    message: 'Project name:',
    default: path.basename(process.cwd())  // Smart default
  },
  {
    type: 'list',
    name: 'template',
    message: 'Template:',
    choices: ['react', 'vue', 'svelte'],
    default: 'react'
  },
  {
    type: 'confirm',
    name: 'typescript',
    message: 'Use TypeScript?',
    default: true
  }
])
```

### ✅ Good: Non-Interactive Mode
```javascript
program
  .option('--name <name>', 'Project name')
  .option('--template <template>', 'Template to use')
  .option('--yes', 'Skip prompts, use defaults')
  .action(async (options) => {
    let config
    
    if (options.yes) {
      // Non-interactive: use provided options or defaults
      config = {
        name: options.name || 'my-project',
        template: options.template || 'react',
        typescript: true
      }
    } else {
      // Interactive: prompt for missing values
      config = await promptForConfig(options)
    }
    
    await createProject(config)
  })
```

## Configuration Files

### ✅ Good: Multiple Config Formats
```javascript
import { cosmiconfig } from 'cosmiconfig'

const explorer = cosmiconfig('myapp', {
  searchPlaces: [
    'package.json',
    '.myapprc',
    '.myapprc.json',
    '.myapprc.yaml',
    '.myapprc.yml',
    '.myapprc.js',
    '.myapprc.cjs',
    'myapp.config.js',
    'myapp.config.cjs'
  ]
})

const result = await explorer.search()
const config = result?.config || {}
```

## Exit Codes

### ✅ Good: Meaningful Exit Codes
```javascript
const EXIT_CODES = {
  SUCCESS: 0,
  GENERAL_ERROR: 1,
  MISUSE: 2,          // Invalid arguments
  CONFIG_ERROR: 78,   // Configuration error
  NOT_FOUND: 127      // Command not found
}

process.on('unhandledRejection', (error) => {
  console.error('Unexpected error:', error)
  process.exit(EXIT_CODES.GENERAL_ERROR)
})

// In commands:
if (!fs.existsSync(configPath)) {
  console.error('Config not found')
  process.exit(EXIT_CODES.CONFIG_ERROR)
}
```

## Piping & Streams

### ✅ Good: Support stdin/stdout
```javascript
import { pipeline } from 'stream/promises'

async function processInput(inputFile, outputFile) {
  const input = inputFile === '-' 
    ? process.stdin 
    : fs.createReadStream(inputFile)
  
  const output = outputFile === '-'
    ? process.stdout
    : fs.createWriteStream(outputFile)
  
  await pipeline(input, transformStream, output)
}

// Usage:
// cat data.json | myapp transform - | jq .
// myapp transform input.json output.json
```

## DON'T (Not Good)

### Bad Request Example

```text
Run /cli and make it better.
```

Why this is not good:
- Too vague, no clear scope or success criteria.
- Missing constraints, so the result may break expectations.
- No validation steps, so quality cannot be trusted.

### Better Alternative

```text
Run /cli on a specific area, list constraints, and include tests or verification checks.
```
