// Teach-impeccable command demo - shows project context gathering
export default {
  id: 'teach-impeccable',
  caption: 'Unconfigured AI → Context-aware design partner',
  
  before: `
    <div style="display: flex; flex-direction: column; gap: 12px; width: 100%; max-width: 280px;">
      <div style="padding: 16px; background: var(--color-mist); border-radius: 8px; opacity: 0.7;">
        <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; color: var(--color-ash); margin-bottom: 8px;">AI Context</div>
        <div style="font-size: 13px; color: var(--color-ash); font-style: italic;">No project context loaded...</div>
      </div>
      <div style="display: flex; gap: 8px;">
        <div style="flex: 1; padding: 12px; background: #f0f0f0; border-radius: 6px; text-align: center;">
          <div style="font-size: 20px; margin-bottom: 4px;">❓</div>
          <div style="font-size: 11px; color: #888;">Brand?</div>
        </div>
        <div style="flex: 1; padding: 12px; background: #f0f0f0; border-radius: 6px; text-align: center;">
          <div style="font-size: 20px; margin-bottom: 4px;">❓</div>
          <div style="font-size: 11px; color: #888;">Tokens?</div>
        </div>
        <div style="flex: 1; padding: 12px; background: #f0f0f0; border-radius: 6px; text-align: center;">
          <div style="font-size: 20px; margin-bottom: 4px;">❓</div>
          <div style="font-size: 11px; color: #888;">Style?</div>
        </div>
      </div>
    </div>
  `,
  
  after: `
    <div style="display: flex; flex-direction: column; gap: 12px; width: 100%; max-width: 280px;">
      <div style="padding: 16px; background: linear-gradient(135deg, oklch(0.95 0.02 280), oklch(0.92 0.03 200)); border-radius: 8px; border: 1px solid oklch(0.85 0.05 280);">
        <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; color: oklch(0.45 0.1 280); margin-bottom: 8px;">✓ Project Context Saved</div>
        <div style="font-size: 13px; color: var(--color-ink);">Design system loaded with brand colors, typography scale, and component patterns.</div>
      </div>
      <div style="display: flex; gap: 8px;">
        <div style="flex: 1; padding: 12px; background: oklch(0.96 0.02 150); border-radius: 6px; text-align: center; border: 1px solid oklch(0.85 0.05 150);">
          <div style="font-size: 20px; margin-bottom: 4px;">🎨</div>
          <div style="font-size: 11px; color: oklch(0.35 0.1 150);">Brand ✓</div>
        </div>
        <div style="flex: 1; padding: 12px; background: oklch(0.96 0.02 200); border-radius: 6px; text-align: center; border: 1px solid oklch(0.85 0.05 200);">
          <div style="font-size: 20px; margin-bottom: 4px;">📐</div>
          <div style="font-size: 11px; color: oklch(0.35 0.1 200);">Tokens ✓</div>
        </div>
        <div style="flex: 1; padding: 12px; background: oklch(0.96 0.02 280); border-radius: 6px; text-align: center; border: 1px solid oklch(0.85 0.05 280);">
          <div style="font-size: 20px; margin-bottom: 4px;">✨</div>
          <div style="font-size: 11px; color: oklch(0.35 0.1 280);">Style ✓</div>
        </div>
      </div>
    </div>
  `
};
