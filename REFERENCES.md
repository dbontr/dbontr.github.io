# References

This site update is based on measured outputs from the current particle reconstruction code and primary sources for the external dataset and comparison implementation.

## Project and benchmark sources

- `dbontr/particle-track-reco` — current clean-room reconstruction implementation used for the September 12, 2026 benchmark runs: https://github.com/dbontr/particle-track-reco
- Reproducible benchmark summary committed with this site: `data/benchmarks/particle-track-reco-2026-09-12.json`
- `trackreco/mkFit` — upstream vectorized and parallelized tracking implementation used as the comparison reference: https://github.com/trackreco/mkFit

## Dataset sources

- TrackML Particle Tracking Challenge data description and event format: https://www.kaggle.com/c/trackml-particle-identification/data
- HSF Phoenix TrackML sample mirror used to obtain `event000001000`: https://github.com/HSF/phoenix/tree/main/packages/phoenix-ng/projects/phoenix-app/src/assets/files/TrackML
- Amrouche et al., “The Tracking Machine Learning challenge: Accuracy phase,” arXiv:1904.06778: https://arxiv.org/abs/1904.06778
- Amrouche et al., “The Tracking Machine Learning challenge: Throughput phase,” arXiv:2105.01160: https://arxiv.org/abs/2105.01160

## Benchmark interpretation

Absolute particle-track-reco versus mkFit speedup claims are intentionally omitted because the available timers instrument different code scopes. The published mkFit figure compares relative thread scaling only, with each implementation normalized to its own one-thread result.
