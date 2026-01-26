# Project Review v3: Trust Management Perspective

> **Document Version:** 1.0
> **Last Updated:** 25 January 2026
> **Project:** Inpatient Hub
> **Reviewer Role:** NHS Trust Management / Digital Transformation Lead

---

## Executive Summary

This review assesses the Inpatient Hub project from a Trust management perspective, evaluating implementation feasibility, information governance, costs, and strategic alignment. The analysis covers the four deployment versions (Light through Max+) with specific recommendations for each.

---

## Strategic Alignment

### Trust Digital Strategy Alignment

| Strategic Goal | Alignment | Evidence |
|----------------|-----------|----------|
| Digital-first patient care | Medium | Supports workflows but doesn't directly interface with patients |
| Staff efficiency | High | Reduces referral confusion, prevents task duplication |
| Paperless processes | Medium | Still requires SystemOne for clinical record (until Max+) |
| Interoperability | Low (Light) / High (Max+) | SystemOne integration planned for Max+ |
| Cost reduction | Medium | Training cost, potential time savings |

### CQC Alignment

| CQC Domain | Relevance | Notes |
|------------|-----------|-------|
| Safe | High | Task tracking prevents items being missed |
| Effective | Medium | Referral workflows improve consistency |
| Caring | Low | Not directly patient-facing |
| Responsive | Medium | Faster referral processing |
| Well-led | High | Audit trails, accountability |

---

## Implementation Risk Assessment

### Risk Matrix

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Staff resistance to new system | Medium | High | Phased rollout, superuser support |
| Data loss/corruption | Low | High | Proper backup strategy, versioning |
| Security breach | Low (Light) / Medium (Max+) | Critical | IG review, penetration testing |
| Integration failures | Medium | Medium | Thorough testing, fallback procedures |
| Scope creep | High | Medium | Clear version boundaries, governance |
| Vendor lock-in | Low | Medium | Open-source technologies used |
| Ongoing maintenance burden | Medium | Medium | Documentation, training for IT |

### Version-Specific Risks

**Light Version:**
- Low risk - no PII, no integration
- Risk: Limited value may reduce adoption
- Mitigation: Position as "quick reference" tool

**Medium Version:**
- Medium risk - Trust authentication required
- Risk: Internal workflow visibility could cause concern
- Mitigation: Clear communication about purpose

**Max Version:**
- Higher risk - PII involved
- Risk: Data protection compliance requirements
- Mitigation: Full DPIA, IG approval

**Max+ Version:**
- Highest risk - API integration
- Risk: SystemOne integration complexity
- Mitigation: TPP partnership, extensive testing

---

## Information Governance Assessment

### Data Classification

| Version | Data Type | Classification | Controls Required |
|---------|-----------|----------------|-------------------|
| Light | Bookmarks, guides | Public | None special |
| Medium | Internal SOPs, ward tasks | Internal | Trust network, auth |
| Max | Patient names, discharge info | Confidential/PII | Full IG controls |
| Max+ | Patient clinical data | Sensitive/PII | API security, audit |

### GDPR Compliance Checklist

| Requirement | Light | Medium | Max | Max+ |
|-------------|-------|--------|-----|------|
| Lawful basis identified | N/A | Yes | Yes | Yes |
| Privacy notice updated | N/A | Yes | Yes | Yes |
| DPIA completed | N/A | Maybe | Yes | Yes |
| Data retention defined | N/A | Yes | Yes | Yes |
| Breach procedures | N/A | Yes | Yes | Yes |
| Subject access support | N/A | Yes | Yes | Yes |
| Data minimisation | Yes | Yes | Yes | Yes |

### Caldicott Principles Alignment

For Max/Max+ versions:
1. Justify the purpose - clinical coordination
2. Don't use unless necessary - minimum viable data
3. Use minimum necessary - patient name, ward, status only
4. Access on need-to-know basis - role-based access
5. Everyone must understand responsibility - training required
6. Duty to share for care - supports referral workflows
7. Duty to share for safety - task visibility prevents gaps

### Recommendations for IG Approval

1. Complete DPIA for Max/Max+ versions
2. Submit to Caldicott Guardian for review
3. Include in Trust asset register
4. Define data retention (suggest: active + 2 years)
5. Document lawful basis (legitimate interests or consent)
6. Update privacy notice for staff

