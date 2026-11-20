"""Unit tests for the supplied parser and annotation interface (run: python3 -m unittest discover -s code/tests)."""
import sys, unittest
from pathlib import Path

sys.dont_write_bytecode = True
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
import training  # noqa: E402

DIFF = """diff --git a/service.ini b/service.ini
--- a/service.ini
+++ b/service.ini
@@ -1,4 +1,4 @@
 [deployment]
-notice = Welcome to the workshop.
-replicas = 1
+notice = Choose Reference treasure hunt.
+replicas = 2
 environment = training
"""


class ParserTests(unittest.TestCase):
    def test_base_configuration_is_valid(self):
        fields, errors = training.parse_ini(training.BASE_INI)
        self.assertEqual(errors, [])
        self.assertEqual(fields["replicas"], "1")

    def test_replicas_out_of_range(self):
        _, errors = training.parse_ini(training.BASE_INI.replace("replicas = 1", "replicas = 4"))
        self.assertIn("replicas must be an integer from 1 to 3", errors)

    def test_environment_must_stay_training(self):
        _, errors = training.parse_ini(training.BASE_INI.replace("= training", "= production"))
        self.assertIn("environment must stay training", errors)

    def test_syntax_error_reported(self):
        _, errors = training.parse_ini("notice = no section\n")
        self.assertTrue(errors and errors[0].startswith("syntax error"))


class AnnotationTests(unittest.TestCase):
    def test_changed_head_lines(self):
        self.assertEqual(training.changed_head_lines(DIFF, "service.ini"), [2, 3])

    def test_unchanged_file_has_no_lines(self):
        self.assertEqual(training.changed_head_lines(DIFF, "README.md"), [])


if __name__ == "__main__":
    unittest.main()
