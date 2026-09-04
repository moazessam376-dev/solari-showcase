# Posts for solari-ci (draft, no em dashes)

## X post (main tweet, under 280 chars)

I built a CI right-sizing agent on @getsolari.

solci runs your GitHub Actions job on Solari microVMs at 1, 2, 4 and 8 vCPU and gives you the speed vs cost curve.

My typecheck job: 2 vCPU, 48s, $0.0012/run. GitHub: $0.010/run.

Repo + demo below. @harrychow_

## X reply 1 (the evidence)

Real numbers, not vibes:

Gym-App typecheck: 67s at 1 vCPU, 48s at 2, 45s at 4. solci said "use 2 vCPU", 53% of the 4 vCPU cost. GitHub number is the private-repo rate, billed per minute rounded up.

crosstalk tests: 191s at 1 vCPU, 197s at 2. Not CPU bound. solci told me to stop paying for cores.

[attach gym-app.png]

## X reply 2 (how)

How it works:
- pulls your workflow and run history with gh
- boots one microVM per size (1s boot)
- runs the steps natively, shims for setup-node/python/uv/pnpm/bun
- per-step timings, findings, a recommendation
- always deletes the sandboxes

Inspired by Blacksmith's [code]smith CI Tuning.

## X reply 3 (links)

Code: https://github.com/moazessam376-dev/solari-ci
Showcase: https://moazessam376-dev.github.io/solari-showcase/

Things I learned about Solari sandboxes while building it: vCPUs hot-plug 1-15s after boot, exec has a 28s cap, no Docker, 1s boot. All in the README.

## Discord post (Solari server, showcase channel)

**solci: right-size a GitHub Actions job with evidence, built on Solari sandboxes**

Hey all. I built a small CI agent on Solari this week. You give it a repo and a job, it runs that job on Solari microVMs at 1, 2, 4 and 8 vCPU, and hands back the speed vs cost curve, per-step timings, a recommendation, and static findings (missing caches, unpinned actions, no timeouts, that kind of thing).

Real result on one of my repos: typecheck job went 67s -> 48s -> 45s at 1/2/4 vCPU. solci recommended 2 vCPU at $0.0012 per run. The same job on GitHub costs $0.010 per run at the private-repo per-minute rate (39s rounds up to one minute). On another repo it showed the test job is not CPU bound at all, so 1 vCPU is the right size.

It is inspired by Blacksmith's [code]smith CI Tuning, just done with real measurements on real microVMs instead of run history alone.

Repo: https://github.com/moazessam376-dev/solari-ci
Showcase: https://moazessam376-dev.github.io/solari-showcase/
Demo GIF is in the README.

Sandbox facts I learned on the way, in case they help anyone: cpu/memMb are honored up to 16 vCPU / 16 GB but the extra vCPUs hot-plug 1-15s after boot, exec has a ~28s wall-clock cap so long steps need nohup + polling, HOME is unset, about 2.2 GB of disk, no Docker. Boot is about 1s and a shallow clone is under a second.

Happy to run it against any public repo you want to see numbers for.

## Discord: bug and feedback ticket (Solari server, bugs or feedback channel)

**Platform findings from three days of building on Solari sandboxes**

Hey team. I spent the last three days building three tools on Solari (solari-lab, solari-playtest and solci, a CI right-sizing agent). Along the way I hit a set of platform behaviours that are not documented or that look like bugs. Full write up with repro steps, workarounds and what I would want from each one is here: https://github.com/moazessam376-dev/solari-ci/blob/main/docs/solari-findings.md

Short version:
1. exec calls get killed around 28s wall clock, no documented cap or async option.
2. exec request body has a size cap near 16KB, no clear error when you hit it.
3. nproc reports 1 right after boot, extra vCPUs hot-plug 1-15s later.
4. Polling GET /sandboxes/:id seems to refresh the idle timer, so sandboxes never expire while watched.
5. Starter plan caps concurrent sandboxes at 2, not mentioned in the error.
6. HOME is unset in a fresh sandbox, breaks npm, pip and git until you export it.
7. Default memory is max(2048MB, 1024MB per vCPU), not stated anywhere obvious.
8. Base sandbox has about 2.2GB free disk, too tight for some monorepos.
9. No Docker or container runtime, so services and container jobs cannot run.
10. Preview URL auth token lives in the query string and gets dropped by relative URL resolution.
11. Cloud browser CDP sessions drop after about 10 minutes, no documented TTL.
12. No GET /sessions endpoint, so leaked browser sessions cannot be found or killed.
13. WebGL is software rendered (Mesa llvmpipe), not documented.

The ones I would fix first are 4 and 12, because both leak billable resources when a client crashes. Happy to share exact request traces for any of them.

## Discord: support request for a US tester

**Looking for someone in the US to run solci against a repo they own**

I built solci for the intern challenge. It replays a GitHub Actions job on Solari microVMs at 1, 2, 4 and 8 vCPU and shows the speed curve, and the agent mode opens a PR with the change the numbers justify. I have only tested it from my own machine and my own repos, so I would like one run from a US connection on a repo I do not control before I post it more widely.

What it needs: a Solari key, a GitHub token, and a public repo with a Linux Node or Python job, no Docker services. Install is four commands and the README covers it: https://github.com/moazessam376-dev/solari-ci

The command to run is `solci run owner/repo --job <job> --cpu 1,2`, and it deletes its sandboxes when done. If you hit anything, paste the output here and I will fix it the same day. Thanks.
