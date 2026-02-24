# Example: open a page, take a snapshot, search, and capture artifacts.
# Always refresh refs after major UI changes by adding SNAPSHOT steps.

OPEN|https://playwright.dev
SNAPSHOT
# Replace eX with refs from the latest snapshot output.
CLICK|eX
TYPE|Playwright
PRESS|Enter
SNAPSHOT
SLEEP|1
SCREENSHOT
PDF
