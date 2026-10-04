"""Retrain all AMR models after feature matrix rebuild + phenotype expansion."""
import sys
sys.path.insert(0, '.')
from ml.training.train_baseline import train_all_models

results = train_all_models()
print()
print(f"IMPLEMENTED models: {results['implemented']}")
print(f"NOT IMPLEMENTED: {len(results['not_implemented'])} antibiotics")
