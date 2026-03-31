import fs from "fs";
import path from "path";

/**
 * Parse frontmatter from markdown content
 * Returns { frontmatter: object, body: string }
 */
export function parseFrontmatter(content) {
	const frontmatterRegex = /^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/;
	const match = content.match(frontmatterRegex);

	if (!match) {
		return { frontmatter: {}, body: content };
	}

	const [, frontmatterText, body] = match;
	const frontmatter = {};

	// Simple YAML parser (handles basic key-value and arrays)
	const lines = frontmatterText.split("\n");
	let currentKey = null;
	let currentArray = null;

	function parseScalarValue(value) {
		return value === "true" ? true : value === "false" ? false : value;
	}

	for (const line of lines) {
		if (!line.trim()) continue;

		// Calculate indent level
		const leadingSpaces = line.length - line.trimStart().length;
		const trimmed = line.trim();

		// Array item at level 2 (nested under a key)
		if (trimmed.startsWith("- ") && leadingSpaces >= 2) {
			if (currentArray) {
				if (trimmed.startsWith("- name:")) {
					// New object in array
					const obj = {};
					obj.name = trimmed.slice(7).trim();
					currentArray.push(obj);
				} else {
					currentArray.push(parseScalarValue(trimmed.slice(2).trim()));
				}
			}
			continue;
		}

		// Property of array object (indented further)
		if (leadingSpaces >= 4 && currentArray && currentArray.length > 0) {
			const colonIndex = trimmed.indexOf(":");
			if (colonIndex > 0) {
				const key = trimmed.slice(0, colonIndex).trim();
				const value = trimmed.slice(colonIndex + 1).trim();
				const lastObj = currentArray[currentArray.length - 1];
				lastObj[key] = parseScalarValue(value);
			}
			continue;
		}

		// Top-level key-value pair
		if (leadingSpaces === 0) {
			const colonIndex = trimmed.indexOf(":");
			if (colonIndex > 0) {
				const key = trimmed.slice(0, colonIndex).trim();
				const value = trimmed.slice(colonIndex + 1).trim();

				if (value) {
					frontmatter[key] = parseScalarValue(value);
					currentKey = key;
					currentArray = null;
				} else {
					// Start of array
					currentKey = key;
					currentArray = [];
					frontmatter[key] = currentArray;
				}
			}
		}
	}

	return { frontmatter, body: body.trim() };
}

function normalizeStringArray(value) {
	if (!Array.isArray(value)) {
		return null;
	}

	const normalized = value
		.map((item) => (typeof item === "string" ? item.trim() : ""))
		.filter(Boolean);

	return normalized.length > 0 ? normalized : null;
}

/**
 * Recursively read all .md files from a directory
 */
export function readFilesRecursive(dir, fileList = []) {
	if (!fs.existsSync(dir)) {
		return fileList;
	}

	const files = fs.readdirSync(dir);

	for (const file of files) {
		const filePath = path.join(dir, file);
		const stat = fs.statSync(filePath);

		if (stat.isDirectory()) {
			readFilesRecursive(filePath, fileList);
		} else if (file.endsWith(".md")) {
			fileList.push(filePath);
		}
	}

	return fileList;
}

function getMarkdownFilesRecursive(dir, baseDir = dir, fileList = []) {
	if (!fs.existsSync(dir)) {
		return fileList;
	}

	const entries = fs.readdirSync(dir, { withFileTypes: true });

	for (const entry of entries) {
		const entryPath = path.join(dir, entry.name);

		if (entry.isDirectory()) {
			getMarkdownFilesRecursive(entryPath, baseDir, fileList);
		} else if (entry.name.endsWith(".md")) {
			fileList.push({
				filePath: entryPath,
				relativePath: path.relative(baseDir, entryPath),
			});
		}
	}

	return fileList;
}

function isReferencePath(filePath) {
	return filePath.split(path.sep).includes("reference");
}

