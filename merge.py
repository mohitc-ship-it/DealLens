import json
from typing import Any, Dict

def merge_json(ideal: Dict[str, Any], partial: Dict[str, Any]) -> Dict[str, Any]:
    """
    Recursively merges ideal JSON attributes into partial JSON.
    Missing attributes from ideal are added to partial.
    """
    merged = dict(partial)  # Start with existing partial
    for key, ideal_value in ideal.items():
        if key not in merged or merged[key] is None:
            # Attribute missing or null → copy from ideal
            merged[key] = ideal_value
        elif isinstance(ideal_value, dict) and isinstance(merged[key], dict):
            # Both are dicts → merge recursively
            merged[key] = merge_json(ideal_value, merged[key])
        # Else keep existing partial value (non-null)
    return merged

def merge_json_files(ideal_path: str, partial_path: str, output_path: str):
    with open(ideal_path, "r", encoding="utf-8") as f:
        ideal_data = json.load(f)
    with open(partial_path, "r", encoding="utf-8") as f:
        partial_data = json.load(f)

    merged_data = merge_json(ideal_data, partial_data)

    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(merged_data, f, indent=2)

    print(f"✅ Merged JSON saved to {output_path}")


# Example usage:
if __name__ == "__main__":
    merge_json_files("ex.json", "example-form-filling-context/prem.json", "merged.json")
