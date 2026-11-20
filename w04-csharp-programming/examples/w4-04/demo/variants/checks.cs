// The full supplied single-spend checks: 13 assertions.
// Separate instances, first and last legal spends, exhaustion, repeated rejection, construction policy.
int passed = 0, total = 0;
void Check(string label, bool ok)
{
    total++;
    if (ok) passed++;
    Console.WriteLine($"{(ok ? "ok  " : "FAIL")} {label}");
}

var a = new GameSession(2);
var b = new GameSession(3);                       // a separate instance
Check("construction keeps 2", a.MovesRemaining == 2);
Check("first legal spend returns true", a.TrySpendMove());
Check("one move left", a.MovesRemaining == 1);
Check("last legal spend returns true", a.TrySpendMove());
Check("no moves left", a.MovesRemaining == 0);
Check("exhausted spend returns false", !a.TrySpendMove());
Check("zero retained after refusal", a.MovesRemaining == 0);
Check("repeated rejection returns false", !a.TrySpendMove());
Check("zero still retained", a.MovesRemaining == 0);
Check("separate instance unchanged", b.MovesRemaining == 3);
var zero = new GameSession(0);
Check("zero allowance: spend refused", !zero.TrySpendMove());
Check("zero allowance retained", zero.MovesRemaining == 0);
Check("negative allowance normalised to zero", new GameSession(-4).MovesRemaining == 0);

Console.WriteLine($"Assertions: {passed}/{total}");
return passed == total ? 0 : 1;
