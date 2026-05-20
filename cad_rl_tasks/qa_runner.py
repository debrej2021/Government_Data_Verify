"""
8-rollout QA runner for CAD RL training tasks.

Usage:
    ANTHROPIC_API_KEY=sk-... python3 qa_runner.py [--task TASK_ID] [--rollouts 8]

For each rubric item this script:
  1. Sends the task images + prompt to claude-opus-4-7 (vision)
  2. Asks the model to grade pass/fail for each rubric item
  3. Repeats N times and records pass counts
  4. Writes results back into the task JSON

Requirements:
    pip install anthropic
"""

import os
import sys
import json
import base64
import argparse
import time
from pathlib import Path

try:
    import anthropic
except ImportError:
    print("ERROR: pip install anthropic")
    sys.exit(1)

TASKS_DIR = Path(__file__).parent / "tasks"
DRAWINGS_DIR = Path(__file__).parent / "drawings"
MODEL = "claude-opus-4-7"


def load_image_b64(path: Path) -> str:
    with open(path, "rb") as f:
        return base64.standard_b64encode(f.read()).decode()


def build_content(task: dict) -> list:
    content = []
    for inp in task["inputs"]:
        img_path = (DRAWINGS_DIR / Path(inp["path"]).name).resolve()
        if not img_path.exists():
            raise FileNotFoundError(f"Drawing not found: {img_path}")
        content.append({
            "type": "image",
            "source": {
                "type": "base64",
                "media_type": "image/png",
                "data": load_image_b64(img_path),
            },
        })
        content.append({"type": "text", "text": f"[Image: {inp['description']}]"})
    content.append({"type": "text", "text": task["prompt"]})
    return content


def grade_response(client, task: dict, model_answer: str) -> dict[str, bool]:
    """Ask the grader model to evaluate each rubric item against the answer."""
    rubric_text = "\n".join(
        f"- {r['id']}: {r['item']}" for r in task["rubric"]
    )
    grader_prompt = f"""You are a strict engineering rubric grader. You will be given:
1. A CAD drawing task prompt
2. The correct answer summary
3. A model's answer
4. A rubric with binary items

Grade each rubric item as PASS or FAIL based solely on whether the model's answer satisfies it.
Be strict: if the item requires a specific value or identification, a vague answer fails.

TASK PROMPT:
{task['prompt']}

CORRECT ANSWER SUMMARY:
{task['correct_answer_summary']}

MODEL'S ANSWER:
{model_answer}

RUBRIC ITEMS:
{rubric_text}

Respond in JSON only, with this exact format:
{{"grades": {{{', '.join(f'"{r["id"]}": "PASS" or "FAIL"' for r in task["rubric"])}}}}}
"""
    resp = client.messages.create(
        model=MODEL,
        max_tokens=512,
        messages=[{"role": "user", "content": grader_prompt}]
    )
    raw = resp.content[0].text.strip()
    start = raw.find('{')
    end = raw.rfind('}') + 1
    grades_obj = json.loads(raw[start:end])
    return {k: v == "PASS" for k, v in grades_obj["grades"].items()}


def run_task_qa(client, task_path: Path, n_rollouts: int = 8) -> dict:
    with open(task_path) as f:
        task = json.load(f)

    print(f"\n{'='*60}")
    print(f"Task: {task['task_id']} -- {task['title']}")
    print(f"Rubric items: {len(task['rubric'])}")
    print(f"Running {n_rollouts} rollouts with {MODEL}...")

    pass_counts = {r["id"]: 0 for r in task["rubric"]}
    content = build_content(task)

    for rollout in range(1, n_rollouts + 1):
        print(f"  Rollout {rollout}/{n_rollouts}...", end=" ", flush=True)
        try:
            resp = client.messages.create(
                model=MODEL,
                max_tokens=600,
                messages=[{"role": "user", "content": content}]
            )
            model_answer = resp.content[0].text.strip()
            grades = grade_response(client, task, model_answer)
            for rid, passed in grades.items():
                if passed:
                    pass_counts[rid] += 1
            passed_ids = [k for k, v in grades.items() if v]
            print(f"PASS: {passed_ids}")
        except Exception as e:
            print(f"ERROR: {e}")
        time.sleep(1.0)

    print(f"\nPass counts (out of {n_rollouts}):")
    warnings = []
    for r in task["rubric"]:
        rid = r["id"]
        pc = pass_counts[rid]
        if pc == 0:
            status = "ALWAYS FAILS (no signal)"
        elif pc == n_rollouts:
            status = "ALWAYS PASSES (no signal)"
        else:
            status = "Mixed (learning signal)"
        print(f"  {rid}: {pc}/{n_rollouts}  {status}")
        if pc == n_rollouts:
            warnings.append(f"{rid} always passes -- consider harder framing")

    task["qa_status"] = {
        "rollouts_completed": n_rollouts,
        "model_used": MODEL,
        "pass_counts_per_rubric": pass_counts,
        "warnings": warnings,
    }
    with open(task_path, "w") as f:
        json.dump(task, f, indent=2)
    print(f"\nResults written to {task_path.name}")
    return pass_counts


def main():
    parser = argparse.ArgumentParser(description="CAD RL Task QA Runner")
    parser.add_argument("--task", help="Run only this task ID (e.g. CAD-RL-001)")
    parser.add_argument("--rollouts", type=int, default=8)
    args = parser.parse_args()

    api_key = os.environ.get("ANTHROPIC_API_KEY")
    if not api_key:
        print("ERROR: ANTHROPIC_API_KEY environment variable not set.")
        sys.exit(1)

    client = anthropic.Anthropic(api_key=api_key)

    task_files = sorted(TASKS_DIR.glob("task_*.json"))
    if args.task:
        task_files = [f for f in task_files if args.task in f.read_text()]
        if not task_files:
            print(f"No task file found containing ID '{args.task}'")
            sys.exit(1)

    all_results = {}
    for tf in task_files:
        try:
            results = run_task_qa(client, tf, n_rollouts=args.rollouts)
            all_results[tf.name] = results
        except FileNotFoundError as e:
            print(f"SKIP {tf.name}: {e}")

    print("\n" + "="*60)
    print("QA COMPLETE")
    print("="*60)
    for task_file, counts in all_results.items():
        print(f"\n{task_file}:")
        for rid, pc in counts.items():
            bar = "#" * pc + "." * (args.rollouts - pc)
            print(f"  {rid}: [{bar}] {pc}/{args.rollouts}")


if __name__ == "__main__":
    main()
