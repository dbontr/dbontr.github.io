# References

This site update is based on measured outputs from the current particle reconstruction code and primary sources for the external dataset and comparison implementation.

## Project and benchmark sources

- `dbontr/particle-track-reco` — clean-room reconstruction implementation used for the September 14, 2026 benchmark runs: https://github.com/dbontr/particle-track-reco
- Optimization commit used for the published measurements: `06a5072` (`Optimize TrackML reconstruction and parallel scaling`).
- Reproducible benchmark summary committed with this site: `data/benchmarks/particle-track-reco-2026-09-14.json`
- `trackreco/mkFit` — upstream vectorized and parallelized tracking implementation used as the comparison reference: https://github.com/trackreco/mkFit

## Dataset sources

- TrackML Particle Tracking Challenge data description and event format: https://www.kaggle.com/c/trackml-particle-identification/data
- HSF Phoenix TrackML sample mirror used to obtain `event000001000`: https://github.com/HSF/phoenix/tree/main/packages/phoenix-ng/projects/phoenix-app/src/assets/files/TrackML
- Amrouche et al., “The Tracking Machine Learning challenge: Accuracy phase,” arXiv:1904.06778: https://arxiv.org/abs/1904.06778
- Amrouche et al., “The Tracking Machine Learning challenge: Throughput phase,” arXiv:2105.01160: https://arxiv.org/abs/2105.01160

## Benchmark interpretation

The published absolute mkFit comparison is deliberately limited to candidate building. Both implementations receive the same 500 TrackML tracks with the same three truth-derived seed hits on the same Intel Core Ultra 7 265K. `particle-track-reco` disables hit sharing, track refinement, and trajectory completion for this comparison; mkFit uses `TrackMLGeom`, `--seed-input cmssw`, `--build-ce`, one event thread, and the CEMX clone-engine timer.

The article does not claim that this result establishes end-to-end superiority over a complete CMS reconstruction workflow, other detectors, other event occupancies, or other hardware. The published 1–8-thread values use seven 100-event repetitions per thread count; 16-thread raw measurements are retained in the benchmark JSON but omitted from the headline comparison because the `particle-track-reco` measurements were materially noisier at that point.
