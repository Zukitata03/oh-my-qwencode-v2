---
description: "Website Cloning — URL-driven site cloning with visual verification"
---
Activate the **Web-Clone** workflow from oh-my-qwencode.

Clone a website from URL with full extraction, generation, and visual verification pipeline.

## Pipeline
1. **Extract** — fetch the target URL, analyze structure, assets, and styling.
2. **Generate** — create equivalent HTML/CSS/JS structure.
3. **Verify** — use `$visual-verdict` to compare cloned output against reference screenshots.
4. **Iterate** — run `$visual-verdict` every iteration before the next edit until score >= 90.

Task: {{args}}
