import { initFrameworkViz } from "./js/components/framework-viz.js";
import {
	initGlassTerminal,
	renderTerminalLayout,
} from "./js/components/glass-terminal.js";
import { initLensEffect } from "./js/components/lens.js";
import { initScrollReveal } from "./js/utils/reveal.js";
import { initAnchorScroll, initHashTracking } from "./js/utils/scroll.js";

// ============================================
// STATE
// ============================================

let allCommands = [];

const DOMAIN_LABELS = {
	qa: "QA",
};

// ============================================
// CONTENT LOADING
// ============================================

async function loadContent() {
	try {
		const [commandsRes, patternsRes, skillsRes] = await Promise.all([
			fetch("/api/commands"),
			fetch("/api/patterns"),
			fetch("/api/skills"),
		]);

		// Check for HTTP errors
		if (!commandsRes.ok) {
			throw new Error(`Commands API failed: ${commandsRes.status}`);
		}
		if (!patternsRes.ok) {
			throw new Error(`Patterns API failed: ${patternsRes.status}`);
		}
		if (!skillsRes.ok) {
			throw new Error(`Skills API failed: ${skillsRes.status}`);
		}

		allCommands = await commandsRes.json();
		const patternsData = await patternsRes.json();
		const skillsData = await skillsRes.json();

		// Render commands (Glass Terminal)
		renderTerminalLayout(allCommands);

		// Render patterns with tabbed navigation
		renderPatternsWithTabs(patternsData.patterns, patternsData.antipatterns);

		// Render core skill architecture
		renderSkillArchitecture(skillsData);
	} catch (error) {
		console.error("Failed to load content:", error);
		showLoadError(error);
	}
}

function showLoadError(error) {
	// Show error in commands section
	const commandsGallery = document.querySelector(".commands-gallery");
	if (commandsGallery) {
		commandsGallery.innerHTML = `
			<div class="load-error" role="alert">
				<div class="load-error-icon" aria-hidden="true">⚠</div>
				<h3 class="load-error-title">Failed to load commands</h3>
				<p class="load-error-text">There was a problem loading the content. Please check your connection and try again.</p>
				<button class="btn btn-secondary load-error-retry" onclick="location.reload()">
					Retry
				</button>
			</div>
		`;
	}

	// Show error in patterns section
	const patternsContainer = document.getElementById("patterns-categories");
	if (patternsContainer) {
		patternsContainer.innerHTML = `
			<div class="load-error" role="alert">
				<div class="load-error-icon" aria-hidden="true">⚠</div>
				<h3 class="load-error-title">Failed to load patterns</h3>
				<p class="load-error-text">There was a problem loading the content. Please check your connection and try again.</p>
				<button class="btn btn-secondary load-error-retry" onclick="location.reload()">
					Retry
				</button>
			</div>
		`;
	}

	const architectureContainer = document.getElementById("skill-architecture");
	if (architectureContainer) {
		architectureContainer.innerHTML = `
			<div class="architecture-empty" role="alert">
				There was a problem loading the core skill architecture.
			</div>
		`;
	}
}

function getCoreSkills(skills) {
	if (!Array.isArray(skills)) return [];

	return skills.filter((skill) => skill.architectureRole === "core-skill");
}

function getVisibleDomain(skill) {
	if (Array.isArray(skill.domains) && skill.domains.length > 0) {
		return skill.domains[0];
	}

	return skill.name.replace(
		/-(design|review|delivery|strategy|engineering)$/,
		"",
	);
}

function formatDomainLabel(domain) {
	return DOMAIN_LABELS[domain] ?? domain;
}

function formatList(items) {
	if (items.length === 0) return "the visible product domains";
	if (items.length === 1) return items[0];
	if (items.length === 2) return `${items[0]} and ${items[1]}`;

	return `${items.slice(0, -1).join(", ")}, and ${items[items.length - 1]}`;
}