---

## Security Assessment

### Current Security Posture

| Control | Light | Medium | Max | Max+ |
|---------|-------|--------|-----|------|
| Authentication | Demo login | Trust SSO | Trust SSO | Trust SSO |
| Authorisation | Role-based | Role-based | Role-based | Role-based |
| Encryption (transit) | HTTPS | HTTPS | HTTPS | HTTPS + HSCN |
| Encryption (rest) | N/A | Supabase | Supabase | Trust DB |
| Audit logging | Limited | Yes | Yes | Yes |
| Penetration tested | No | Required | Required | Required |

### Security Requirements by Version

**For Medium+:**
- Integration with Trust SSO (Azure AD likely)
- Supabase Row Level Security configuration
- Session timeout (15-30 minutes)
- Failed login lockout
- Audit log retention (7 years)

**For Max+:**
- HSCN network connectivity
- API key management
- Mutual TLS for SystemOne
- Regular security reviews
- Incident response procedures

### Penetration Testing

**Scope for Max/Max+ versions:**
- Authentication bypass attempts
- Authorisation escalation
- SQL injection (if applicable)
- XSS vulnerabilities
- API security
- Session management

**Estimated Cost:** 5,000 - 10,000 (external provider)

---

## Cost Analysis

### Development Costs (Estimated)

| Phase | Description | Cost Estimate |
|-------|-------------|---------------|
| Light (complete) | Public reference tool | 5,000 - 8,000 |
| Medium additions | Auth, persistence, SOPs | 8,000 - 12,000 |
| Max additions | Patient features, discharge | 10,000 - 15,000 |
| Max+ additions | SystemOne integration | 15,000 - 25,000 |
| **Total** | **All versions** | **38,000 - 60,000** |

*Note: Costs based on commercial development rates. Internal development would differ.*

### Infrastructure Costs (Annual)

| Item | Light | Medium | Max | Max+ |
|------|-------|--------|-----|------|
| Hosting | 0 (Vercel free) | 500-1,000 | 2,000-5,000 | 5,000-10,000 |
| Database | 0 | 500-1,000 | 1,000-2,000 | Trust IT |
| SSL certificates | 0 | Included | Included | Included |
| Domain | 50 | 50 | 50 | 50 |
| HSCN | 0 | 0 | 0 | Existing |
| **Annual Total** | **50** | **1,050-2,050** | **3,050-7,050** | **5,050-10,050** |

### Staff Costs (Year 1)

| Item | Cost Estimate |
|------|---------------|
| Training development | 2,000 - 5,000 |
| Training delivery (per ward) | 500 - 1,000 |
| Superuser time (5 wards x 40 hrs) | 5,000 - 8,000 |
| IT support setup | 2,000 - 4,000 |
| Ongoing support (0.2 FTE) | 8,000 - 12,000 |

### Return on Investment Considerations

**Potential Time Savings:**
- Referral workflow guidance: 10-15 min saved per referral
- Task claiming: 5-10 min saved per shift in coordination
- Discharge audit: 20-30 min saved per discharge

**Assumptions:**
- 5 wards, 50 referrals/month, 100 discharges/month
- Average nurse cost: 25/hour

**Estimated Annual Savings:**
- Referrals: 50 x 12 x 12 min x 25/hr = 3,000/year
- Discharges: 100 x 12 x 25 min x 25/hr = 12,500/year
- Task coordination: 5 wards x 3 shifts x 365 x 8 min x 25/hr = 18,250/year
- **Total Potential: ~33,750/year**

**Payback Period:** 1.5 - 2 years (Max version)

---

## Training Requirements

### Training Programme

| Audience | Duration | Format | Content |
|----------|----------|--------|---------|
| All ward staff | 30 min | Video + guide | Basic navigation, bookmarks, guides |
| Nurses (Medium+) | 1 hour | Workshop | Task management, referrals |
| Ward admins (Medium+) | 2 hours | Workshop | Discharge, oversight, reports |
| IT support | 4 hours | Technical | Deployment, troubleshooting |

### Training Materials Required

1. 15-minute introductory video
2. A4 quick reference card (laminated for ward)
3. Role-specific user guides (PDF)
4. FAQ document
5. "Train the trainer" pack for superusers
6. IT support runbook

