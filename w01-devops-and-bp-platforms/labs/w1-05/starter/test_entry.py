"""Test entry point used by the facilitator's tooling: runs `python3 ../lab.py test --variant core`. Excluded from the build context."""
import subprocess, sys
from pathlib import Path
lab = Path(__file__).resolve().parents[1] / "lab.py"
sys.exit(subprocess.call([sys.executable, str(lab), "test", "--variant", sys.argv[1] if len(sys.argv) > 1 else "core"]))
