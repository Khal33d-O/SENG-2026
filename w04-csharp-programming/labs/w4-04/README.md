# W4.04 · Protect a session's remaining and reserved allowance

**Session:** W4.04 Classes and encapsulation · **Challenge:** 45 minutes (5 + 12 + 10 + 11 + 7)

A caller can put an object into an invalid state even when its constructor originally supplied valid values.
You construct a small C# session, compare public and protected properties, and write operations that
preserve related values. The project and assertion transport are supplied.

## Outcomes

* Describe fields, properties, constructors and access modifiers.
* Explain how encapsulation protects object invariants and prevents invalid state changes.
* Design a class with public operations that express its responsibility and protect its state.
* Write a class that exposes legal operations while protecting its internal state.

## Supplied and owned

| Supplied | You own |
|---|---|
| `Session.csproj`, `global.json`, `Program.cs` (assertion runner), `fixtures/session-cases.json` (10 cases, 98 assertions) | `GameSession.cs` — storage, constructor, `TryReserveMoves`, `TrySpendMoves` |
| `test_session.py` (behaviour + compiler probes), `Makefile` | Your two sequences and predictions in `fixtures/learner-sequences.json` and [evidence.md](evidence.md) |
| Complete single-spend demonstrations: [../../examples/w4-04/](../../examples/w4-04/README.md) | |

## Prerequisites

SDK 10.0.401, runtime 10.0.12, C# 14/net10.0, Python and Make (local `global.json` rolls forward; without
Make: `python3 test_session.py`, Windows `py -3 test_session.py`).

## Setup

From the lab directory:

```bash
cd starter
dotnet restore Session.csproj
dotnet build Session.csproj --no-restore --disable-build-servers
dotnet run --project Session.csproj --no-build -- fixtures/session-cases.json
make test
```

**Initial behaviour.** The starting class compiles. Its public setters, unnormalised constructor and
always-false operations are deliberately incomplete: the fixed run reports
`Session assertions: 79/98; cases=10; failures=19`. Python exits 1 and Make reports its failed recipe with exit 2.

## Concepts to reuse

```csharp
public int MovesRemaining { get; private set; }
```

```csharp
public GameSession(int moves)
{
    MovesRemaining = moves < 0 ? 0 : moves;
}
```

The worked examples run the complete single-spend classes with
`dotnet run --project Probe.csproj --disable-build-servers` (public-setter bypass prints `-9`; protected
class `Assertions: 13/13`; external write `CS0272` / `CS0200`).

## Task

Complete one `GameSession` class in `GameSession.cs`. Keep the public names and types. Use public getters
with private setters, or private integer fields with get-only properties. No new project, service,
inheritance, interface or testing framework is required. This is bounded class practice, not a change to
the Treasure game's rules.

* `MovesRemaining` is the session's total unspent allowance.
* `ReservedMoves` is a portion of that allowance held back from ordinary spending.
* The invariant is `0 <= ReservedMoves <= MovesRemaining`.
* A negative initial allowance normalises to zero; every new session starts with zero reserve.
* `TryReserveMoves(amount)` replaces the reservation when `0 <= amount <= MovesRemaining`; zero releases it.
  A rejected reservation returns false and preserves both values.
* `TrySpendMoves(amount)` accepts a strictly positive amount only when it fits
  `MovesRemaining - ReservedMoves`; acceptance subtracts it from `MovesRemaining`, keeps `ReservedMoves`
  and returns true. Rejection returns false and preserves both values.

Taught nonconflicting example: start with six, reserve two, spend one → (6,2) then (5,2), both true.

### Task 1: Inspect the starting public interface (5 minutes)
Run the starter; identify the two properties, constructor and method signatures. Explain why compilation
does not establish valid construction or guarded changes.

### Task 2: Write the class that enforces the contracts (12 minutes)
Complete storage, constructor and both operations; check validity before changing a value. Run
`python3 test_session.py --fixed-only` (98 assertions: result, remaining, reserved, rejectedPreserved,
invariant and independent for every step).

### Task 3: Choose conflicting requests and predict both orders (10 minutes)
In `fixtures/learner-sequences.json` keep initial allowance six for both cases. Choose one positive
reservation and one positive spend; each must fit an untouched session alone, but together exceed six. Use
the same requests in opposite orders (S01 reserve then spend; S02 spend then reserve). Before running, write
the Boolean and both state values after every step as the `expected` values. The starting zeros are
unfinished placeholders, not a suggested conflict.

### Task 4: Observe the boundary and resolve failures (11 minutes)
Run `make test`. After the 98 fixed assertions the checker validates your request constraints and runs your
sequences (28 assertions), then compiles two external assignment attempts, one per property, expecting
CS0272 (private setter) or CS0200 (get-only). Those expected compiler failures are internal checks; the
verifier exits zero when behaviour and both access boundaries pass. Do not replace an expected value
solely to make output agree.

### Task 5: Explain the prohibited change and retain evidence (7 minutes)
Run the full check after any correction. Keep your class, requests, predictions, actual results and both
external-write outcomes.

## Acceptance criteria

* One class has explicit construction, protected scalar state and the supplied small public interface.
* The 98 fixed assertions pass, including valid/invalid operations, invariant, rejected-state preservation and separate instances.
* Two learner-selected conflicting requests run in opposite orders; predictions precede feedback, and all 28 assertions pass.
* External assignments to both properties are rejected for the intended accessibility/read-only reason.
* Each learner identifies a prohibited change, its enforcing operation and the state-dependent difference between the orders.
* Current-source evidence and support used are retained; missing execution is named.

## Hints

* **Hint 1 — state ownership.** Which code should be allowed to assign each property? Which accessor do callers really need?
* **Hint 2 — operation boundaries.** Decide legality against the *current* values first; change state only after the decision.
* **Hint 3 — construct and trace.** Write (result, remaining, reserved) after each step for both orders before running.

## Individual evidence

Identify a state change the class must prevent and the operation that enforces the rule. Use one
conflict-order step: state before, predicted and actual Boolean, both retained values. Explain why reversing
the requests changes the later operation's context, and name the compiler observation showing callers cannot
assign either property.

## Recovery and teardown

Separate restore, compiler error, wrong case shape, runtime assertion and the intended prohibited-write
diagnostic. For behaviour, read result, remaining and reserved, then rejectedPreserved, invariant and
independent. The checker removes its disposable copy; `bin/obj` are not the hand-in.

## Optional depth

Paper transfer: a held seat allocation within a remaining allocation — which request should refuse, and
which two values stay unchanged?

## Knowledge check

1. A class stores an integer privately, exposes a get-only property and receives its starting value through a constructor. Which account distinguishes those members?
2. Both setters are private, but `TrySpendMoves` subtracts before checking the reserve and returns false after breaking the relationship. What explains the failure?
3. A caller needs to observe both values, change a reservation and request spending. Which public interface fits?
4. Behaviour cases pass, but a caller can still compile an assignment of a negative value to `ReservedMoves`. What evidence and correction are needed?
