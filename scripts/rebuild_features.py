import sys
sys.path.insert(0, '.')
from ml.features.extractor import build_feature_matrix_from_amr_dir, get_feature_schema
from pathlib import Path

amr_dir = Path('data/derived/amr')
out_parquet = Path('data/derived/features/feature_matrix.parquet')

print('Schema columns:', len(get_feature_schema()))

df = build_feature_matrix_from_amr_dir(amr_dir, out_parquet)
print(f'Feature matrix shape: {df.shape}')
print(f'Index: {list(df.index)}')

# Show which markers are active for each genome
for gid in df.index:
    active = [col for col in df.columns if col.startswith('has_') and df.loc[gid, col] > 0]
    print(f'  {gid}: {active}')