function readSkillReferences(skillDir) {
	const referenceDir = path.join(skillDir, "reference");
	const references = [];

	if (!fs.existsSync(referenceDir)) {
		return references;
	}

	const refFiles = getMarkdownFilesRecursive(referenceDir, referenceDir);
	refFiles.sort((a, b) => a.relativePath.localeCompare(b.relativePath));

	for (const refFile of refFiles) {
		const refContent = fs.readFileSync(refFile.filePath, "utf-8");
		references.push({
			name: path.basename(refFile.filePath, ".md"),
			content: refContent,
			filePath: refFile.filePath,
			relativePath: refFile.relativePath,
		});
	}

	return references;
}

function findSkillFileByName(skillsDir, skillName) {
	const skillFiles = readFilesRecursive(skillsDir)
		.filter(
			(filePath) =>
				path.basename(filePath) === "SKILL.md" && !isReferencePath(filePath),
		)
		.sort((a, b) => a.localeCompare(b));

	for (const skillMdPath of skillFiles) {
		const content = fs.readFileSync(skillMdPath, "utf-8");
		const { frontmatter } = parseFrontmatter(content);
		if (frontmatter.name === skillName) {
			return skillMdPath;
		}
	}

	return null;
}

/**
 * Read and parse all source files (unified skills architecture)
 * All source lives in source/skills/{name}/SKILL.md
 * Returns { skills } where each skill has userInvokable flag
 */
export function readSourceFiles(rootDir) {
	const skillsDir = path.join(rootDir, "source/skills");

	const skills = [];

	if (fs.existsSync(skillsDir)) {
		const skillFiles = readFilesRecursive(skillsDir)
			.filter(
				(filePath) =>
					path.basename(filePath) === "SKILL.md" && !isReferencePath(filePath),
			)
			.sort((a, b) => a.localeCompare(b));
		const seenNames = new Map();

		for (const skillMdPath of skillFiles) {
			const skillDir = path.dirname(skillMdPath);
			const content = fs.readFileSync(skillMdPath, "utf-8");
			const { frontmatter, body } = parseFrontmatter(content);
			const references = readSkillReferences(skillDir);
			const relativeSkillDir = path.relative(skillsDir, skillDir);
			const skillDirName = path.basename(skillDir);
			const skillName = frontmatter.name || skillDirName;

			if (seenNames.has(skillName)) {
				throw new Error(
					`Duplicate skill name '${skillName}' found in '${relativeSkillDir}' and '${seenNames.get(skillName)}'`,
				);
			}

			seenNames.set(skillName, relativeSkillDir);

			skills.push({
				name: skillName,
				description: frontmatter.description || "",
				domains: normalizeStringArray(frontmatter.domains),
				license: frontmatter.license || "",
				compatibility: frontmatter.compatibility || "",
				metadata: frontmatter.metadata || null,
				allowedTools: frontmatter["allowed-tools"] || "",
				userInvokable:
					frontmatter["user-invokable"] === true ||
					frontmatter["user-invokable"] === "true",
				args: frontmatter.args || [],
				context: frontmatter.context || null,
				body,
				filePath: skillMdPath,
				sourcePath: relativeSkillDir,
				references,
			});
		}
	}

	return { skills };
}

export function getSkillDomains(skill) {
	if (Array.isArray(skill.domains) && skill.domains.length > 0) {
		return skill.domains;
	}

	const sourcePath = (skill.sourcePath || "").replace(/\\/g, "/");

	if (skill.name === "frontend-design") {
		return ["frontend", "ui", "ux"];
	}

	if (skill.name === "backend-design" || sourcePath.startsWith("backend/")) {
		return ["backend", "api", "services"];
	}

	if (skill.name === "security-review" || sourcePath.startsWith("security/")) {
		return ["security", "auth", "risk"];
	}

	if (skill.name === "devops-delivery" || sourcePath.startsWith("devops/")) {
		return ["devops", "delivery", "operations"];
	}

	if (skill.name === "qa-strategy" || sourcePath.startsWith("qa/")) {
		return ["qa", "testing", "reliability"];
	}

	if (skill.name === "data-engineering" || sourcePath.startsWith("data/")) {
		return ["data", "pipelines", "governance"];
	}

	return [];
}

