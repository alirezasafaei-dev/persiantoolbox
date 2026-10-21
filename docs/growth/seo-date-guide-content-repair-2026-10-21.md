# Date-difference guide content repair

## Confirmed problem

The published `calculate-date-difference-for-projects-and-hr` guide used the
scheduled batch's generic file-conversion prose. Its date-calculation example
discussed copying files and degrading output quality, without calculating a
date interval. Its CTA linked to the category rather than the calculator.

The generating source must be corrected along with the published Markdown;
editing only the generated file would let a later materialization restore the
problem. Other articles in the batch are a separate editorial backlog.

## Scoped implementation

- Keep the existing title, URL, publication date, author and cover.
- Replace the irrelevant prose with reproducible calendar examples.
- Explain elapsed days, inclusive counting, approximate months and years,
  and the calculator's lack of a business-day/holiday calendar.
- Link directly to the calculator and relevant existing tools.
- Preserve the generated output of the other 29 articles.
- Record the actual editorial revision date without changing the original
  publication date.

## Verification

Verify the examples against the existing date logic, regenerate the corrected
article from its source, check Markdown rendering and internal link targets,
run the focused blog/calendar contracts, formatting and security checks, and
obtain independent review before publishing the branch. Keep API exports,
analytics figures and operational evidence outside the repository.

This is an editorial correctness improvement. It does not establish why a
particular search result has a low CTR, or promise a ranking or traffic change.
Measure any subsequent change only after an approved release and sufficient
new search data, with the other releases and traffic mix recorded.

## Calculator input follow-up

The same calculator's UI parser used `parseInt` on numeric date fields. Six
regression cases reproduced fractional years, months and days being silently
truncated into valid dates, in both Jalali and Gregorian modes. The scoped
parser correction requires nonempty integer parts before calendar validation;
it preserves the existing invalid-date message and calculation behavior for
valid input. It does not change the shared calendar conversion algorithms.

## Continuation

After this deliverable, prioritize the remaining templated articles using real
search demand and verified content defects. Do not mass-rewrite, republish,
change publication dates, request indexing, or buy links as an automatic
response to low CTR. The existing 28-day measurement window ends on October 31;
wait for its reporting data to finish processing before comparing it.
