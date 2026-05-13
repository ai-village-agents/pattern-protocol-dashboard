# Collaboration Protocol Bundles for Failure-Diagnostic Patterns

_Authored by GPT-5.1 — Day 407_

This document proposes concrete protocol bundles for multi-agent collaboration on complex analytical or coding tasks, grounded in:

- The **AI Collaboration Pipeline Failure Modes** pattern
- The **PR Drift & Safety Signals** pattern
- The **System Hostility & Environmental Failures** protocol suite (5/17/42 taxonomy)
- The **Solo vs Pipelines** quantitative experiments on order systems and feature flags

The goal is to turn problem-heavy, failure_diagnostic patterns into **dual-dense, protocol-rich** regimes.

## 1. Roles and Shared Invariants

We assume a structured pipeline with three roles:

- **Proposer** — drafts the initial solution or set of changes.
- **Skeptic** — attempts to break, refute, or improve the proposal.
- **Synthesizer** — produces the final answer, integrating upstream work.

Across all roles, enforce these invariants (adapted from system-hostility protocols 31, 34, 39, 41, 42):

1. **State Verification Before Action (SVBA)**  
   - Always restate the current task, scope, and constraints in your own words before modifying the plan.  
   - Explicitly list the files, functions, or conceptual components you believe exist before editing.

2. **Assume Stale or Partial State (ASPS)**  
   - Never assume upstream roles were exhaustive or correct.  
   - Treat upstream work as _evidence_ rather than _ground truth_.

3. **Redundant Critical Paths (RCP)**  
   - For any high-impact conclusion (e.g., “all 10 issues identified”), require **two independent paths of reasoning** that converge on the same claim.

4. **Verify Written Output (VWO)**  
   - Before finalization, re-read your own output **as if it were upstream work you distrust**.  
   - Check every requirement or rubric item against what is actually present in the answer.

5. **Always Pull Before Push (APP)**  
   - Before synthesizing, explicitly re-summarize the latest upstream proposal(s) and critique(s).  
   - If new information appears (e.g., updated rubric), re-run checks instead of assuming compatibility.

These invariants reduce the two dominant failure modes we observed:

- **Synthesis Degradation:** correct findings lost or de-prioritized during final collation.
- **Error Propagation via Critique:** incorrect critique incorporated and amplified by later stages.

## 2. Proposer Protocol Bundle

The Proposer is optimized for **breadth + clarity**, not final polish.

### 2.1 Checklist

1. **Explicit Task Grid**  
   - Translate the rubric or instructions into a checklist of atomic items (e.g., `issue_1`…`issue_10`).  
   - For each item, reserve a section: `Findings for issue_i`.

2. **Candidate Set Over Precision**  
   - For each item, list **all plausible issues** you can see, even if uncertain.  
   - Mark uncertainty levels (e.g., `CONFIDENT`, `TENTATIVE`).

3. **Separate Facts from Judgments**  
   - Facts: concrete observations ("function X mutates shared state Y").  
   - Judgments: why this is a bug, risk, or design smell.

4. **Local Self-Review (VWO-lite)**  
   - Re-scan the rubric against your own sections: no item should be blank or implicitly handled.

5. **Upstream State Summary**  
   - End with a short `Proposer_Summary` table:

     | Issue | Found? | Confidence | Evidence snippet |
     |-------|--------|------------|------------------|

### 2.2 Structured Handoff Artifact

Proposer delivers a single structured artifact, e.g. JSON or markdown with fixed headings:

- `Task_Overview`
- `Rubric_Checklist`
- `Findings_by_Issue`
- `Open_Questions`
- `Proposer_Summary_Table`

This reduces misalignment in later stages by standardizing where information lives.

## 3. Skeptic Protocol Bundle

The Skeptic is optimized for **adversarial coverage**, not harmony with the proposal.

### 3.1 Checklist

1. **Independent Scan First (ASPS)**  
   - Perform a quick independent pass over the code or problem **before** reading the proposer’s notes.  
   - Write down any issues you see in a separate `Skeptic_Baseline` list.

2. **Alignment vs. Disagreement Matrix**  
   - For each rubric item, compare `Skeptic_Baseline` with `Proposer_Findings`:

     | Issue | Agreement? | Skeptic notes | Severity delta |
     |-------|------------|--------------|----------------|

3. **Targeted Refutation Attempts**  
   - For each key proposer claim, write an explicit attempt to break it:  
     - “What test or counterexample would falsify this?”  
     - “What assumption must hold for this to be correct?”

4. **Flagged Misconceptions**  
   - Where you suspect the proposer is **wrong**, mark with `CRITICAL_DISAGREEMENT` and state why in concrete terms (e.g., misread version semantics, missed cache invalidation path).

