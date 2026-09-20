# References

The TrackReco research page uses the merged reconstruction state plus primary external sources for TrackML and the comparison implementation.

## Current project state

- `dbontr/particle-track-reco` — clean-room C++ particle-track reconstruction implementation: https://github.com/dbontr/particle-track-reco
- Current reconstruction revision: `48a913c` (`Tighten TrackML fragment closure`, merged through pull request #3).
- Final-validation source: `data/benchmarks/particle-track-reco-current.json`.
- Branch and ablation measurements: `data/benchmarks/particle-track-reco-evidence.json`.
- Controlled automatic result: exactly 500 reconstructed tracks for 500 reference tracks, with 100% reconstruction efficiency, zero fake tracks, zero duplicate tracks, and 34 / 34 configured tests passing.
- Closure ablation on the same controlled subset: disabling trajectory completion / closure leaves 693 reconstructed tracks, 27.27% duplicates, and 0.58% fakes while retaining 100% reference efficiency.
- Branch comparison on the same subset: EKF, A*, ACO, PSO, and SA close at 100% efficiency with zero fake and duplicate tracks; Hungarian closes at 100% efficiency with one duplicate track.
- Collaboration ablation: forced shared-hit collaboration does not improve final quality on the controlled subset and usually reduces throughput; the objective-adaptive policy selects its no-sharing fallback for all six branchers on this workload.
- Robustness matrix: all four disjoint 250-track windows from the same public event reach 100% reconstruction efficiency; fake rate spans 0.38–1.16% and duplicate rate spans 1.94–3.46%.

## Dataset sources

- TrackML Particle Tracking Challenge data description and event format: https://www.kaggle.com/c/trackml-particle-identification/data
- HSF Phoenix TrackML sample mirror used for `event000001000`: https://github.com/HSF/phoenix/tree/main/packages/phoenix-ng/projects/phoenix-app/src/assets/files/TrackML
- Amrouche et al., “The Tracking Machine Learning challenge: Accuracy phase,” arXiv:1904.06778: https://arxiv.org/abs/1904.06778
- Amrouche et al., “The Tracking Machine Learning challenge: Throughput phase,” arXiv:2105.01160: https://arxiv.org/abs/2105.01160

## Technical comparison reference

- `trackreco/mkFit` — vectorized and parallelized tracking implementation used as a technical comparison reference: https://github.com/trackreco/mkFit

## Interpretation

The zero-fake, zero-duplicate reconstruction result applies to the fixed 500-track TrackML validation subset. The branch and ablation plots use the current merged implementation and the same controlled subset unless their caption states otherwise. The four-window matrix and 1,000-track stress test broaden validation within the same public event; they do not establish multi-event performance. Different events, detector geometries, occupancies, hardware, and experiment-specific reconstruction chains require their own validation.
