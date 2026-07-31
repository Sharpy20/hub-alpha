# Clinical safety documents - which file is current

**The `.md` files in this folder are the source of truth.** They render directly into the
dev panel at `/dev-panel/documents`, so what a reviewer reads on the site is the file under
version control. There is no second copy to keep in step.

| Document | Current version | File |
|---|---|---|
| Hazard Log | wardHub-HL-003 **v0.3**, 31 Jul 2026, 27 hazards (26 open) | `DCB0129-Hazard-Log.md` |
| Clinical Risk Management Plan | wardHub-CRMP-001 **v0.2**, 31 Jul 2026 | `DCB0129-Clinical-Risk-Management-Plan.md` |
| Clinical Safety Case Report | wardHub-CSCR-001 **v0.2**, 31 Jul 2026 | `DCB0129-Clinical-Safety-Case-Report.md` |

## Do not send the .docx files

The three `SUPERSEDED-2026-03-23-*.docx` files are the original 23 March 2026 exports. They
have **not** been regenerated and they contain material that has since been withdrawn:

- a flat claim that wardHub "is not classified as a medical device under MHRA guidance",
  which nobody had assessed and which was withdrawn on 31 July 2026 (see HAZ-024)
- "14 hazards, all residual risks Low"
- the Light / Medium / Max / Max+ version model, removed from the product in early 2026

They are kept for traceability. Renamed so that nobody attaches one to an email by
accident. **If a Word copy is needed for a reviewer, regenerate it from the current `.md`
first.**

## Superseded hazard logs

`docs/nhs-ready/03b-clinical-safety-hazard-log.md` is the July extension log (HL-002). It
is marked SUPERSEDED at the top and is merged into HL-003. Do not use it.
