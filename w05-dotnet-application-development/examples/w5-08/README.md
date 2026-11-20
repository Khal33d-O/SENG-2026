# W5.08 worked examples · Collaborative delivery and pipeline gates

[demo.sh](demo.sh) runs Demo 1 and Demo 2 end to end (it applies the one-line correction with `sed`; in
the lab you make that edit yourself after writing your review).

```bash
python3 "$W5_PACKAGE/release.py" init --workspace "$W5_ATTEMPT/release"
python3 "$W5_PACKAGE/peer-change.py" "$W5_ATTEMPT/release/source"
git -C "$W5_ATTEMPT/release/source" diff
```

Expected diff: `Api/Program.cs` release label `"known-good"` → `"candidate"`; `Api/Routes.cs`
`Error(context, 409, result.Reason!, ...)` → `Error(context, 200, result.Reason!, ...)`.

```bash
git -C "$W5_ATTEMPT/release/source" add Api/Program.cs Api/Routes.cs
git -C "$W5_ATTEMPT/release/source" commit -m 'Peer candidate for bounded review'
python3 "$W5_PACKAGE/release.py" pipeline --workspace "$W5_ATTEMPT/release"
```

Expected: `Check failed: South into the wall returns 409`, `FAIL pipeline at stage 'http-tests'`,
failed evidence retained as `pipeline-<commit>-failed-1` and no success record.

```bash
git -C "$W5_ATTEMPT/release/source" add Api/Routes.cs
git -C "$W5_ATTEMPT/release/source" commit -m 'Preserve rejected-action HTTP contract'
python3 "$W5_PACKAGE/release.py" pipeline --workspace "$W5_ATTEMPT/release"
```

Expected: `PASS pipeline for source commit <S2>`, `image: localhost/academy-w5-api:candidate-<S2 first 12>`
(or `local-archive/...` without Podman), `imageId: ...`, `result: .../pipeline-<S2>/result.json`.

```bash
export W5_IMAGE='replace-with-image-from-result-json'
python3 "$W5_PACKAGE/release.py" select --workspace "$W5_ATTEMPT/release" --image "$W5_IMAGE"
git -C "$W5_ATTEMPT/release/configuration" show HEAD
```

Expected: `configuration commit <C1> selects <image> (source commit <S2>)` and a diff of
`apps/academy-w5/deployment.yaml` changing the `selected-app-image` line.

Offline trace: source S1 fails rejected-status test; correction S2 passes; image tag includes S2 and
result records image ID; configuration C1 references that image.
