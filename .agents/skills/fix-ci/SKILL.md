# fix-ci

## Goal
Diagnose and fix failing CI checks with minimal change scope.

## Steps
1. Reproduce failing checks locally with the same commands as CI.
2. Apply the smallest safe patch that makes checks pass.
3. Re-run impacted checks and record outcomes.
