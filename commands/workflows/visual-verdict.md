---
description: "Screenshot-to-Reference Visual QA Verdict"
---
Activate the **Visual Verdict** workflow from oh-my-qwencode.

Structured visual QA: compare current output against a reference image and provide a scored verdict.

## Output Format
```json
{
  "score": 0-100,
  "verdict": "pass|needs-work|fail",
  "category_match": true|false,
  "differences": ["list of visual differences"],
  "suggestions": ["specific fixes"],
  "reasoning": "brief explanation"
}
```

## Usage
- Run `$visual-verdict` every iteration before the next edit in visual tasks.
- Default pass threshold: score >= 90.
- Persist verdict to `.omq/state/{scope}/ralph-progress.json`.

Task: {{args}}
