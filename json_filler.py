import json
import os
from faker import Faker
from typing import Any, Dict, List, Union

# Type for JSON-like objects
JSONValue = Union[str, int, float, bool, None, List[Any], Dict[str, Any]]

faker = Faker()

def generate_value_for_key(key: str, value_sample: Any = None) -> Any:
    k = key.lower()

    # Keyword-based generation
    if "first" in k:
        return faker.first_name()
    if "last" in k:
        return faker.last_name()
    if "name" in k:
        return faker.name()
    if "email" in k:
        return faker.email()
    if "phone" in k:
        return faker.phone_number()
    if "address" in k or "street" in k:
        return faker.street_address()
    if "city" in k:
        return faker.city()
    if "zip" in k or "postal" in k:
        return faker.postcode()
    if "company" in k or "organization" in k:
        return faker.company()
    if "date" in k or "dob" in k or "year" in k:
        return faker.date_of_birth(minimum_age=18, maximum_age=65).isoformat()
    if "percent" in k or "amount" in k or "number" in k or "id" in k:
        return faker.random_int(min=0, max=100)

    # Type-aware fallback
    if isinstance(value_sample, str) or value_sample is None:
        return faker.sentence(nb_words=3)
    if isinstance(value_sample, int):
        return faker.random_int(min=0, max=100)
    if isinstance(value_sample, float):
        return round(faker.random_number(digits=5) / 100, 2)
    if isinstance(value_sample, bool):
        return faker.boolean()

    # Default fallback
    return faker.word()


def fill_null_values(obj: JSONValue) -> JSONValue:
    if obj is None or obj == "":
        return generate_value_for_key("")
    if isinstance(obj, list):
        return [fill_null_values(x) for x in obj]
    if isinstance(obj, dict):
        return {k: generate_value_for_key(k) if v is None or v == "" else fill_null_values(v) for k, v in obj.items()}
    return obj

def fill_json_file(input_path: str, output_path: str):
    with open(input_path, "r", encoding="utf-8") as f:
        data = json.load(f)

    filled_data = fill_null_values(data)

    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(filled_data, f, indent=2)

    print(f"✅ Filled JSON saved to {output_path}")


# Example usage
if __name__ == "__main__":
    fill_json_file("merged.json", "summit_filled.json")
