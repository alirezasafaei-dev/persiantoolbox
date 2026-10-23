# OCR guide capability alignment

## Confirmed problem

The scheduled guides `extract-persian-text-from-images-and-fix-ocr` and
`make-scanned-pdf-searchable-with-ocr` contain generic conversion prose and
category-level CTAs. They do not clearly distinguish selectable PDF text,
image OCR, and a PDF with an embedded searchable text layer. Instructions to
select the OCR language also do not match the current automatic `fas+eng`
configuration.

## Verified product boundary

- `/tools/persian-ocr` accepts images and produces text, clipboard output or TXT.
  It does not accept PDFs or create a PDF text layer.
- `/pdf-tools/convert/pdf-to-image` renders PDF pages to PNG or JPEG locally.
- `/pdf-tools/extract/extract-text` reads an existing PDF text layer; it does
  not perform OCR on scanned images.
- The writing studio can help with typography cleanup, but cannot establish
  that names, numbers or recognized words match the original document.

## Scoped correction

Update the two editorial sources and their generated Markdown together, using
the existing generator. Preserve original publication dates, authors, URLs and
covers, and leave the other 28 articles unchanged, including the date guide
already released through PR #242. Use the actual editorial revision date.

Explain the image-to-text workflow with verified direct links, manual comparison
against the original, mixed Persian/English limitations, and the distinction
between a searchable TXT result and a searchable PDF. Do not promise perfect
recognition, an unsupported export, or guaranteed offline operation.

Verify regeneration, capability contracts, Markdown rendering, links, publication
metadata, formatting and secret safety; obtain independent review. Private
analytics and operational reports stay outside Git. New production deployment
requires approval of its specific revision.

This content correction does not prove the cause of low CTR or predict a ranking
change. Measure later data separately from earlier releases and reporting lag.
