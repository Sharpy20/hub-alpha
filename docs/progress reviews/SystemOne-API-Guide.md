# SystemOne (SystmOne) API Integration Guide

> **Document Version:** 1.0
> **Last Updated:** 25 January 2026
> **Project:** Inpatient Hub
> **Author:** Claude Code

---

## Executive Summary

This document assesses the feasibility and value of integrating the Inpatient Hub application with TPP's SystmOne clinical system via available APIs. SystmOne is widely used across NHS primary care, community services, and mental health trusts. Integration would enable the Max+ version of Inpatient Hub to synchronize tasks, push case notes, and lookup patient information directly from the clinical record.

---

## SystmOne Overview

**SystmOne** (stylised as SystmOne) is a clinical information system developed by TPP (The Phoenix Partnership). It is one of the major Electronic Health Record (EHR) systems used across the NHS, particularly in:

- Primary care (GP surgeries)
- Community health services
- Mental health trusts
- Urgent care / walk-in centres
- Prisons and secure settings

### Key Characteristics

- Web-based and desktop client applications
- Centralised database architecture (data stored on TPP servers)
- Real-time data sharing across all connected organisations
- Fully integrated clinical, administrative and reporting functions

---

## Available APIs

### 1. Client Integration API

The primary API for third-party integrations at the desktop level.

**Capabilities:**
- Discover SystmOne client state
- Search for patient records
- Extract patient data
- Add new patient data (notes, tasks, documents)

**Technical Details:**
- Works over TCP socket hosted by SystmOne client
- Communication via XML documents
- **Throttling:** Maximum 1 request per second, GetPatientRecord limited to 1 per 30 seconds

