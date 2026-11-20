# Candidate C — author's message (part of the material under review)

> **Teaching material.** This candidate and its message were deliberately authored for this course as a
> flawed example of an AI-assisted patch. They are not an unedited response from any live provider, and one
> example says nothing about any provider's defect rate.

---

**Fix: blocked moves no longer cost a move**

I fixed the wall bug: a rejected move now returns the caller's state unchanged, so East then South keeps five
moves. While I was there I did some **safe cleanup** of the move-cost logic and removed a redundant type
check, because TypeScript already guarantees `direction` is a string. **All edge cases are handled** and
behaviour is otherwise identical. Lint is clean (zero errors). Ready to merge.
