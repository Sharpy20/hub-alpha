# Project Evaluation Template

> **Purpose:** Comprehensive multi-perspective evaluation of the Inpatient Hub project
> **Usage:** Run `/evaluate` or ask Claude to "run project evaluation prompts" to generate a dated evaluation report
> **Output:** Creates `YYYY-MM-DD_project-evaluation.md` in this folder

---

## Evaluation Framework

This template defines 10 evaluation perspectives ("hats") that together provide a 360-degree view of the project's status, strengths, weaknesses, and recommendations.

---

## HAT 1: Web Developer

**Perspective:** Technical quality, architecture, code standards, maintainability

### Evaluation Criteria:
- **Code Quality:** Is the codebase clean, consistent, and well-organised?
- **Architecture:** Is the project structure logical and scalable?
- **Performance:** Are there any obvious performance bottlenecks?
- **Best Practices:** Does the code follow React/Next.js/TypeScript best practices?
- **Dependencies:** Are dependencies up-to-date and appropriate?
- **Error Handling:** Is error handling comprehensive and user-friendly?
- **Testing:** Is there adequate test coverage?
- **Build Health:** Does the project build without errors or warnings?

### Output Sections:
1. Strengths
2. Technical Debt / Flaws
3. Limitations
4. Recommendations (prioritised)

---

## HAT 2: Nurse (Clinical User)

**Perspective:** Day-to-day usability for frontline clinical staff across all user roles

### Evaluation Criteria:
- **Workflow Efficiency:** Does the app speed up or slow down daily tasks?
- **Information Access:** Can staff quickly find what they need?
- **Task Management:** Is the task system intuitive for busy ward environments?
- **Patient Safety:** Does the app support safe clinical practice?
- **Interruption Tolerance:** Can workflows be paused and resumed easily?
- **Mobile Use:** Can it be used on the move (tablet/phone)?
- **Shift Handover:** Does it support handover processes?

### Evaluate for each role:
- **Normal User** (HCA, Student Nurse)
- **Band 5/6 Nurse** (Named Nurse responsibilities)
- **Ward Admin** (Shift Coordinator, Senior Staff)
- **Contributor** (Staff who update content)

### Output Sections:
1. What works well for clinical staff
2. Pain points and frustrations
3. Missing features staff would expect
4. Recommendations (by priority for patient care impact)

---

## HAT 3: Trust Senior Management

**Perspective:** Strategic fit, risk assessment, business case, implementation feasibility

### Evaluation Criteria:
- **Strategic Alignment:** Does this support Trust objectives and NHS Long Term Plan?
- **Risk Assessment:** What are the operational, clinical, and reputational risks?
- **Cost-Benefit:** What resources are needed vs. potential efficiency gains?
- **Implementation Complexity:** How disruptive is rollout?
- **Staff Acceptance:** Will staff adopt this willingly?
- **Scalability:** Could this extend to other wards/services?
- **Governance:** Are appropriate controls in place?

### Output Sections:
1. Strategic Value Assessment
2. Risk Register (with mitigations)
3. Resource Requirements
4. Implementation Considerations
5. Recommendations for Board

---

## HAT 4: Information Governance Officer

**Perspective:** Data protection, GDPR compliance, information security, audit trails

### Evaluation Criteria:
- **Data Classification:** Is data appropriately classified by sensitivity?
- **GDPR Compliance:** Are all 7 principles addressed?
- **Consent:** Are consent mechanisms appropriate?
- **Data Minimisation:** Is only necessary data collected/displayed?
- **Retention:** Are retention policies defined?
- **Subject Rights:** Can data subject requests be fulfilled?
- **DPIA:** Is a Data Protection Impact Assessment needed/done?
- **Audit Trails:** Can access and changes be audited?

### Output Sections:
1. Compliance Status
2. Data Flow Analysis
3. Risk Areas
4. Required Actions for Compliance
5. Recommendations

---

## HAT 5: IT Security Analyst

**Perspective:** Cybersecurity, vulnerability assessment, access control, threat modelling

### Evaluation Criteria:
- **Authentication:** Is auth robust and appropriate for data sensitivity?
- **Authorisation:** Is role-based access control properly implemented?
- **Data at Rest:** Is sensitive data encrypted?
- **Data in Transit:** Are all connections secured (HTTPS)?
- **Input Validation:** Are inputs sanitised against injection attacks?
- **Session Management:** Are sessions handled securely?
- **Dependency Security:** Are there known vulnerabilities in dependencies?
- **Infrastructure:** Are deployment environments secured?

### Output Sections:
1. Security Strengths
2. Vulnerabilities Identified
3. Threat Model Summary
4. Remediation Priorities
5. Recommendations (Critical/High/Medium/Low)

---

## HAT 6: UX Designer

**Perspective:** User experience, interface design, accessibility, user journey efficiency

### Evaluation Criteria:
- **Visual Hierarchy:** Is information prioritised effectively?
- **Consistency:** Is the interface consistent throughout?
- **Navigation:** Can users find features intuitively?
- **Feedback:** Does the system provide clear feedback on actions?
- **Error Recovery:** Can users easily recover from mistakes?
- **Cognitive Load:** Is information presented digestibly?
- **Mobile Experience:** Is responsive design effective?
- **NHS Identity:** Does it align with NHS design system?

