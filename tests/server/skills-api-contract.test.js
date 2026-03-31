import { describe, expect, test } from "bun:test";
import { shapeSkillForApi } from "../../scripts/lib/utils.js";
import { getCommands, getSkills } from "../../server/lib/api-handlers.js";

describe("shapeSkillForApi", () => {
	test("returns homepage-facing contract fields for a nested core skill", () => {
		const apiSkill = shapeSkillForApi({
			name: "backend-design",
			description:
				"Design and refine backend services, APIs, jobs, and integration boundaries with production-grade contracts, failure handling, and operability.",
			userInvokable: false,
			sourcePath: "backend/backend-design",
			references: [
				{ name: "api-contracts" },
				{ name: "data-and-state" },
				{ name: "observability" },
			],
		});

		expect(apiSkill).toEqual({
			id: "backend-design",
			name: "backend-design",
			description:
				"Design and refine backend services, APIs, jobs, and integration boundaries with production-grade contracts, failure handling, and operability.",
			userInvokable: false,
			architectureRole: "core-skill",
			domains: ["backend", "api", "services"],
			referenceCount: 3,
			sourcePath: "backend/backend-design",
		});
	});
});

describe("skills API contract", () => {
	test("getSkills exposes core skills with ids, domains, architecture metadata, and source paths", async () => {
		const skills = await getSkills();
		const frontendDesign = skills.find(
			(skill) => skill.id === "frontend-design",
		);

		expect(frontendDesign).toBeDefined();
		expect(frontendDesign).toMatchObject({
			id: "frontend-design",
			name: "frontend-design",
			architectureRole: "core-skill",
			domains: ["frontend", "ui", "ux"],
			referenceCount: 8,
			sourcePath: "frontend-design",
			userInvokable: false,
		});
		expect(frontendDesign.description).toBeString();
		expect(frontendDesign.description.length).toBeGreaterThan(0);
		expect(frontendDesign.domains).toBeArray();
		expect(frontendDesign.sourcePath).toBeString();
	});

	test("getSkills includes command-shaped payload fields for user-invokable skills", async () => {
		const skills = await getSkills();
		const audit = skills.find((skill) => skill.id === "audit");

		expect(audit).toBeDefined();
		expect(audit).toMatchObject({
			id: "audit",
			name: "audit",
			userInvokable: true,
			architectureRole: "command",
			referenceCount: 1,
			sourcePath: "audit",
		});
		expect(audit.domains).toEqual([]);
	});

	test("getCommands returns only user-invokable commands with the shared payload shape", async () => {
		const commands = await getCommands();
		const audit = commands.find((command) => command.id === "audit");

		expect(audit).toBeDefined();
		expect(commands.some((command) => command.id === "frontend-design")).toBe(
			false,
		);
		expect(commands.every((command) => command.userInvokable)).toBe(true);
		expect(audit).toMatchObject({
			id: "audit",
			architectureRole: "command",
			referenceCount: 1,
			sourcePath: "audit",
		});
	});
});
