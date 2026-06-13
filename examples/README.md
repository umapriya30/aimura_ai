# Aimura AI Demo Profiles

`demo_profiles.csv` contains three lightweight student profiles for local testing:

1. `student-ai`: a neutral verification profile for a student targeting data and machine learning.
2. `arjun-cyber`: a cybersecurity-oriented profile with higher visa concern.
3. `mei-analytics`: a business analytics and product analyst profile.

Run the local verification script without Azure credentials:

```bash
python scripts/verify_demo_profiles.py
```

The script uses the deterministic offline fallback and checks that every generated report includes the required Aimura AI sections and safety disclaimer.
