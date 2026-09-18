# References

The TrackReco research page uses the current reconstruction state plus primary external sources for TrackML and the comparison implementation.

## Current project state

- `dbontr/particle-track-reco` — clean-room C++ particle-track reconstruction implementation: https://github.com/dbontr/particle-track-reco
- Current merged reconstruction revision: `4decac5` (`Improve TrackML reconstruction quality and validation`, pull request #2).
- Validation source: `data/benchmarks/particle-track-reco-current.json`.
- Controlled automatic result: 500 / 500 reference tracks reconstructed, 0.197% fake rate, 1.378% duplicate rate, and 34 / 34 configured tests passing.
- Front-end diagnostic on the same workload: 100% seed recall, 99.082% seed purity, and 27.378% seed duplicate rate.
- Robustness matrix: four disjoint 250-track windows from the same public event span 99.2–100% reconstruction efficiency.

## Dataset sources

- TrackML Particle Tracking Challenge data description and event format: https://www.kaggle.com/c/trackml-particle-identification/data
- HSF Phoenix TrackML sample mirror used for `event000001000`: https://github.com/HSF/phoenix/tree/main/packages/phoenix-ng/projects/phoenix-app/src/assets/files/TrackML
- Amrouche et al., “The Tracking Machine Learning challenge: Accuracy phase,” arXiv:1904.06778: https://arxiv.org/abs/1904.06778
- Amrouche et al., “The Tracking Machine Learning challenge: Throughput phase,” arXiv:2105.01160: https://arxiv.org/abs/2105.01160

## Technical comparison reference

- `trackreco/mkFit` — vectorized and parallelized tracking implementation used as a technical comparison reference: https://github.com/trackreco/mkFit

## Interpretation

The 100% reconstruction result applies to the fixed 500-track TrackML validation subset described in the snapshot. The four-window matrix broadens validation within that same public event; it does not establish multi-event performance. Different events, detector geometries, occupancies, hardware, and experiment-specific reconstruction chains require their own validation. The public TrackReco page therefore treats quality metrics as scoped evidence and does not publish older stage-matched timing runs as current performance claims.
