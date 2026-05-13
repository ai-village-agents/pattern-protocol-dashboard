#!/usr/bin/env python3
"""
Extract pattern metadata from DeepSeek Pattern Archive for dashboard.
"""
import json
import os
import sys
from datetime import datetime

# Define pattern metadata structure
patterns = [
    {
        "pattern_id": "system-hostility-environmental-failures-2026-05",
        "pattern_name": "System Hostility & Environmental Failures",
        "category": "environmental",
        "discovery_date": "2026-05-13",
        "verification_status": "verified",
        "mitigation_protocols": 42,
        "failure_types": 19,  # 7 shell + 3 locks + 5 GUI + 1 process + 3 GitHub
        "quantification_level": "high",
        "cross_pattern_links": [
            "collaboration-pipeline-failures-2026-05",
            "pr-drift-safety-signals-2026-05", 
            "ghost-pr-resolution-phenomenon-2026-05",
            "third-party-cdn-dependency-failure-2026-05"
        ],
        "source_repository": "https://github.com/ai-village-agents/deepseek-pattern-archive",
        "source_commit": "308a47b"
    },
    {
        "pattern_id": "collaboration-pipeline-failures-2026-05",
        "pattern_name": "AI Collaboration Pipeline Failure Modes",
        "category": "process",
        "discovery_date": "2026-05-13",
        "verification_status": "verified", 
        "mitigation_protocols": 4,
        "failure_types": 4,
        "quantification_level": "high",
        "cross_pattern_links": [
            "system-hostility-environmental-failures-2026-05",
            "structural-determinism-cognitive-patterns-2026-04",
            "pr-drift-safety-signals-2026-05",
            "systematic-long-term-work-achievement-2026-05"
        ],
        "source_repository": "https://github.com/ai-village-agents/deepseek-pattern-archive",
        "source_commit": "308a47b"
    },
    {
        "pattern_id": "pr-drift-safety-signals-2026-05",
        "pattern_name": "PR Drift & Safety Signals",
        "category": "coordination",
        "discovery_date": "2026-05-13",
        "verification_status": "quantified",
        "mitigation_protocols": 6,
        "failure_types": 3,
        "quantification_level": "high",
        "cross_pattern_links": [
            "system-hostility-environmental-failures-2026-05",
            "ghost-pr-resolution-phenomenon-2026-05",
            "third-party-cdn-dependency-failure-2026-05"
        ],
        "source_repository": "https://github.com/ai-village-agents/deepseek-pattern-archive",
        "source_commit": "d5e89f4"
    },
    {
        "pattern_id": "ghost-pr-resolution-phenomenon-2026-05",
        "pattern_name": "Ghost PR Resolution Phenomenon",
        "category": "coordination",
        "discovery_date": "2026-05-13",
        "verification_status": "verified",
        "mitigation_protocols": 2,
        "failure_types": 1,
        "quantification_level": "medium",
        "cross_pattern_links": [
            "pr-drift-safety-signals-2026-05",
            "system-hostility-environmental-failures-2026-05"
        ],
        "source_repository": "https://github.com/ai-village-agents/deepseek-pattern-archive",
        "source_commit": "d5e89f4"
    },
    {
        "pattern_id": "structural-determinism-cognitive-patterns-2026-04",
        "pattern_name": "Structural Determinism Cognitive Patterns",
        "category": "cognitive",
        "discovery_date": "2026-04-01",
        "verification_status": "novel",
        "mitigation_protocols": 0,
        "failure_types": 4,
        "quantification_level": "medium",
        "cross_pattern_links": [
            "collaboration-pipeline-failures-2026-05",
            "ai-governance-safeguard-failure-modes-2026-03"
        ],
        "source_repository": "https://github.com/ai-village-agents/deepseek-pattern-archive",
        "source_commit": "d5e89f4"
    },
    {
        "pattern_id": "ai-governance-safeguard-failure-modes-2026-03",
        "pattern_name": "AI Governance Safeguard Failure Modes",
        "category": "governance",
        "discovery_date": "2026-03-01",
        "verification_status": "novel",
        "mitigation_protocols": 0,
        "failure_types": 4,
        "quantification_level": "medium",
        "cross_pattern_links": [
            "structural-determinism-cognitive-patterns-2026-04",
            "system-hostility-environmental-failures-2026-05"
        ],
        "source_repository": "https://github.com/ai-village-agents/deepseek-pattern-archive",
        "source_commit": "d5e89f4"
    },
    {
        "pattern_id": "systematic-long-term-work-achievement-2026-05",
        "pattern_name": "Systematic Long-Term Work Achievement",
        "category": "success",
        "discovery_date": "2026-05-13",
        "verification_status": "verified",
        "mitigation_protocols": 5,
        "failure_types": 0,  # This is a success pattern
        "success_types": 4,  # 4 success factors documented
        "quantification_level": "high",
        "cross_pattern_links": [
            "collaboration-pipeline-failures-2026-05"
        ],
        "source_repository": "https://github.com/ai-village-agents/deepseek-pattern-archive",
        "source_commit": "d5e89f4"
    },
    {
        "pattern_id": "third-party-cdn-dependency-failure-2026-05",
        "pattern_name": "Third-Party CDN Dependency Failure",
        "category": "environmental",
        "discovery_date": "2026-05-13",
        "verification_status": "verified",
        "mitigation_protocols": 2,
        "failure_types": 1,
        "quantification_level": "medium",
        "cross_pattern_links": [
            "system-hostility-environmental-failures-2026-05",
            "pr-drift-safety-signals-2026-05"
        ],
        "source_repository": "https://github.com/ai-village-agents/deepseek-pattern-archive",
        "source_commit": "d5e89f4"
    }
]

# Add today's date to all patterns
today = datetime.now().strftime("%Y-%m-%d")
for pattern in patterns:
    pattern["last_updated"] = today
    if "success_types" not in pattern:
        pattern["success_types"] = 0
    
# Save to data directory
os.makedirs("data", exist_ok=True)
output_path = "data/pattern_metadata.json"
with open(output_path, "w") as f:
    json.dump(patterns, f, indent=2)

print(f"Exported {len(patterns)} patterns to {output_path}")
print("\nPattern Categories Summary:")
categories = {}
for p in patterns:
    cat = p["category"]
    categories[cat] = categories.get(cat, 0) + 1

for cat, count in categories.items():
    print(f"  {cat}: {count} patterns")

print(f"\nTotal protocols: {sum(p['mitigation_protocols'] for p in patterns)}")
print(f"Total patterns with quantification: {sum(1 for p in patterns if p['quantification_level'] in ['high', 'medium'])}")
