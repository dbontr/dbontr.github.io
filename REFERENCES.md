# References

The TrackReco research page uses the merged reconstruction state plus primary external sources for TrackML and mkFit.

## Current project state

- `dbontr/particle-track-reco` — clean-room C++ particle-track reconstruction implementation: https://github.com/dbontr/particle-track-reco
- Current reconstruction revision: `48a913c`.
- Final-validation source: `data/benchmarks/particle-track-reco-current.json`.
- Branch, closure, collaboration, thread-scaling, and mkFit timing measurements: `data/benchmarks/particle-track-reco-evidence.json`.
- Controlled automatic result: exactly 500 reconstructed tracks for 500 reference tracks, with 100% reconstruction efficiency, zero fake tracks, and zero duplicate tracks.
- Closure ablation on the same controlled subset: disabling trajectory completion / closure leaves 693 reconstructed tracks, 27.27% duplicates, and 0.58% fakes while retaining 100% reference efficiency.
- TrackReco thread scaling on the same subset: 115.6k tracks/s at one thread, 185.4k tracks/s at eight threads, and 39.8k tracks/s at sixteen threads; final quality is unchanged at every measured point.
- Fresh mkFit same-machine timing reference uses `trackreco/mkFit` devel revision `ba370252` and the same controlled 500-track selection. TrackReco times its reconstruction engine after loading; mkFit reports its total event-loop and CloneEngine build-stage timers, so these timings are not identical stage scopes.

## Dataset sources

- TrackML Particle Tracking Challenge data description and event format: https://www.kaggle.com/c/trackml-particle-identification/data
- HSF Phoenix TrackML sample mirror used for `event000001000`: https://github.com/HSF/phoenix/tree/main/packages/phoenix-ng/projects/phoenix-app/src/assets/files/TrackML
- Amrouche et al., “The Tracking Machine Learning challenge: Accuracy phase,” arXiv:1904.06778: https://arxiv.org/abs/1904.06778
- Amrouche et al., “The Tracking Machine Learning challenge: Throughput phase,” arXiv:2105.01160: https://arxiv.org/abs/2105.01160

## Technical comparison reference

- `trackreco/mkFit` — vectorized and parallelized charged-particle track reconstruction implementation: https://github.com/trackreco/mkFit

## Interpretation

The zero-fake, zero-duplicate reconstruction result applies to the fixed 500-track TrackML validation subset. Performance plots are same-machine measurements on that controlled selection unless their caption states otherwise. The mkFit comparison is a timing reference with explicitly different internal timing scopes, not a claim of stage-for-stage equivalence. The robustness windows and 1,000-track stress test broaden validation within the same public event; they do not establish multi-event performance.
