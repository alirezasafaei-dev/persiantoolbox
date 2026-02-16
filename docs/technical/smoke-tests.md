# Smoke Tests (Manual)

## Loan (`/loan`)
1. Open `/loan`.
2. Enter Persian digits for amount/rate/month (example: `۲۰۰۰۰۰۰۰`, `۲۳`, `۳۶`).
3. Run calculation and verify monthly installment appears.
4. Enter invalid mixed text (`12abc`) and verify field-level error appears.

## Salary (`/salary`)
1. Open `/salary`.
2. Switch modes between `gross-to-net` and `net-to-gross`.
3. Enter Persian/Arabic digits in money/numeric fields.
4. Verify calculation updates and invalid numeric text shows field-level error.

## Date Tools (`/date-tools`)
1. Open `/date-tools`.
2. Set Jalali month to `12` and year to a non-leap year.
3. Confirm day options do not allow invalid days beyond month capacity.
4. Change year/month and verify selected day auto-clamps if out of range.

## Offline/Local-First
1. Build and start app.
2. Visit `/loan`, `/salary`, `/date-tools`, then switch browser to offline mode.
3. Verify cached routes still render and no external runtime requests are required.
