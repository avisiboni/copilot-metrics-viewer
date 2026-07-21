---
title: How AI collaboration metrics work
---

# How AI collaboration metrics work

This guide explains in plain language how the dashboard measures whether a developer works well with Copilot — what is counted, what an interaction is, how usage patterns are built, and what the scores mean.

:::caution Not an HR metric
These metrics are for **coaching and enablement**, not performance ranking, bonuses, or HR decisions.
They also do **not** measure code quality — only how a developer collaborates with AI.
:::

## The idea in short

The system does not ask “is this a good developer?”  
It asks: **how well do they work with Copilot?**

- How often they prompt AI  
- How many suggestions they get  
- How many they actually **keep**  
- How that looks **relative to the rest of the org**

---

## 1. Building blocks (from GitHub)

| Metric | Plain meaning |
|--------|----------------|
| **Interactions** | How many times the developer sent a prompt to Copilot |
| **Generations** | How many suggestion / output events were produced |
| **Acceptances** | How many suggestions they kept / applied |
| **Lines of code** | Lines added/deleted via Copilot |
| **Chat / Agent / CLI** | Which surfaces they used |

Derived rates include:

| Derived metric | Formula | Meaning |
|----------------|---------|---------|
| **Acceptance rate** | acceptances ÷ generations × 100 | Share of suggestions kept |
| **Generations per interaction** | generations ÷ interactions | Generations per prompt |
| **LoC per interaction** | loc ÷ interactions | Code yield per prompt |
| **LoC per acceptance** | loc ÷ acceptances | Average size kept per accept |

Then compared to the org:

- **P25** — lower quartile  
- **Median (P50)** — typical  
- **P75** — upper quartile  

“High” / “low” is always **relative to your org** in the selected date range.

---

## 2. What is an interaction?

An **interaction** is how many times the developer **actually sent a prompt to Copilot**.

This is GitHub’s `user_initiated_interaction_count`.

### What counts

- Sending a Chat message  
- A request in Agent / Edit  
- Any explicit prompt sent to the model  

### What does not count

- Only opening the chat panel  
- Switching modes (Ask / Edit / Plan / Agent)  
- Keyboard shortcuts that open the UI  
- Configuration changes  

### Same chat / same session?

**Yes — every message / every prompt**, even inside the same chat window or session.

It is **not** “new chat window” and **not** “new session”.

#### Example

In the same chat:

1. “Write a function…”  
2. “Now add tests…”  
3. “Fix the bug…”  

→ **3 interactions**, not 1.

Open chat and send nothing → **0**.

### Interaction ≠ generation

One interaction can produce **multiple generations**.  
So interactions and generations measure different things:

| Metric | Asks |
|--------|------|
| Interactions | How often they **prompted** AI |
| Generations | How many **outputs** Copilot produced |
| Acceptances | How many they **kept** |

---

## 3. Usage patterns

A **usage pattern** is one label for *how* someone uses Copilot, not just *how much*.

:::info Not from GitHub
Usage patterns are **computed in the dashboard** (heuristics), not returned as-is from GitHub’s API.
:::

### How classification works

1. Take each user’s interactions, generations, acceptances, LoC  
2. Compare to the org (P25 / median / P75)  
3. Apply rules in order — **first match wins**  
4. If nothing matches → **balanced**

### Patterns with examples

Assume org medians roughly: ~40 interactions, ~80 generations, ~45% acceptance, ~200 LoC.

#### Insufficient data

Too little activity to classify confidently.

**Example:** 1 message, 2 generations, 10 LoC.

#### Underuse

Almost idle seat.

**Example:** 2 interactions, 3 generations, 5 LoC — all below P25.

#### Light user

Some use, below typical peers.

**Example:** 12 interactions, 20 generations, 40 LoC.

#### Selective accepter

Keeps a **high share** of suggestions, but at **low volume**.

**Example:** 15 interactions, 20 generations, 16 acceptances → **80%** acceptance, 60 LoC.

#### Completion-first

Mostly **Tab / inline**, less chat.

**Example:** only 10 interactions but 400 LoC kept — high LoC per interaction.

#### Active reviewer

Prompts a lot, keeps little.

**Example:** 120 interactions, 150 generations, **20%** acceptance.

#### Efficient adopter ✅

Classic “works well with AI”.

**Example:** 50 interactions, 90 generations, 70 acceptances → **~78%** acceptance, 250 LoC.

#### Volume adopter ✅

Keeps a lot **and** adds a lot of code.

**Example:** 600 LoC (above P75), 100 acceptances (above median).

#### High try, low keep ⚠️

Tries a lot, keeps little.

**Example:** 200 generations (above P75), **18%** acceptance.

#### Power user ✅

Heavy use + Chat or Agent.

**Example:** 700 LoC, 180 generations, and `used_chat` or `used_agent`.

#### Balanced

No extreme pattern — near org medians.

### Quick comparison

| Pattern | Prompts AI | Keeps suggestions | Code volume | Meaning |
|---------|------------|-------------------|-------------|---------|
| Efficient | Medium | High | Reasonable | Strong AI fit |
| Power | High | High | High + Chat/Agent | Deep adoption |
| Volume | High | High | Very high | Heavy quantity adoption |
| Selective | Low | High | Low | Careful chooser |
| Completion-first | Low (prompts) | — | High via Tab | Mostly inline |
| Active reviewer | High | Low | — | Explores a lot, keeps little |
| High try low keep | High | Very low | High attempts | Poor fit |
| Underuse / Light | Low | — | Low | Barely uses |

See also: [Usage patterns](./usage-patterns).

---

## 4. Two scores

### Engagement score (0–100)

How busy with Copilot vs the busiest peer:

```text
(interactions + generations + acceptances) ÷ cohort max × 100
```

Volume only — high engagement can still be ineffective.

### Effectiveness / quality score (0–100)

Main “works well with AI” score used for **Top 5** cards.

Rough construction:

1. Pattern base score  
2. Blend with acceptance percentile, acceptance rate, activity  
3. Penalty for high volume + weak acceptance  
4. Volume multiplier so tiny high-acceptance users don’t win  
5. Clamp 0–100  

---

## 5. Coaching tag + confidence

| Tag | Meaning |
|-----|---------|
| **productive** | Strong AI fit |
| **building** | Learning path |
| **mixed** | Mixed signals |
| **high_volume_low_fit** | Lots of try, little keep |
| **idle** | Almost unused |
| **unknown** | Not enough data |

Confidence from total activity (interactions + generations + acceptances):

| Level | Threshold |
|-------|-----------|
| High | ≥ 25 |
| Medium | 10–24 |
| Low | &lt; 10 |

---

## 6. AI Adoption phase (0–3)

This measures **which AI surfaces** they adopted — not keep-rate:

| Phase | Meaning |
|-------|---------|
| **0** | No cohort |
| **1 — Code first** | Mostly completions / IDE |
| **2 — Agent first** | One agent surface |
| **3 — Multi-agent** | Multiple agent surfaces |

Complementary views:

| Question | Metric |
|----------|--------|
| *Which surfaces?* | AI Adoption Phase |
| *How well do they keep/use?* | Usage pattern + effectiveness score |

---

## 7. What “good” looks like

Healthy signal =

**org-relative high acceptance  
+ productive pattern  
+ high effectiveness score  
+ real activity**  
(not just experiments with low keep)

---

## Links

- [Usage patterns](./usage-patterns)  
- [Users](./users)  
- [User usage detail dialog](./ui-reference/user-usage-detail-dialog)  
- [AI adoption cohorts](./ui-reference/ai-adoption-cohorts)  
- [Usage & billing](./usage-billing)
