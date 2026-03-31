# CLI Anti-Patterns - What NOT to Do

## Command Structure

### ❌ Bad: Inconsistent Flag Names
```bash
# Don't mix naming conventions
myapp --output-file file.txt    # kebab-case
myapp --outputFile other.txt    # camelCase - inconsistent!
myapp -O another.txt            # Capital for short flag - confusing!

# ✅ Better: Pick one convention
myapp --output-file file.txt
myapp -o file.txt
```

### ❌ Bad: Positional Arguments for Everything
```bash
# Hard to remember order
myapp production us-east-1 3 true 500

# ✅ Better: Named flags
myapp --env production --region us-east-1 --replicas 3 --verbose --timeout 500
```

## Output

### ❌ Bad: Unreadable Output
```javascript
// Dumping raw data
console.log(JSON.stringify(data))  // No formatting!
console.log(result)                 // [object Object]

// ✅ Better:
console.log(JSON.stringify(data, null, 2))
console.log(util.inspect(result, { colors: true, depth: null }))
```

### ❌ Bad: No Quiet Mode
```javascript
// Always prints everything
function deploy() {
  console.log('Starting deployment...')
  console.log('Checking dependencies...')
  console.log('Building assets...')
  console.log('Uploading files...')
  console.log('Done!')
}

// ✅ Better: Respect --quiet flag
function deploy(options) {
  const log = options.quiet ? () => {} : console.log
  
  log('Starting deployment...')
  // ...
}
```

### ❌ Bad: Colors Without Fallback
```javascript
// Breaks pipes and non-TTY
console.log('\x1b[32mSuccess!\x1b[0m')

// ✅ Better: Check for TTY
import chalk from 'chalk'
const output = chalk.level > 0 ? chalk.green('Success!') : 'Success!'
```

## Error Handling

### ❌ Bad: Cryptic Errors
```javascript
// Unhelpful
throw new Error('ENOENT')
console.error('Error occurred')
process.exit(1)

// ✅ Better: Helpful context
throw new Error(`File not found: ${filePath}\nDid you mean ${suggestPath}?`)
```

### ❌ Bad: Swallowing Errors
```javascript
// Silent failure
try {
  await deploy()
} catch (e) {
  // Nothing!
}

// ✅ Better: Handle and report
try {
  await deploy()
} catch (error) {
  console.error(`Deployment failed: ${error.message}`)
  process.exit(1)
}
```

### ❌ Bad: Stack Traces in Production
```javascript
// Shows internal details
throw new Error('Something failed')
// Stack trace dumped to user

// ✅ Better: User-friendly message
if (process.env.DEBUG) {
  console.error(error.stack)
} else {
  console.error(`Error: ${error.message}`)
  console.error('Run with DEBUG=1 for details')
}
```

## Interactive Mode

### ❌ Bad: No Non-Interactive Option
```javascript
// Always prompts - breaks CI/CD!
const name = await prompt('Enter project name: ')

// ✅ Better: Support non-interactive
const name = options.name || (isTTY ? await prompt('Enter project name: ') : 'default')
```

### ❌ Bad: Prompt Inside Loop
```javascript
// Annoying for users
for (const file of files) {
  const confirm = await prompt(`Process ${file}? (y/n)`)
  // 100 prompts for 100 files!
}

// ✅ Better: Batch confirmation
const confirm = await prompt(`Process ${files.length} files? (y/n/a for all)`)
```

## Configuration

### ❌ Bad: Hardcoded Paths
```javascript
// Won't work cross-platform
const configPath = '/home/user/.myapp/config.json'

// ✅ Better: Use standard locations
import os from 'os'
import path from 'path'

const configDir = process.env.XDG_CONFIG_HOME || path.join(os.homedir(), '.config')
const configPath = path.join(configDir, 'myapp', 'config.json')
```

### ❌ Bad: No Config Validation
```javascript
// Trust user input blindly
const config = JSON.parse(fs.readFileSync('config.json'))
deploy(config.server, config.port)  // Could be anything!

// ✅ Better: Validate with schema
import { z } from 'zod'

const ConfigSchema = z.object({
  server: z.string().url(),
  port: z.number().int().min(1).max(65535)
})

const config = ConfigSchema.parse(JSON.parse(fs.readFileSync('config.json')))
```

## Exit Codes

### ❌ Bad: Always Exit 0
```javascript
// Success even on failure!
try {
  await deploy()
} catch (e) {
  console.error(e)
}
// Exit 0 even though it failed

// ✅ Better: Exit non-zero on failure
try {
  await deploy()
  process.exit(0)
} catch (e) {
  console.error(e)
  process.exit(1)
}
```

## Performance

### ❌ Bad: Loading Everything Upfront
```javascript
// Slow startup
import { heavyModule1 } from 'heavy-module-1'
import { heavyModule2 } from 'heavy-module-2'
import { heavyModule3 } from 'heavy-module-3'

// ✅ Better: Lazy load
const program = new Command()

program.command('analyze').action(async () => {
  const { analyze } = await import('./commands/analyze.js')
  await analyze()
})
```

### ❌ Bad: Synchronous Operations
```javascript
// Blocks everything
const files = fs.readdirSync(dir)
files.forEach(file => {
  const content = fs.readFileSync(file)
  processSync(content)
})

// ✅ Better: Async with concurrency
import pLimit from 'p-limit'
const limit = pLimit(5)

const files = await fs.promises.readdir(dir)
await Promise.all(files.map(file => limit(async () => {
  const content = await fs.promises.readFile(file)
  await process(content)
})))
```

## Documentation

### ❌ Bad: No Help Text
```javascript
// User has to guess
program.command('deploy')
  .action(deploy)

// ✅ Better: Comprehensive help
program.command('deploy')
  .description('Deploy the application to the specified environment')
  .argument('<environment>', 'Target environment (dev, staging, prod)')
  .option('-r, --region <region>', 'AWS region', 'us-east-1')
  .option('-n, --dry-run', 'Show what would be deployed without deploying')
  .example('deploy prod --region eu-west-1')
  .action(deploy)
```