### Output Sections:
1. UX Strengths
2. Usability Issues
3. User Journey Analysis
4. Recommendations (with wireframe suggestions if applicable)

---

## HAT 7: Accessibility Specialist

**Perspective:** WCAG 2.1 AA compliance, inclusive design, assistive technology support

### Evaluation Criteria:
- **Perceivable:** Alt text, contrast ratios, text sizing, captions
- **Operable:** Keyboard navigation, focus management, timing
- **Understandable:** Clear language, consistent navigation, error identification
- **Robust:** Semantic HTML, ARIA labels, screen reader compatibility
- **Colour Blindness:** Does the UI work without colour cues?
- **Motor Impairments:** Are click targets adequate size?
- **Cognitive Accessibility:** Is content clear and simple?

### Output Sections:
1. Compliance Summary (by WCAG criterion)
2. Accessibility Barriers Identified
3. Assistive Technology Testing Notes
4. Remediation Priorities
5. Recommendations

---

## HAT 8: NHS Digital Standards Reviewer

**Perspective:** NHS Service Standard compliance, interoperability, clinical safety

### Evaluation Criteria:
- **NHS Service Standard:** Alignment with 14 NHS service standard points
- **NHS Design System:** Use of NHS.UK patterns and components
- **Clinical Safety (DCB0129/0160):** Has clinical risk been assessed?
- **Interoperability:** FHIR readiness, HL7 considerations
- **Terminology:** Use of NHS standard terminologies (SNOMED CT, dm+d)
- **Care Quality:** Does the app support CQC standards?

### Output Sections:
1. NHS Standards Compliance Matrix
2. Clinical Safety Assessment
3. Interoperability Readiness
4. Gaps and Recommendations

---

## HAT 9: Training Coordinator

**Perspective:** Staff onboarding, learning curve, documentation, support requirements

### Evaluation Criteria:
- **Intuitive Design:** Can staff use it with minimal training?
- **Learning Curve:** How long to reach proficiency?
- **Documentation:** Is user documentation adequate?
- **Help Features:** Are in-app help and tooltips sufficient?
- **Training Materials:** What training resources are needed?
- **Support Model:** What ongoing support is required?
- **Change Management:** How to manage transition from current processes?

### Output Sections:
1. Learning Curve Assessment
2. Training Needs Analysis
3. Documentation Gaps
4. Support Model Recommendations
5. Rollout Strategy Suggestions

---

## HAT 10: Project Manager

**Perspective:** Scope, timeline, deliverables, risks, stakeholder management

### Evaluation Criteria:
- **Scope:** Is scope clearly defined and controlled?
- **Progress:** What percentage complete against plan?
- **Quality:** Are deliverables meeting quality standards?
- **Risks:** What project risks exist and are they mitigated?
- **Dependencies:** Are external dependencies identified and managed?
- **Stakeholders:** Are stakeholder needs being met?
- **Documentation:** Is project documentation adequate?
- **Next Steps:** What are the critical path items?

### Output Sections:
1. Progress Summary
2. Scope Assessment
3. Risk Register
4. Dependency Analysis
5. Recommendations and Next Actions

---

## Evaluation Output Structure

When an evaluation is run, the output document should follow this structure:

```markdown
# Project Evaluation: [DATE]

## Executive Summary
[3-5 bullet points summarising key findings]

## Evaluation Details

### 1. Web Developer Perspective
[Full evaluation output]

### 2. Clinical User Perspective
[Full evaluation output]

### 3. Trust Management Perspective
[Full evaluation output]

### 4. Information Governance Perspective
[Full evaluation output]

### 5. IT Security Perspective
[Full evaluation output]

### 6. UX Design Perspective
[Full evaluation output]

### 7. Accessibility Perspective
[Full evaluation output]

### 8. NHS Standards Perspective
[Full evaluation output]

### 9. Training Perspective
[Full evaluation output]

### 10. Project Management Perspective
[Full evaluation output]

## Consolidated Recommendations

### Critical (Must Do)
[List]

### High Priority
[List]

### Medium Priority
[List]

### Low Priority / Nice to Have
[List]

## Action Items
| Item | Owner | Priority | Target Date |
|------|-------|----------|-------------|
| ... | ... | ... | ... |
```

---

## File Naming Convention

**Evaluation Reports:**
- Format: `YYYY-MM-DD_project-evaluation.md`
- Example: `2026-01-25_project-evaluation.md`

**Supplementary Documents:**
- Format: `YYYY-MM-DD_[hat-name]-deep-dive.md`
- Example: `2026-01-25_security-deep-dive.md`

**Archived Evaluations:**
- Move to `archive/` subfolder after 3 months
- Or when superseded by newer evaluation

---

## Quick Reference

To run a full evaluation, ask Claude:
- "Run project evaluation prompts"
- "Do a full project evaluation"
- "Put on all the hats and review the project"

To run a specific perspective, ask Claude:
- "Put on your [hat name] hat and evaluate the project"
- "Do a security review of the project"
- "Evaluate from a clinical user perspective"

---

*Template Version: 1.0 | Created: 25 January 2026*