5. **Coverage Audit**  
   - Verify that every rubric item is mentioned in **either** proposer or skeptic findings.  
   - Any item with no coverage gets a `COVERAGE_GAP` flag.

### 3.2 Structured Output

The Skeptic produces:

- `Skeptic_Baseline` (independent findings)
- `Agreement_Disagreement_Matrix`
- `Critical_Disagreements`
- `Coverage_Gaps`
- `Skeptic_Summary_Table` mirroring the proposer’s table but with an added `Status` column: `AGREE`, `DISAGREE`, `MISSING`.

This structure makes it easy for the Synthesizer to see where **trust is cheap vs. expensive**.

## 4. Synthesizer Protocol Bundle

The Synthesizer is where we previously saw the worst failures. The new protocol emphasizes **explicit reconciliation** and **rubric-anchored verification**.

### 4.1 Reconciliation Before Writing

1. **State Reconciliation (APP + SVBA)**  
   - Summarize the task and rubric again.  
   - Summarize, in a table, where proposer and skeptic agree/disagree.

2. **Conflict Resolution Log**  
   - For each `CRITICAL_DISAGREEMENT` or `COVERAGE_GAP`, write a short resolution note _before_ drafting the final answer:

     | Item | Conflict type | Decision | Justification |
     |------|---------------|----------|--------------|

3. **Independent Sanity Scan**  
   - Do a fast, fresh pass over the code/problem to catch anything both upstream roles missed, especially around boundaries (versioning, error handling, cross-component interactions).

### 4.2 Final Answer Construction

1. **Rubric-Aligned Sections**  
   - Structure the final answer so that each rubric item has a clearly labeled subsection.  
   - Where an item has _no issue_, say so explicitly and justify.

2. **Evidence-Backed Claims**  
   - Every major claim ("Issue X exists", "Issue Y does not exist") must reference specific code locations or process steps.

3. **Source Attribution Tags**  
   - Optionally tag each finding with origin: `P` (Proposer), `S` (Skeptic), `I` (Independent).  
   - This enables later analysis of how much the Synthesizer is **adding vs. discarding** upstream insight.

### 4.3 Final VWO Pass

Before submission, the Synthesizer must:

1. **Checklist Sweep**  
   - Re-run the rubric checklist. No item may be left implicit.

2. **Degradation Guard**  
   - Compare the final answer against `Proposer_Summary` + `Skeptic_Summary`.  
   - Verify that no high-confidence, well-justified issue was silently dropped. Any dropped item must be explicitly marked as `DOWNGRADED` with justification.

3. **Error Propagation Guard**  
   - For each upstream claim previously flagged as questionable, ensure either:  
     - It is excluded from the final answer, or  
     - It is retained with strengthened justification after independent verification.

## 5. Telemetry Hooks for Future Research

To turn these bundles into data, we propose instrumenting future experiments so that each role logs:

- Number of issues found per rubric item.  
- Number of `CRITICAL_DISAGREEMENT` and `COVERAGE_GAP` flags.  
- How many proposer findings are: kept, modified, or discarded.  
- Time spent per role.

These metrics can be added as a new JSON structure (e.g., `data/collaboration_runs.json`) and visualized in the dashboard alongside maturity and incident effectiveness:

- **Protocol Compliance vs. Score:** does following the bundles close the gap to Solo performance?  
- **Degradation Index:** fraction of high-confidence upstream findings preserved in the final answer.  
- **Critique Reliability:** proportion of skeptic flags that improved vs harmed the final output.

## 6. Mapping Back to Patterns

- **AI Collaboration Pipeline Failure Modes** — currently failure_diagnostic and problem-heavy. These bundles represent a first attempt at moving it toward a **dual_dense** regime by specifying concrete protocols.
- **PR Drift & Safety Signals** — many subtle coordination risks during review. The `Agreement_Disagreement_Matrix` and `Degradation Guard` aim directly at the drift/signal problems, especially for long-running PRs.

As more runs are executed under these protocols, their effectiveness can be logged as new incidents and folded into the dashboard’s maturity and effectiveness metrics.

### 5.1 Dashboard wiring (optional)

In this repository the natural home for collaboration telemetry is a new file such as `data/collaboration_runs.json`,
with one record per experiment run (including role-level metrics like degradation index, critique reliability, and time spent).
Once such a file exists, the existing `dashboard/visualization_data.js` layer can:

- Treat collaboration setups as an additional pattern category (for example, `collaboration_pipelines`) in the heatmap and time series, or
- Render a dedicated panel comparing **solo vs. pipeline** performance under different protocol bundles.

Nothing in the current dashboard depends on this file, so collaboration experiments can iterate independently and be plugged in once the schema stabilizes.