function renderArchitectureMessaging(coreSkills) {
	if (!Array.isArray(coreSkills) || coreSkills.length === 0) return;

	const visibleDomains = [
		...new Set(coreSkills.map(getVisibleDomain).filter(Boolean)),
	];
	const formattedDomains = visibleDomains.map(formatDomainLabel);
	const skillCount = coreSkills.length;
	const skillLabel = `${skillCount} core skill${skillCount === 1 ? "" : "s"}`;
	const verb = skillCount === 1 ? "defines" : "define";
	const heroCopy = document.getElementById("hero-core-skills-copy");
	const sectionLead = document.getElementById("architecture-section-lead");
	const architectureCopy = document.getElementById("architecture-copy");
	const domainStrip = document.getElementById("architecture-domain-strip");

	if (heroCopy) {
		heroCopy.textContent = `${skillLabel} across ${formatList(formattedDomains)} disciplines`;
	}

	if (sectionLead) {
		sectionLead.textContent = `${skillLabel} ${verb} the architecture, and a shared command layer carries that vocabulary across ${formatList(formattedDomains)} disciplines.`;
	}

	if (architectureCopy) {
		architectureCopy.textContent = `The repo now builds from a genuinely multi-domain source tree. The public surface shows that layered system directly: ${skillLabel} for ${formatList(formattedDomains)} disciplines, with one command architecture shared across the same install flow.`;
	}

	if (domainStrip) {
		domainStrip.innerHTML = visibleDomains
			.map(
				(domain) => `<span class="architecture-domain-pill">${domain}</span>`,
			)
			.join("");
	}
}

function renderSkillArchitecture(skills) {
	const container = document.getElementById("skill-architecture");
	if (!container || !Array.isArray(skills)) return;

	const coreSkills = getCoreSkills(skills);

	renderArchitectureMessaging(coreSkills);

	if (coreSkills.length === 0) {
		container.innerHTML = `
			<div class="architecture-empty">
				Core skill metadata is not available right now.
			</div>
		`;
		return;
	}

	container.innerHTML = coreSkills
		.map((skill) => {
			const domains = Array.isArray(skill.domains) ? skill.domains : [];
			const domainChips = domains
				.map(
					(domain) => `<span class="architecture-domain-chip">${domain}</span>`,
				)
				.join("");

			return `
				<article class="architecture-card">
					<div class="architecture-card-header">
						<p class="architecture-card-kicker">Core skill</p>
						<h3 class="architecture-card-title">${skill.name}</h3>
					</div>
					<p class="architecture-card-description">${skill.description}</p>
					<div class="architecture-card-meta">
						<div class="architecture-domain-list">${domainChips}</div>
						<p class="architecture-card-note">${skill.referenceCount} reference file${skill.referenceCount === 1 ? "" : "s"}</p>
					</div>
				</article>
			`;
		})
		.join("");
}

