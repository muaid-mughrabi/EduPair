import json
import argparse
from pathlib import Path

PLACEHOLDER = "..."  # Change to 'pass' or 'raise NotImplementedError()' if needed

def strip_solution_annotations(line: str) -> str:
    """Remove annotations but keep full code for solution version."""
    if "# HIDE-INLINE" in line:
        return line.replace("# HIDE-INLINE", "").rstrip()
    return (
        line.replace("# HIDE", "")
            .replace("# BEGIN HIDE", "")
            .replace("# END HIDE", "")
            .rstrip()
    )

def transform_for_student(line: str) -> str:
    """Convert annotated lines to student version placeholders."""
    if "# HIDE-INLINE" in line:
        code = line.split("# HIDE-INLINE")[0].rstrip()
        if "=" in code:
            var_name, _ = code.split("=", 1)
            return var_name.rstrip() + " = " + PLACEHOLDER
        else:
            return PLACEHOLDER  # fallback
    if "# HIDE" in line:
        indent = len(line) - len(line.lstrip())
        return " " * indent + PLACEHOLDER
    return line


def process_code_cell(source_lines, target="solution"):
    new_lines = []
    inside_hide_block = False
    block_lines = []
    block_indent = 0

    for line in source_lines:
        stripped = line.strip()

        if "# BEGIN HIDE" in stripped:
            inside_hide_block = True
            block_indent = len(line) - len(line.lstrip())
            block_lines = []
            continue

        if "# END HIDE" in stripped:
            inside_hide_block = False
            if target == "solution":
                new_lines.extend([strip_solution_annotations(l) + "\n" for l in block_lines])
            elif target == "student":
                new_lines.append(" " * block_indent + PLACEHOLDER + "\n")
            continue

        if inside_hide_block:
            block_lines.append(line)
            continue

        if target == "solution":
            new_lines.append(strip_solution_annotations(line) + "\n")
        elif target == "student":
            new_lines.append(transform_for_student(line.rstrip()) + "\n")

    return new_lines

def process_markdown_cell(source_lines, target="solution"):
    new_lines = []
    inside_hide_block = False

    for line in source_lines:
        if line.strip() == "<!-- BEGIN HIDE -->":
            inside_hide_block = True
            continue

        if line.strip() == "<!-- END HIDE -->":
            inside_hide_block = False
            if target == "student":
                new_lines.append(PLACEHOLDER + "\n")   # keep line structure
            continue

        if inside_hide_block:
            if target == "solution":
                new_lines.append(line)  # instructors see the hidden text
            # skip for student
            continue

        new_lines.append(line)          # ordinary line – keep for everyone

    return new_lines


def process_notebook(notebook_path: Path, output_path: Path, target: str):
    with notebook_path.open("r", encoding="utf-8") as f:
        nb = json.load(f)

    for cell in nb["cells"]:
        if cell["cell_type"] == "code":
            cell["source"] = process_code_cell(cell["source"], target)
        elif cell["cell_type"] == "markdown":
            cell["source"] = process_markdown_cell(cell["source"], target)

    output_path.parent.mkdir(parents=True, exist_ok=True)

    with output_path.open("w", encoding="utf-8") as f:
        json.dump(nb, f, indent=1)

    print(f"{target.capitalize()} version saved to: {output_path}")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Generate solution and student versions from a master notebook.")
    parser.add_argument("input", type=Path, help="Path to the master annotated notebook")
    parser.add_argument("--solution", type=Path, required=True, help="Output path for the solution version")
    parser.add_argument("--student", type=Path, required=True, help="Output path for the student version")
    args = parser.parse_args()

    process_notebook(args.input, args.solution, target="solution")
    process_notebook(args.input, args.student, target="student")