export function getSkillArchitectureRole(skill) {
	return skill.userInvokable ? "command" : "core-skill";
}

export function shapeSkillForApi(skill) {
	return {
		id: skill.name,
		name: skill.name,
		description: skill.description || "No description available",
		userInvokable: skill.userInvokable,
		architectureRole: getSkillArchitectureRole(skill),
		domains: getSkillDomains(skill),
		referenceCount: Array.isArray(skill.references)
			? skill.references.length
			: 0,
		sourcePath: skill.sourcePath,
	};
}

/**
 * Ensure directory exists, create if needed
 */
export function ensureDir(dirPath) {
	if (!fs.existsSync(dirPath)) {
		fs.mkdirSync(dirPath, { recursive: true });
	}
}

/**
 * Clean directory (remove all contents)
 */
export function cleanDir(dirPath) {
	if (fs.existsSync(dirPath)) {
		fs.rmSync(dirPath, { recursive: true, force: true });
	}
}

/**
 * Write file with automatic directory creation
 */
export function writeFile(filePath, content) {
	const dir = path.dirname(filePath);
	ensureDir(dir);
	fs.writeFileSync(filePath, content, "utf-8");
}

/**
 * Extract patterns from frontend-design SKILL.md
 * Parses **DO**: and **DON'T**: lines, grouped by section headings
 * Returns { patterns: [...], antipatterns: [...] }
 */
export function readPatterns(rootDir) {
	const skillPath = findSkillFileByName(
		path.join(rootDir, "source/skills"),
		"frontend-design",
	);

	if (!fs.existsSync(skillPath)) {
		return { patterns: [], antipatterns: [] };
	}

	const content = fs.readFileSync(skillPath, "utf-8");
	const lines = content.split("\n");

	const patternsMap = {}; // category -> items[]
	const antipatternsMap = {}; // category -> items[]
	let currentSection = null;

	for (const line of lines) {
		const trimmed = line.trim();

		// Track section headings (### Typography, ### Color & Theme, etc.)
		if (trimmed.startsWith("### ")) {
			currentSection = trimmed.slice(4).trim();
			// Normalize "Color & Theme" to "Color & Contrast" for consistency
			if (currentSection === "Color & Theme") {
				currentSection = "Color & Contrast";
			}
			continue;
		}

		// Parse **DO**: lines
		if (trimmed.startsWith("**DO**:") && currentSection) {
			const item = trimmed.slice(7).trim();
			if (!patternsMap[currentSection]) {
				patternsMap[currentSection] = [];
			}
			patternsMap[currentSection].push(item);
			continue;
		}

		// Parse **DON'T**: lines
		if (trimmed.startsWith("**DON'T**:") && currentSection) {
			const item = trimmed.slice(10).trim();
			if (!antipatternsMap[currentSection]) {
				antipatternsMap[currentSection] = [];
			}
			antipatternsMap[currentSection].push(item);
		}
	}

	// Convert maps to arrays in consistent order
	const sectionOrder = [
		"Typography",
		"Color & Contrast",
		"Layout & Space",
		"Visual Details",
		"Motion",
		"Interaction",
		"Responsive",
		"UX Writing",
	];

	const patterns = [];
	const antipatterns = [];

	for (const section of sectionOrder) {
		if (patternsMap[section] && patternsMap[section].length > 0) {
			patterns.push({ name: section, items: patternsMap[section] });
		}
		if (antipatternsMap[section] && antipatternsMap[section].length > 0) {
			antipatterns.push({ name: section, items: antipatternsMap[section] });
		}
	}

	return { patterns, antipatterns };
}

/**
 * Provider-specific placeholders
 */
