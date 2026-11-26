# PDF tool acceptance matrix

PASS applies to the cited fixture and build. NOT_RUN means there is no
identified receipt for that criterion. The [execution report](pdf-quality-seo-execution-2026-11.md)
contains the command results and limitations. The [completion ledger](pdf-completion-ledger.md)
tracks the current candidate. Final SHA acceptance remains NOT_RUN for all 17 tools.

| Tool             | Downloaded output and structural evidence                                            | Invalid input and recovery                                                 | Cancellation and resource check                                             | Observed privacy                                                               |
| ---------------- | ------------------------------------------------------------------------------------ | -------------------------------------------------------------------------- | --------------------------------------------------------------------------- | ------------------------------------------------------------------------------ |
| Merge PDF        | PASS · same-named form values, both attachments, order and Poppler render `e347a6ba` | PASS · over-limit selection, valid retry `4b649b42`                        | NOT_RUN cancel; PASS · near-48 MiB file on emulated viewport `4b649b42`     | PASS · no POST during near-limit fixture `4b649b42`                            |
| Split PDF        | PASS · actual ordered PDFs, form values and Poppler render `e347a6ba`                | PASS · three invalid inputs, valid retry `16a05a23`                        | PASS · cancel/retry `cb3b633e`; peak memory improvement NOT_RUN             | NOT_RUN for final event and document-network boundary                          |
| Compress PDF     | PASS · smaller rewrite, form values and Poppler render `e347a6ba`                    | NOT_RUN on a SHA identified here                                           | NOT_RUN cancel; PASS · 250 pages at near-48 MiB `4b649b42`                  | PASS · consent probe with no content markers `f31f9f95`                        |
| PDF to Image     | PASS · nonblank PNG using same-origin fallback font `4a056228`                       | PASS · three invalid inputs, valid retry `16a05a23`                        | NOT_RUN for final cancellation and canvas-limit evidence                    | NOT_RUN                                                                        |
| Image to PDF     | PASS · two-image conversion in standalone browser suite `11582c17`                   | NOT_RUN on a SHA identified here                                           | PASS · cancel and retry in combined suite `11582c17`; device limits NOT_RUN | NOT_RUN                                                                        |
| Decrypt PDF      | PASS · AES-256 and RC4 documents, text, form and page geometry `11582c17`            | PASS · wrong password and signature refusal on correct password `77f8901f` | NOT_RUN for final cancellation and peak resources                           | PASS · stubbed history payload and no password or title in requests `11582c17` |
| Encrypt PDF      | PASS · AES-256 and PDF.js password round-trip `77f8901f`                             | PASS · malformed input, retry and signature refusal `77f8901f`             | NOT_RUN                                                                     | NOT_RUN                                                                        |
| Add Watermark    | PASS · Persian and Latin placement `11582c17`                                        | NOT_RUN on a SHA identified here                                           | NOT_RUN                                                                     | PASS · stubbed allowlisted history payload `11582c17`                          |
| Rotate Pages     | PASS · relative rotation and range behavior `11582c17`                               | PASS · three invalid inputs, valid retry `16a05a23`                        | NOT_RUN                                                                     | NOT_RUN                                                                        |
| Reorder Pages    | PASS · order, forms and Poppler render `e347a6ba`                                    | PASS · three invalid inputs, valid retry `16a05a23`                        | NOT_RUN                                                                     | NOT_RUN                                                                        |
| Delete Pages     | PASS · retained widgets and Poppler render `e347a6ba`                                | PASS · three invalid inputs, valid retry `16a05a23`                        | NOT_RUN                                                                     | NOT_RUN                                                                        |
| Extract Pages    | PASS · selected form and Poppler render `e347a6ba`                                   | PASS · three invalid inputs, valid retry `16a05a23`                        | NOT_RUN                                                                     | NOT_RUN                                                                        |
| Add Page Numbers | PASS · visible position on cropped and rotated fixtures `11582c17`                   | PASS · three invalid inputs, valid retry `16a05a23`                        | NOT_RUN                                                                     | NOT_RUN                                                                        |
| Extract Text     | PASS · multilingual TXT and page markers `4a056228`                                  | PASS · empty extracted text recoverable `11582c17`                         | NOT_RUN                                                                     | NOT_RUN                                                                        |
| PDF to Text      | PASS · multilingual TXT without page markers `4a056228`                              | PASS · empty extracted text recoverable `11582c17`                         | NOT_RUN                                                                     | NOT_RUN                                                                        |
| Word to PDF      | FAIL · guide provides no DOCX conversion                                             | N/A · guide has no input                                                   | N/A · guide runs no conversion                                              | N/A · guide accepts no document                                                |
| PDF to Word      | PASS · editable multilingual DOCX text `4a056228`                                    | PASS · empty output rejected `11582c17`                                    | PASS · cancel in standalone suite `11582c17`; resource ceiling NOT_RUN      | NOT_RUN                                                                        |

## Surface and compatibility evidence

- **Chromium and Firefox** · PASS for the cases in the combined 14-spec
  suite at `11582c17`. The guide is a page check and the two Firefox CLS
  skips are N/A because those tests use a Chromium API.
- **WebKit** · PASS for the 67 executed suite cases at `0a0c9718`.
  Two CLS cases used a Chromium-only API. Final Candidate WebKit is NOT_RUN.
- **Mobile, RTL, light and dark, and accessibility** · PASS for initial
  page checks on all 17 routes at `4b649b42` in Pixel 7 emulation.
  Desktop picker keyboard access passed on all 16 interactive routes at
  `a6f7d52b`. End-to-end physical device coverage is BLOCKED on a
  provisioned device. Full interactive accessibility is NOT_RUN.
- **SEO** · PASS for HTTP, H1, self-canonical, unique title and description,
  parseable JSON-LD and index directives on all 17 routes at `0a0c9718`.
  Split no-JavaScript content passed at `cb3b633e`. Candidate-wide
  no-JavaScript crawl verification is NOT_RUN.
