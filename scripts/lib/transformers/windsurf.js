import path from "path";
import {
	cleanDir,
	ensureDir,
	generateYamlFrontmatter,
	prefixSkillReferences,
	replacePlaceholders,
	writeFile,
} from "../utils.js";

/**
 * Windsurf Transformer (Skills Only)
 *
 * All skills output to .windsurf/skills/{name}/SKILL.md
 */
export function transformWindsurf(skills, distDir, patterns = null, options = {}) {
	const { prefix = "", outputSuffix = "" } = options;
	const provDir = path.join(distDir, `windsurf${outputSuffix}`);
	const skillsDir = path.join(provDir, ".windsurf/skills");

	cleanDir(provDir);
	ensureDir(skillsDir);

	const allSkillNames = skills.map((s) => s.name);
	const commandNames = skills.filter((s) => s.userInvokable).map((s) => `${prefix}${s.name}`);
	let refCount = 0;
	for (const skill of skills) {
		const skillName = `${prefix}${skill.name}`;
		const skillDir = path.join(skillsDir, skillName);
		const frontmatterObj = { name: skillName, description: skill.description };
		if (skill.license) frontmatterObj.license = skill.license;
		const frontmatter = generateYamlFrontmatter(frontmatterObj);
		let skillBody = replacePlaceholders(skill.body, "windsurf", commandNames);
		if (prefix) skillBody = prefixSkillReferences(skillBody, prefix, allSkillNames);
		writeFile(path.join(skillDir, "SKILL.md"), `${frontmatter}\n\n${skillBody}`);
		if (skill.references && skill.references.length > 0) {
			const refDir = path.join(skillDir, "reference");
			ensureDir(refDir);
			for (const ref of skill.references) {
				const refOutputPath = ref.relativePath ? path.join(refDir, ref.relativePath) : path.join(refDir, `${ref.name}.md`);
				writeFile(refOutputPath, replacePlaceholders(ref.content, "windsurf"));
				refCount++;
			}
		}
	}
	const userInvokableCount = skills.filter((s) => s.userInvokable).length;
	const refInfo = refCount > 0 ? ` (${refCount} reference files)` : "";
	const prefixInfo = prefix ? ` [${prefix}prefixed]` : "";
	console.log(`✓ Windsurf${prefixInfo}: ${skills.length} skills (${userInvokableCount} user-invokable)${refInfo}`);
}
