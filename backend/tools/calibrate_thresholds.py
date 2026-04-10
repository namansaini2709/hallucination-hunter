import json
import sys
from dataclasses import dataclass
from pathlib import Path


@dataclass
class Row:
    score: float
    issue: bool


def load_rows(path: Path) -> list[Row]:
    rows: list[Row] = []
    for line in path.read_text(encoding="utf-8").splitlines():
        line = line.strip()
        if not line:
            continue
        item = json.loads(line)
        score = float(item["score"])
        label = str(item["label"]).strip().lower()
        issue = label != "faithful"
        rows.append(Row(score=score, issue=issue))
    return rows


def evaluate(rows: list[Row], suspicious: float, safe: float) -> dict[str, float]:
    total = len(rows)
    issue_total = sum(r.issue for r in rows)
    low = [r for r in rows if r.score <= suspicious]
    safe_zone = [r for r in rows if r.score >= safe]
    judged = [r for r in rows if suspicious < r.score < safe]

    false_safe = sum(r.issue for r in safe_zone)
    false_safe_rate = (false_safe / issue_total) if issue_total else 0.0
    judge_rate = len(judged) / total if total else 0.0
    low_issue_precision = (sum(r.issue for r in low) / len(low)) if low else 0.0

    return {
        "suspicious_threshold": round(suspicious, 2),
        "safe_threshold": round(safe, 2),
        "false_safe_rate": round(false_safe_rate, 4),
        "judge_rate": round(judge_rate, 4),
        "low_issue_precision": round(low_issue_precision, 4),
    }


def main() -> int:
    if len(sys.argv) != 2:
        print("Usage: python tools/calibrate_thresholds.py <jsonl_file>")
        return 1

    input_path = Path(sys.argv[1])
    rows = load_rows(input_path)
    if not rows:
        print("No rows found.")
        return 1

    candidates: list[dict[str, float]] = []
    for suspicious_i in range(20, 81):
        suspicious = suspicious_i / 100
        for safe_i in range(suspicious_i + 1, 96):
            safe = safe_i / 100
            metrics = evaluate(rows, suspicious, safe)
            candidates.append(metrics)

    top = sorted(
        candidates,
        key=lambda m: (
            m["false_safe_rate"],
            -m["low_issue_precision"],
            m["judge_rate"],
        ),
    )[:10]

    print("Top threshold pairs (lower false_safe_rate is best):")
    for item in top:
        print(json.dumps(item))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
