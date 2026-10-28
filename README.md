<a href="https://github.com/baselissmail">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="assets/header-dark.svg">
    <img src="assets/header-light.svg" width="100%" alt="Basel Issmail. Tech lead at Kepler: SMART on FHIR, serverless AWS. I make healthcare systems talk to each other, and explain themselves when they don't. A heartbeat trace marks the career so far: 2016 Shamra search, 2017 Maids.cc ERP, 2021 PLATEAU 3D cities, 2023 Kepler EMRAY, 2026 smart-doctor, still beating.">
  </picture>
</a>

<p align="center"><samp>
  <a href="https://medium.com/@basel.issmail">medium</a> ·
  <a href="https://www.linkedin.com/in/basel-issmail">linkedin</a> ·
  <a href="https://x.com/Baselissmail">x</a> ·
  <a href="https://stackoverflow.com/users/8396204/basel-issmail">stack overflow</a> ·
  <a href="https://linktr.ee/basel.issmail">everything else</a>
</samp></p>

I'm a tech lead at [Kepler](https://www.kepler.team), where I lead engineering on [EMRAY](https://emray.health): a platform that lets health systems run digital-health tools inside the EHR, for clinicians, patients and the people who govern them. Ten years in, I care most about the parts that decide whether software actually works: sign-in flows, permissions, migrations, failure modes and the monthly bill. I like tools that tell you what's wrong in plain English, so I build them.

### Now