### Superuser Model

- 2 superusers per ward (different shifts)
- Initial 4-hour training
- Monthly check-ins for first 3 months
- Responsibility for first-line support
- Feedback channel to project team

---

## Change Management

### Stakeholder Analysis

| Stakeholder | Interest | Influence | Strategy |
|-------------|----------|-----------|----------|
| Ward nurses | High | High | Early involvement, training |
| Ward managers | High | High | Benefits focus, metrics |
| Matrons | Medium | High | Governance, reporting |
| IT department | Medium | Medium | Technical support |
| IG team | Medium | High | Early DPIA engagement |
| Union reps | Low | Medium | Staff benefit focus |
| Patients | Low | Low | Privacy assurance |

### Communication Plan

| Phase | Timing | Audience | Message | Channel |
|-------|--------|----------|---------|---------|
| Awareness | -8 weeks | All staff | New tool coming | Team brief, email |
| Engagement | -6 weeks | Ward managers | Input on features | Meetings |
| Preparation | -4 weeks | Ward staff | Training schedule | Team brief |
| Launch | Week 0 | All staff | Go-live support | Training, posters |
| Embedding | +4 weeks | All staff | Progress update | Newsletter |

### Success Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| Adoption rate | 80% staff using weekly | Login analytics |
| Task completion rate | 90% | System data |
| Referral workflow use | 70% of referrals | System data |
| User satisfaction | 7/10+ | Survey at 3 months |
| Support tickets | <5/week after month 1 | Helpdesk |

---

## Appropriateness Assessment

### For Mental Health Inpatient Wards

| Factor | Assessment |
|--------|------------|
| Clinical safety | Supports task visibility but doesn't replace clinical judgement |
| Workflow fit | Good fit for referrals, reasonable for tasks |
| Staff capability | Matches typical digital literacy levels |
| Infrastructure | Compatible with Trust IT (with adaptation) |
| Patient benefit | Indirect - better coordination |
| Regulatory | Supports CQC requirements if used consistently |

### Recommended Deployment Strategy

**Phase 1: Light Version (Pilot)**
- Deploy to 1 ward for 4 weeks
- Focus on bookmarks and guides
- Gather feedback
- Low risk, builds familiarity

**Phase 2: Medium Version (Pilot)**
- Deploy to 2-3 wards for 8 weeks
- Enable task management
- Monitor adoption and issues
- Refine training materials

**Phase 3: Max Version (Full Rollout)**
- Complete DPIA and IG approval
- Deploy to all wards
- Enable patient features
- Full training programme

**Phase 4: Max+ Version (Strategic)**
- Engage with TPP for integration
- Complete security assurance
- Limited pilot with integration
- Evaluate before wider rollout

---

## Recommendations

### For Trust Board / Digital Committee

1. **Approve Light version pilot** - Low risk, immediate value
2. **Allocate budget** for Medium+ development if pilot successful
3. **Engage IG early** for DPIA preparation
4. **Assign project sponsor** from clinical leadership
5. **Include in digital strategy** as ward efficiency tool

### For IT Department

1. **Plan authentication integration** (Azure AD / SSO)
2. **Assess hosting options** (Trust vs cloud)
3. **Prepare HSCN access** for Max+ version
4. **Define support model** (0.2 FTE minimum)

### For Clinical Leadership

1. **Identify pilot wards** (suggest engaged NIC)
2. **Appoint clinical lead** for project
3. **Define success criteria** with ward teams
4. **Plan superuser allocation**

---

## Conclusion

The Inpatient Hub project presents a reasonable opportunity to improve ward coordination and referral processes. The phased version approach allows risk to be managed appropriately, with Light and Medium versions being low-risk deployments that can prove value before committing to PII-handling Max/Max+ versions.

**Recommendation:** Proceed with Light version pilot, with budget allocation for Medium development pending successful adoption.

| Version | Recommendation | Risk Level | Investment |
|---------|---------------|------------|------------|
| Light | Proceed | Low | Minimal |
| Medium | Proceed if Light successful | Medium | Moderate |
| Max | Proceed with IG approval | Medium-High | Significant |
| Max+ | Evaluate after Max stable | High | Major |

---

*This review is intended to inform Trust decision-making and should be supplemented with formal business case documentation if proceeding beyond pilot phase.*