export const PROVIDER_PLACEHOLDERS = {
	"claude-code": {
		model: "Claude",
		config_file: "CLAUDE.md",
		ask_instruction: "STOP and call the AskUserQuestion tool to clarify.",
	},
	cursor: {
		model: "the model",
		config_file: ".cursorrules",
		ask_instruction: "ask the user directly to clarify what you cannot infer.",
	},
	gemini: {
		model: "Gemini",
		config_file: "GEMINI.md",
		ask_instruction: "ask the user directly to clarify what you cannot infer.",
	},
	codex: {
		model: "GPT",
		config_file: "AGENTS.md",
		ask_instruction: "ask the user directly to clarify what you cannot infer.",
	},
	agents: {
		model: "the model",
		config_file: ".github/copilot-instructions.md",
		ask_instruction: "ask the user directly to clarify what you cannot infer.",
	},
	kiro: {
		model: "Claude",
		config_file: ".kiro/settings.json",
		ask_instruction: "ask the user directly to clarify what you cannot infer.",
	},
	opencode: {
		model: "Claude",
		config_file: "AGENTS.md",
		ask_instruction: "STOP and call the `question` tool to clarify.",
	},
	pi: {
		model: "the model",
		config_file: "AGENTS.md",
		ask_instruction: "ask the user directly to clarify what you cannot infer.",
	},
};

/**
 * Replace all {{placeholder}} tokens with provider-specific values
 */
/**
 * Prefix skill cross-references in body text.
 * Replaces patterns like `/skillname` and `the skillname skill` with prefixed versions.
 *
 * @param {string} content - The skill body text
 * @param {string} prefix - The prefix to add (e.g., 'i-')
 * @param {string[]} skillNames - Array of all skill names
 */
export function prefixSkillReferences(content, prefix, skillNames) {
	if (!prefix || !skillNames || skillNames.length === 0) return content;

	let result = content;
	// Sort by length descending to avoid partial matches (e.g. 'teach-impeccable' before 'teach')
	const sorted = [...skillNames].sort((a, b) => b.length - a.length);

	for (const name of sorted) {
		const prefixed = `${prefix}${name}`;

		// Replace `/skillname` references (command invocations)
		result = result.replace(
			new RegExp(`\\/(?=${escapeRegex(name)}(?:[^a-zA-Z0-9_-]|$))`, "g"),
			`/${prefix}`,
		);

		// Replace `the skillname skill` references
		result = result.replace(
			new RegExp(`the ${escapeRegex(name)} skill`, "gi"),
			`the ${prefixed} skill`,
		);
	}

	return result;
}

function escapeRegex(str) {
	return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

const EXCLUDED_FROM_SUGGESTIONS = new Set([
	"teach-impeccable",
	"i-teach-impeccable",
]);

export function replacePlaceholders(content, provider, commandNames = []) {
	const placeholders =
		PROVIDER_PLACEHOLDERS[provider] || PROVIDER_PLACEHOLDERS["cursor"];
	const commandList = commandNames
		.filter((n) => !EXCLUDED_FROM_SUGGESTIONS.has(n))
		.map((n) => `/${n}`)
		.join(", ");

	return content
		.replace(/\{\{model\}\}/g, placeholders.model)
		.replace(/\{\{config_file\}\}/g, placeholders.config_file)
		.replace(/\{\{ask_instruction\}\}/g, placeholders.ask_instruction)
		.replace(/\{\{available_commands\}\}/g, commandList);
}

/**
 * Generate YAML frontmatter string
 */
export function generateYamlFrontmatter(data) {
	const lines = ["---"];

	for (const [key, value] of Object.entries(data)) {
		if (Array.isArray(value)) {
			lines.push(`${key}:`);
			for (const item of value) {
				if (typeof item === "object") {
					lines.push(`  - name: ${item.name}`);
					if (item.description)
						lines.push(`    description: ${item.description}`);
					if (item.required !== undefined)
						lines.push(`    required: ${item.required}`);
				} else {
					lines.push(`  - ${item}`);
				}
			}
		} else if (typeof value === "boolean") {
			lines.push(`${key}: ${value}`);
		} else {
			lines.push(`${key}: ${value}`);
		}
	}

	lines.push("---");
	return lines.join("\n");
}
