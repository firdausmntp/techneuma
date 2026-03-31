import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import fs from "fs";
import path from "path";
import { transformClaudeCode } from "../../scripts/lib/transformers/claude-code.js";
import { readSourceFiles } from "../../scripts/lib/utils.js";

const TEST_DIR = path.join(process.cwd(), "test-tmp-nested-skills");

function writeTestFile(relativePath, content) {
	const filePath = path.join(TEST_DIR, relativePath);
	fs.mkdirSync(path.dirname(filePath), { recursive: true });
	fs.writeFileSync(filePath, content);
}

describe("nested skill regressions", () => {
	beforeEach(() => {
		if (fs.existsSync(TEST_DIR)) {
			fs.rmSync(TEST_DIR, { recursive: true, force: true });
		}
	});

	afterEach(() => {
		if (fs.existsSync(TEST_DIR)) {
			fs.rmSync(TEST_DIR, { recursive: true, force: true });
		}
	});

	test("readSourceFiles loads nested skills, ignores reference SKILL files during discovery, and sorts nested references deterministically", () => {
		writeTestFile(
			"source/skills/backend/backend-design/SKILL.md",
			`---
name: backend-design
description: Backend design skill
---

Use structured contracts.`,
		);
		writeTestFile(
			"source/skills/backend/backend-design/reference/api-contracts.md",
			"Contracts reference.",
		);
		writeTestFile(
			"source/skills/backend/backend-design/reference/operations/observability.md",
			"Observability reference.",
		);
		writeTestFile(
			"source/skills/backend/backend-design/reference/operations/SKILL.md",
			`---
name: accidental-reference-skill
---

Should never be discovered as a skill.`,
		);

		const { skills } = readSourceFiles(TEST_DIR);

		expect(skills).toHaveLength(1);
		expect(skills[0].name).toBe("backend-design");
		expect(skills[0].sourcePath).toBe(path.join("backend", "backend-design"));
		const referencePaths = skills[0].references.map(
			(reference) => reference.relativePath,
		);

		expect(referencePaths).toEqual(
			[...referencePaths].sort((a, b) => a.localeCompare(b)),
		);
		expect(referencePaths).toContain("api-contracts.md");
		expect(referencePaths).toContain(path.join("operations", "SKILL.md"));
		expect(referencePaths).toContain(
			path.join("operations", "observability.md"),
		);
	});

	test("readSourceFiles rejects duplicate skill names across nested directories", () => {
		writeTestFile(
			"source/skills/backend/backend-audit/SKILL.md",
			`---
name: shared-audit
description: Backend audit
---

Backend audit instructions.`,
		);
		writeTestFile(
			"source/skills/security/security-audit/SKILL.md",
			`---
name: shared-audit
description: Security audit
---

Security audit instructions.`,
		);

		expect(() => readSourceFiles(TEST_DIR)).toThrow(
			"Duplicate skill name 'shared-audit' found in 'security\\security-audit' and 'backend\\backend-audit'",
		);
	});

	test("transformClaudeCode preserves nested reference paths for nested skills", () => {
		writeTestFile(
			"source/skills/security/security-review/SKILL.md",
			`---
name: security-review
description: Security review skill
---

Review systems carefully.`,
		);
		writeTestFile(
			"source/skills/security/security-review/reference/threat-modeling.md",
			"Threat modeling reference.",
		);
		writeTestFile(
			"source/skills/security/security-review/reference/operations/secrets-and-supply-chain.md",
			"Use {{config_file}} for provider setup.",
		);

		const { skills } = readSourceFiles(TEST_DIR);
		transformClaudeCode(skills, TEST_DIR);

		const nestedReferencePath = path.join(
			TEST_DIR,
			"claude-code/.claude/skills/security-review/reference/operations/secrets-and-supply-chain.md",
		);

		expect(fs.existsSync(nestedReferencePath)).toBe(true);
		expect(
			fs.readFileSync(
				path.join(
					TEST_DIR,
					"claude-code/.claude/skills/security-review/reference/threat-modeling.md",
				),
				"utf-8",
			),
		).toBe("Threat modeling reference.");
		expect(fs.readFileSync(nestedReferencePath, "utf-8")).toBe(
			"Use CLAUDE.md for provider setup.",
		);
	});
});
