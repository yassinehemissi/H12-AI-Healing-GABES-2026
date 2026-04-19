# utils/cleaning.py

def normalize_text(text):
    if not text:
        return None
    return text.strip().lower()

def build_company_record(name, sector=None, location=None, source=None):
    return {
        "name": normalize_text(name),
        "sector": normalize_text(sector),
        "location": normalize_text(location),
        "source": source,
    }