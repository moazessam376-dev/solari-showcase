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
