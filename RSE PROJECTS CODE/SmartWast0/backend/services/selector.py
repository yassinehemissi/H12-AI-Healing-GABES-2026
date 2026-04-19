import json
import random
import os

BINS_FILE = os.path.join(os.path.dirname(__file__), "..", "data", "bins.json")

_cached_bins = None

def get_all_bins():
    global _cached_bins
    if _cached_bins is None:
        with open(BINS_FILE, "r") as f:
            _cached_bins = json.load(f)
    return _cached_bins

def select_bins(n: int):
    all_bins = get_all_bins()
    n = max(1, min(n, len(all_bins)))
    return random.sample(all_bins, n)
