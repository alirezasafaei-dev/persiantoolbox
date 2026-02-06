# Benchmarks

Baseline results on Apple M2 Pro / Node 20 (vitest bench):

```
toEnglishDigits   ~728,642 ops/s (±0.22%)
parseLooseNumber  ~509,214 ops/s (±0.28%) — slowest
numberToWordsFa ~1,331,035 ops/s (±0.36%) — fastest
```

Command: `pnpm bench`
