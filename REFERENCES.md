# References

The TrackReco research page uses the current reconstruction state plus primary external sources for TrackML and the comparison implementation.

## Current project state

- `dbontr/particle-track-reco` — clean-room C++ particle-track reconstruction implementation: https://github.com/dbontr/particle-track-reco
- Current merged reconstruction revision: `16ebe3b` (`Improve TrackML fusion seed recovery` merged through pull request #1).
- Validation source: `data/benchmarks/particle-track-reco-current.json`.
- Controlled automatic result: 500 / 500 reference tracks reconstructed, 9.294% fake rate, 4.647% duplicate rate, and 34 / 34 configured tests passing.
- Front-end diagnostic on the same workload: 99.8% seed recall and 98.397% seed purity. The 100% figure on the research page is end-to-end automatic reconstruction efficiency.

## Dataset sources

- TrackML Particle Tracking Challenge data description and event format: https://www.kaggle.com/c/trackml-particle-identification/data
- HSF Phoenix TrackML sample mirror used for `event000001000`: https://github.com/HSF/phoenix/tree/main/packages/phoenix-ng/projects/phoenix-app/src/assets/files/TrackML
- Amrouche et al., “The Tracking Machine Learning challenge: Accuracy phase,” arXiv:1904.06778: https://arxiv.org/abs/1904.06778
- Amrouche et al., “The Tracking Machine Learning challenge: Throughput phase,” arXiv:2105.01160: https://arxiv.org/abs/2105.01160

## Technical comparison reference

- `trackreco/mkFit` — vectorized and parallelized tracking implementation used as a technical comparison reference: https://github.com/trackreco/mkFit

## Interpretation

The current 100% reconstruction result applies to the fixed 500-track TrackML validation subset described in the snapshot. It does not establish perfect efficiency for other events, detector geometries, occupancies, hardware, or experiment-specific reconstruction chains. The public TrackReco page therefore treats quality metrics as scoped validation evidence and does not publish older stage-matched throughput runs as current performance claims.