**Documentation:** [SystmOne Client Integration API Specification (PDF)](https://tpp-uk.com/wp-content/uploads/2021/06/SystmOne-Client-Integration-API-03.03.2020.pdf)

### 2. Patient Facing Services (PFS) API

For patient-facing applications requiring direct integration with primary care.

**Capabilities:**
- Patient appointment booking
- Prescription requests
- Patient messaging
- Access to patient record summaries

**Technical Details:**
- XML-based web service
- HTTPS with TLS 1.2 encryption
- Mutual authentication required
- Only available over NHS HSCN network

**Best For:** Patient apps, not internal staff tools like Inpatient Hub

### 3. Bulk API (Strategic Reports)

For extracting large datasets for reporting and analytics.

**Capabilities:**
- Bulk data extraction
- Population health analytics
- Research datasets

**Best For:** Analytics dashboards, not real-time task integration

### 4. Generic HTML API

For embedding web content within SystmOne.

**Capabilities:**
- Display external web pages within SystmOne interface
- Pass context (patient ID, user ID) to embedded page

**Best For:** Embedding Inpatient Hub *inside* SystmOne rather than API integration

### 5. Telephony API

For call centre and telephony integrations.

**Capabilities:**
- Screen pop with patient details on incoming calls
- Click-to-dial functionality

**Not relevant for Inpatient Hub**

---

## NHS-Wide Integration Standards

### GP Connect (FHIR)

GP Connect is NHS England's national FHIR-based interoperability programme.

**Capabilities:**
- Access patient record (HTML view)
- Book/manage appointments
- Send documents to GP (GP Connect Send Document)

**Relevance to Inpatient Hub:**
- GP Connect Send Document could be used to send discharge summaries
- Uses FHIR + ITK3 + MESH messaging stack
- Requires NHS England conformance

**Documentation:** [GP Connect Developer Hub](https://developer.nhs.uk/apis/gpconnect-1-0-0/development_fhir_api_guidance.html)

### Transfer of Care APIs

NHS Digital provides specific APIs for mental health discharge documentation.

**Capabilities:**
- Create and transmit mental health discharge documents
- FHIR STU3 format
- Uses MESH for secure message exchange

**Relevance to Inpatient Hub:**
- Could be used to generate formal discharge documentation
- Aligns with existing NHS discharge workflows

**Documentation:** [Transfer of Care APIs](https://digital.nhs.uk/services/transfer-of-care-initiative/apis)

---

## Integration Request Process

To integrate with SystmOne, organisations must follow the official process:

### For GP Module Integration

1. Complete the **Supplier Conformance Assessment List (SCAL)**
2. Submit to NHS Digital's IM1 Team for review
3. Follow the Digital Care Services IM1 Pairing Integration Process
4. Complete assurance testing
5. Execute Management Information Letter (MIL)

### For Non-GP Module Integration

1. Visit [TPP Integration Request](https://tpp-uk.com/resources/integration-request/)
2. Complete the integration request form
3. Work with TPP to define scope and technical approach
4. Access Demo environment for development
5. Complete testing and security assurance
6. Production deployment

---

## Test Environment

TPP provides a **Demo Environment** for development:

- Separate SystmOne client installer provided
- Username/password for fictitious test organisation
- Stable environment for development and validation
- Must complete testing here before production access

---

## Potential Integration Points for Inpatient Hub

### High Value Integrations

| Feature | API | Priority | Complexity |
|---------|-----|----------|------------|
| Push case notes | Client Integration API | High | Medium |
| Lookup patient | Client Integration API | High | Medium |
| Sync tasks | Client Integration API | Medium | High |
| Send discharge summary | GP Connect Send Document | Medium | High |

### Recommended Approach for Max+ Version

1. **Phase 1:** Read-only integration
   - Patient lookup (verify patient exists in SystmOne)
   - Pull basic demographics

2. **Phase 2:** Write integration
   - Push case notes after workflow completion
   - Push audit log on discharge confirmation

3. **Phase 3:** Bidirectional sync
   - Task synchronization (complex, requires careful state management)

---

## Technical Considerations

### Network Requirements

- SystmOne Client Integration API requires local network access to SystmOne client
- PFS API requires NHS HSCN network connectivity
- GP Connect requires NHS Spine connectivity

### Security Requirements

- Data Protection Impact Assessment (DIPA) required
- NHS Digital conformance for GP Connect
- TPP security assurance for Client Integration API
- Role-based access control mapping

### Hosting Implications

- Max+ version must run on Trust infrastructure
- Cannot be hosted on public cloud for API access
- VPN or HSCN connectivity required

---

## Value Assessment

### Benefits

1. **Reduced double-entry:** Staff don't need to copy/paste from Inpatient Hub to SystmOne
2. **Data accuracy:** Direct integration reduces transcription errors
3. **Time savings:** One-click case note posting
4. **Audit trail:** Better documentation of actions taken

### Challenges

1. **Approval process:** NHS Digital/TPP conformance takes months
2. **Technical complexity:** XML-based APIs, throttling limits
3. **Infrastructure:** Requires Trust network hosting
4. **Maintenance:** API changes require ongoing support

### Recommendation

**Integration is valuable but not essential for initial deployment.**

- Start with Max version (no API integration)
- Use clipboard-based workflow for case notes
- Pursue API integration as Phase 2 enhancement
- Focus on GP Connect Send Document for discharge summaries first

---

## References

- [TPP Integration Request](https://tpp-uk.com/resources/integration-request/)
- [SystmOne Client Integration API Specification](https://tpp-uk.com/wp-content/uploads/2021/06/SystmOne-Client-Integration-API-03.03.2020.pdf)
- [6B SystmOne Integration Services](https://6b.health/services/interoperability-and-integration/primary-care-ehr-integration/systmone-integration/)
- [6B PFS API Technical Overview](https://6b.digital/insights/integrating-with-the-systmone-patient-facing-services-api-a-technical-overview)
- [NHS GP Connect Developer Hub](https://developer.nhs.uk/apis/gpconnect-1-0-0/development_fhir_api_guidance.html)
- [NHS API Catalogue - Mental Health](https://digital.nhs.uk/developer/api-catalogue/Taxonomies/stu3/Taxonomies/mental-health)
- [NHS Transfer of Care APIs](https://digital.nhs.uk/services/transfer-of-care-initiative/apis)
- [NHS England Interoperability Standards](https://www.england.nhs.uk/long-read/interoperability/)
- [NHS API Guide 2025](https://6b.health/insight/nhs-api-guide-year/)

---

## Next Steps

1. Contact Trust IT to confirm SystmOne version and integration options
2. Review existing Trust integrations with SystmOne
3. Assess HSCN network access requirements
4. Begin informal discussions with TPP about integration scope
5. Prepare DIPA documentation for Max+ version

---

*This document is for planning purposes. Actual integration requires formal approval processes with NHS Digital and TPP.*
