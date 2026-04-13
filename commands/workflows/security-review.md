---
description: "Security Audit — vulnerability scanning and trust boundary review"
---
Activate the **Security-Review** workflow from oh-my-qwencode.

Comprehensive security audit: check for vulnerabilities, trust boundary issues, and common attack vectors.

## Checklist
- Injection (SQL, command, template, path traversal)
- Authentication & session management
- Authorization & access control
- Data exposure (PII, secrets, error messages)
- Cryptographic practices
- Input validation & sanitization
- Dependency vulnerabilities

## Output
Findings classified by severity (Critical/High/Medium/Low) with file:line evidence and concrete remediation steps.

Task: {{args}}
