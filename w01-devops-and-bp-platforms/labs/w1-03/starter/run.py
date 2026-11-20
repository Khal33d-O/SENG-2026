"""Convenience entrypoint: delegates to ../code/training.py (one implementation, one exercise)."""
import runpy, sys
from pathlib import Path
sys.dont_write_bytecode = True
target = Path(__file__).resolve().parents[1] / "code" / "training.py"
sys.argv[0] = str(target)
runpy.run_path(str(target), run_name="__main__")
