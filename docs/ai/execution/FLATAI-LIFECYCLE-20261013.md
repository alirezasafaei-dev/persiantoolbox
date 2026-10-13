# Intended-host lifecycle acceptance — 2026-10-13

Public admissions remain disabled. This follow-up closes the controlled UFW
reload and Docker restart evidence gaps in the image release packet. It does
not authorize merge, production deployment or public enablement.

## Witness and bounded operation

On the authorized dedicated image host, an idle queue and the absence of Docker
live restore were checked before maintenance. Controlled host IPv4 and IPv6
listeners were positively reachable from the host; the non-root browser could
reach neither, while internal service DNS and proxy TCP remained reachable.
Both negative connections reported `ENETUNREACH`, consistent with the isolated,
address-free architecture rather than a claim that only firewall rules blocked
otherwise-routable traffic.

A bounded private operator fixture continuously sampled host-positive controls,
browser host-connection denials and DNS/proxy access. A host proc/cgroup observer
recorded browser absence during intentional shutdown, including when the Docker
API was unavailable. Docker API failure alone was not counted as browser absence.
The disruption window covered the entire automatic stack/TLS recovery, not just
the Docker restart command's return. Missing coverage or a gap above two seconds
failed acceptance. Separate before/after probes established working DNS/proxy
access. These are sampled witnesses, not a guarantee about every possible packet.

| Phase                       | Browser probes | Host-positive controls | Browser-absent observations | Successful browser-to-host connections |
| --------------------------- | -------------: | ---------------------: | --------------------------: | -------------------------------------: |
| Before UFW reload           |              7 |                      6 |                           0 |                                      0 |
| During guarded reload       |             58 |                     62 |                          37 |                                      0 |
| After reload                |              9 |                      7 |                           0 |                                      0 |
| Before Docker restart       |              7 |                      6 |                           0 |                                      0 |
| During restart and recovery |             62 |                    117 |                         138 |                                      0 |
| After recovery              |             12 |                     10 |                           0 |                                      0 |

All 155 browser probes had both host connections denied and service DNS/proxy
reachable. During reload, the largest gaps were 1.259 seconds for host-positive
controls and 0.524 seconds for isolation witnesses. During Docker restart and
recovery they were 0.273 and 0.545 seconds respectively. The complete operation
windows were approximately 16.9 and 29.6 seconds. Independent replay of the stored
coverage checks passed.

The existing guarded reload and Docker restart completed successfully. The image
stack and queue TLS listener recovered automatically; no manual stack/listener
start was needed for the accepted run. All running health checks passed, and
every unrelated container matched its original running state and restart policy.
Observer processes were removed and the controlled listeners closed.

## Failed preliminary fixture and correction

The first run passed the reload probes but incorrectly treated an activating
dependent stack as a failed recovery immediately when Docker returned. Its
fail-closed cleanup stopped the in-progress stack. Unrelated recovery also tried
to start a container before its network-namespace prerequisite. The operator
restored the original services and policies before repeating the test.

The fixture was corrected to wait for automatic unit readiness within a bounded
deadline, validate the entire recovery dependency graph before maintenance and
restore prerequisites first. Invalid graphs, observation gaps, async readiness
and original-state recovery received ten focused fixture regressions. Independent
review also tightened signal containment, window coverage and probe cleanup.
The final fixture review reported no remaining actionable P0/P1/P2. One bounded
corrected repeat passed. This was a test-orchestration correction; the production
image service source and runtime safeguards were not weakened or changed.

## Post-maintenance checks and remaining gates

Seven real Iran-to-image-queue TLS/least-privilege/negative-access probes passed
again, including trusted name/CA, rejected wrong trust/name, rejected plaintext,
and rejected other principals/databases. The worker key matched and heartbeat
was fresh. Three 25/30/35-second idle-pool probes also passed.

No provider jobs, provider contact, production website deploy, public routing
change or public enablement occurred. The production health/release identity
remained unchanged. Protected scripts, configuration, coordinates and detailed
operator evidence stay outside GitHub.

Provider public multi-user use/capacity, owner release approval, public-domain/CDN
acceptance and the ongoing monitoring/renewal arrangement remain publication
gates; the release packet defines their separate scope.