- **Launching [smart-doctor](https://github.com/baselissmail/smart-doctor)**, an open-source CLI that finds out why a SMART on FHIR login fails. v0.2 is out; next up is testing against the Epic and Oracle Health sandboxes.
- **Writing most days** on Medium about engineering judgment, reliability and working well next to AI.
- **Building [Glimby](https://glimby.app)** in the evenings: a gentle to-do app for adults with ADHD.

<sub>Updated October 2026.</sub>

## Featured

<a href="https://github.com/baselissmail/smart-doctor">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/baselissmail/smart-doctor/main/docs/images/banner-dark.png">
    <img src="https://raw.githubusercontent.com/baselissmail/smart-doctor/main/docs/images/banner-light.png" width="100%" alt="smart-doctor: why does this SMART on FHIR login fail? A bedside monitor shows the login as a heartbeat. Key, discovery, clock and assertion pass; the token request flatlines with 401 invalid_client; the most likely cause is that your kid is not in the JWKS the server knows about.">
  </picture>
</a>

EHR token endpoints answer almost every client mistake with the same `invalid_client`. **[smart-doctor](https://github.com/baselissmail/smart-doctor)** checks everything that can be checked from your side, runs the real login once and ranks the likely causes in plain English, with evidence and the fix. Your keys and secrets never leave your machine.

```bash
npx smart-doctor ui --demo    # a practice EHR that fails on purpose, in your browser
```

- Backend services (`private_key_jwt`, client secrets) and user sign-in (SMART App Launch with PKCE), with hints for Epic, Oracle Health, athenahealth and OpenEMR
- Built to be trusted: [OpenSSF Best Practices](https://www.bestpractices.dev/projects/16012) badge, npm provenance, Sigstore-attested binaries, a Scorecard workflow and property-based tests
- Runs in CI as a [GitHub Action](https://github.com/baselissmail/smart-doctor#nightly-monitoring) that catches expiring keys every night, and ships as a Claude Code plugin

## At Kepler · 2023 – now

EMRAY is three Angular apps (provider, patient and admin) on a serverless AWS back end: AppSync GraphQL, Lambda in TypeScript and Rust, DynamoDB and Cognito, provisioned with CDK and Terraform. I've written about 2,600 of the platform's 5,900 commits and lead its architecture and releases.

- **EHR integrations with 8 vendors**, including Epic, Oracle Health and athenahealth, over SMART on FHIR launch and backend services. HL7 v2 arrives through an MLLP gateway that acknowledges a message only once it's durably stored.
- **Permissions generated from the GraphQL schema** for all 226 operations, rolled out behind a shadow-mode authorizer that logs every would-be denial before it enforces anything.
- **Authorizers rewritten in Rust**, cutting cold starts from 906 ms to 56 ms and warm calls from about 100 ms to 6 ms.
- **AI Module Studio**: admins describe a tool in plain words, a model builds it, and it runs in a sandboxed iframe with governed EHR reads and SSRF-guarded network access. Bring your own Anthropic, Google or OpenAI key.
- **Patient questionnaires on FHIR SDC**, replacing a chatbot-based intake, plus telehealth video and camera-based vital signs.

## The workshop

Things I build on my own time, end to end: product, design, code and launch.

| | What it is | Built with |
|---|---|---|
| **[Glimby](https://glimby.app)** | A gentle, gamified to-do app for adults with ADHD. Brain-dump everything, get one clear next step, no streaks or guilt. AI is cost-capped and optional, so it works offline. | Next.js 16, React 19, Postgres, Drizzle, Better Auth, Playwright + axe |
| **[LinePilot](https://www.linepilot.app)** | A [Chrome extension](https://chromewebstore.google.com/detail/linepilot/pfgifepnciihbddbkbjopjbhkcppcobc) that guides your eyes line by line so you read faster and drift less. Sentence-aware (Unicode UAX #29) and fully keyboard-accessible. | TypeScript, Manifest V3, Vite, Vitest |
| **Dental Lab OS** | Case tracking for dental labs, in Arabic and English. Multi-tenant, with tenant isolation in Postgres row-level security. *In progress.* | React 19, Hono, tRPC, Postgres 18, Drizzle |
| **[Serendipity Studio](https://baselissmail.gumroad.com/l/xrvwdr)** | 75+ prompt templates with the creative constraints that make AI output interesting. | Vanilla JS |

## Before Kepler

- **Eukarya**, Japan · <sub>2021–23</sub><br>Front-end lead for [Re:Earth CMS](https://github.com/reearth/reearth-cms), the open-source CMS behind [PLATEAU VIEW 2.0](https://www.mlit.go.jp/plateau/): Japan's government-led 3D models of 100+ cities. Its most active committer while I was there, with 220+ commits.
- **dlimits**, Lebanon · <sub>2021–23</sub><br>Front ends for 15+ sites, including ICANN's. Took minbaladeh.world's performance grade from F to A on a store that went on to take $2M+ in orders.
- **Maids.cc**, UAE · <sub>2017–20</sub><br>Front-end lead for an Angular ERP used by a 5,000+ person company. Ran two teams, eight developers.
- **BISD, CLIC and Storex** · <sub>2016–18</sub><br>Built Shamra Jobs and Shamra Bazaar from scratch, set up a QA team, and cut 1.2 s off the load time of Shamra, an Arabic search engine.
- **Tishreen University** · <sub>2012–17</sub><br>BSc in Software Engineering, top 5%. My thesis generated the university's timetables with AI and was graded 98%, the year's best. ACM SCPC 2015 Extreme Programmers award.

## Latest writing

<!-- posts:start -->
- [The AI Future Where You Can’t Say No](https://medium.com/@basel.issmail/the-ai-future-where-you-cant-say-no-774142379e40) <sub>· Oct 27, 2026</sub>
- [“Just Add Login” Is Doing a Lot of Work in That Prompt](https://medium.com/@basel.issmail/just-add-login-is-doing-a-lot-of-work-in-that-prompt-eeb14c8a1ab4) <sub>· Oct 26, 2026</sub>
- [AI Took the Keyboard. You Kept the Blame.](https://medium.com/@basel.issmail/ai-took-the-keyboard-you-kept-the-blame-b269e872c3d9) <sub>· Oct 25, 2026</sub>
- [Google Authenticator Is a Tiny Distributed System](https://medium.com/codex/google-authenticator-is-a-tiny-distributed-system-46f2c4351706) <sub>· Oct 23, 2026</sub>
- [You Can’t Reinvent Yourself Every Tuesday](https://medium.com/@basel.issmail/you-cant-reinvent-yourself-every-tuesday-9afaff70acd0) <sub>· Oct 22, 2026</sub>
<!-- posts:end -->

<sub>Refreshed daily from my <a href="https://medium.com/@basel.issmail">Medium feed</a> by a <a href=".github/workflows/writing.yml">GitHub Action</a>.</sub>

## Toolbox

- **Every day:** TypeScript · Angular · React · Node.js · AWS (CDK, AppSync, Lambda, DynamoDB, Cognito, Step Functions) · Terraform · GitHub Actions
- **Healthcare:** FHIR R4 · SMART on FHIR · HL7 v2 · FHIR SDC · HIPAA
- **Also:** Rust · Next.js · Postgres · Playwright · Python

Arabic is my first language, I work in English, and I get by in Russian.

<p align="center"><sub><em>“Design systems as if every millisecond and every cent comes from your own wallet.”</em></sub></p>
