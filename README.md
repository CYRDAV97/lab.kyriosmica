# kyriosMICA Lab — TQIM-Davoh v3

**Plateforme de Bio-Informatique Systémique Quantique**

Théorie Quantique de l'Information Moléculaire de Davoh (TQIM-Davoh)
Qudits-36 · Bell/GHZ · MPS · T₃-Net QNN

## Architecture

```
Frontend (this repo)     →  lab.kyriosmica.com  (Vercel)
Backend (MICA-Kernel v3) →  api.kyriosmica.com  (Render)
```

## Features

- **Analyseur** — Mode Codon + Mode Séquence · 4 Postulats
- **Chiffrement** — MICA-OTP · Gestion de clé · T₃ⁿ
- **Déchiffrement** — Reconstitution depuis cipher + clé
- **Rapport** — Export LaTeX scientifique

## Physics Engine

- Bell/GHZ geometric filter (impossible state rejection)
- MPS Level 1 (codon) + Level 2 (MIH-21 7-codons)
- T₃-Net QNN with STE backpropagation
- Na⁺/K⁺/Mg²⁺ individual ion Debye-Hückel
- Von Neumann entropy −Tr(ρ log₂ ρ)
- B-form / A-form / Stress classification
- 3-mode inference (ARGMAX / BOLTZMANN / SAMPLE)
- Epigenetics: 5mC, 5hmC, m6A, m4C

## Deploy

```bash
npm install
npm run dev      # local: http://localhost:3000
npm run build    # production build
```

Push to GitHub → Vercel auto-deploys.

## API

Backend: https://api.kyriosmica.com
Docs: https://api.kyriosmica.com/docs

## Institution

**kyriosMICA** — Research Institute in Systemic Bioinformatics
Bénin, West Africa · https://kyriosmica.com

*Decoding Life. Encoding the Future.*

© 2026 Cyrille Egnon Davoh — All rights reserved