function renderPatternsWithTabs(patterns, antipatterns) {
	const container = document.getElementById("patterns-categories");
	if (!container || !patterns || !antipatterns) return;

	// Create a map of antipatterns by category name
	const antipatternMap = {};
	antipatterns.forEach((cat) => {
		antipatternMap[cat.name] = cat.items;
	});

	// Generate unique IDs for tabs
	const tabId = (name) =>
		`pattern-tab-${name.toLowerCase().replace(/\s+/g, "-")}`;
	const panelId = (name) =>
		`pattern-panel-${name.toLowerCase().replace(/\s+/g, "-")}`;

	// Build tabs with WAI-ARIA attributes
	const tabsHTML = patterns
		.map(
			(category, i) => `<button
			class="pattern-tab${i === 0 ? " active" : ""}"
			data-tab="${category.name}"
			role="tab"
			id="${tabId(category.name)}"
			aria-selected="${i === 0 ? "true" : "false"}"
			aria-controls="${panelId(category.name)}"
			tabindex="${i === 0 ? "0" : "-1"}"
		>${category.name}</button>`,
		)
		.join("");

	// Build panels with WAI-ARIA attributes
	const panelsHTML = patterns
		.map((category, i) => {
			const antiItems = antipatternMap[category.name] || [];
			return `
		<div
			class="pattern-panel${i === 0 ? " active" : ""}"
			data-panel="${category.name}"
			role="tabpanel"
			id="${panelId(category.name)}"
			aria-labelledby="${tabId(category.name)}"
			${i !== 0 ? "hidden" : ""}
		>
			<div class="pattern-columns">
				<div class="pattern-column pattern-column--anti">
					<span class="pattern-column-label" id="dont-label-${i}">Don't</span>
					<ul class="pattern-list" aria-labelledby="dont-label-${i}">
						${antiItems.map((item) => `<li class="pattern-item pattern-item--anti">${item}</li>`).join("")}
					</ul>
				</div>
				<div class="pattern-column pattern-column--do">
					<span class="pattern-column-label" id="do-label-${i}">Do</span>
					<ul class="pattern-list" aria-labelledby="do-label-${i}">
						${category.items.map((item) => `<li class="pattern-item pattern-item--do">${item}</li>`).join("")}
					</ul>
				</div>
			</div>
		</div>
	`;
		})
		.join("");

	container.innerHTML = `
		<div class="pattern-tabs" role="tablist" aria-label="Pattern categories">${tabsHTML}</div>
		<div class="pattern-panels">${panelsHTML}</div>
	`;

	const tabs = container.querySelectorAll(".pattern-tab");
	const panels = container.querySelectorAll(".pattern-panel");

	// Function to switch tabs
	const switchTab = (newTab) => {
		const tabName = newTab.dataset.tab;

		// Update ARIA attributes on all tabs
		tabs.forEach((t) => {
			t.classList.remove("active");
			t.setAttribute("aria-selected", "false");
			t.setAttribute("tabindex", "-1");
		});

		// Activate the new tab
		newTab.classList.add("active");
		newTab.setAttribute("aria-selected", "true");
		newTab.setAttribute("tabindex", "0");
		newTab.focus();

		// Update panels
		panels.forEach((p) => {
			p.classList.remove("active");
			p.setAttribute("hidden", "");
		});
		const activePanel = container.querySelector(`[data-panel="${tabName}"]`);
		activePanel.classList.add("active");
		activePanel.removeAttribute("hidden");
	};

	// Tab click handling
	tabs.forEach((tab) => {
		tab.addEventListener("click", () => switchTab(tab));
	});

	// Keyboard navigation (Arrow keys, Home, End)
	tabs.forEach((tab, index) => {
		tab.addEventListener("keydown", (e) => {
			let targetIndex = index;

			switch (e.key) {
				case "ArrowLeft":
				case "ArrowUp":
					e.preventDefault();
					targetIndex = index === 0 ? tabs.length - 1 : index - 1;
					break;
				case "ArrowRight":
				case "ArrowDown":
					e.preventDefault();
					targetIndex = index === tabs.length - 1 ? 0 : index + 1;
					break;
				case "Home":
					e.preventDefault();
					targetIndex = 0;
					break;
				case "End":
					e.preventDefault();
					targetIndex = tabs.length - 1;
					break;
				default:
					return;
			}

			switchTab(tabs[targetIndex]);
		});
	});
}

// ============================================
// EVENT HANDLERS
// ============================================

// Handle bundle download clicks via event delegation
document.addEventListener("click", (e) => {
	const bundleBtn = e.target.closest("[data-bundle]");
	if (bundleBtn) {
		const provider = bundleBtn.dataset.bundle;
		const prefixToggle = document.getElementById("prefix-toggle");
		const usePrefixed = prefixToggle && prefixToggle.checked;
		const bundleName = usePrefixed ? `${provider}-prefixed` : provider;
		window.location.href = `/api/download/bundle/${bundleName}`;
	}

	// Handle copy button clicks
	const copyBtn = e.target.closest("[data-copy]");
	if (copyBtn) {
		const textToCopy = copyBtn.dataset.copy;
		navigator.clipboard.writeText(textToCopy).then(() => {
			copyBtn.classList.add("copied");
			setTimeout(() => copyBtn.classList.remove("copied"), 1500);
		});
	}
});

// ============================================
// STARTUP
// ============================================

function init() {
	initAnchorScroll();
	initHashTracking();
	initLensEffect();
	initScrollReveal();
	initGlassTerminal();
	initFrameworkViz();
	loadContent();

	document.body.classList.add("loaded");
}

if (document.readyState === "loading") {
	document.addEventListener("DOMContentLoaded", init);
} else {
	init();
}
