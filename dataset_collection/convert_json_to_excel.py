import json
import pandas as pd
import os
import time
import deepl  # Import DeepL translator

# Define file paths
json_file_path = "french-ghomala-bandjoun.json"  # Replace with your JSON file path
excel_file_path = "../datasets/english-french-ghomala.xlsx"

# Your DeepL API Key (replace with your actual API key)
DEEPL_API_KEY = "deepl-api-key"  # Get it from https://www.deepl.com/pro-api

# Initialize DeepL Translator
translator = deepl.Translator(DEEPL_API_KEY)

def translate_french_to_english(french_text, retries=3):
    """Translate a French sentence into English using DeepL with retries."""
    for attempt in range(retries):
        try:
            result = translator.translate_text(french_text, source_lang="FR", target_lang="EN-US")
            return result.text  # Extract translated text
        except Exception as e:
            print(f"Attempt {attempt + 1}: Error translating '{french_text}': {e}")
            time.sleep(1)  # Wait before retrying
    return french_text  # Return original if translation fails

def process_json_and_update_excel(json_path, excel_path, limit=1000):
    """Reads JSON file, translates first `limit` French sentences to English, and saves to Excel."""
    # Read JSON file
    with open(json_path, "r", encoding="utf-8") as file:
        data = json.load(file)

    # Limit to first `limit` entries
    data = data[:limit]

    # Prepare list for DataFrame
    records = []
    total_entries = len(data)

    for i, entry in enumerate(data, start=1):
        french_text = entry.get("francais", "").strip()
        ghomala_text = entry.get("ghomala", "").strip()

        if french_text:
            english_text = translate_french_to_english(french_text)
            records.append([english_text, french_text, ghomala_text])

        # Print progress every 50 translations
        if i % 10 == 0:
            print(f"Processed {i}/{total_entries} translations...")

    print("Translation completed for the first 300 sentences.")

    # Create a DataFrame
    df_new = pd.DataFrame(records, columns=["English sentence", "French translation", "Ghomala translation"])

    # If Excel file exists, append new data
    if os.path.exists(excel_path):
        df_existing = pd.read_excel(excel_path)
        df_final = pd.concat([df_existing, df_new], ignore_index=True)
    else:
        df_final = df_new

    # Save to Excel
    df_final.to_excel(excel_path, index=False)
    print(f"Excel file updated: {excel_path}")

# Run the function
process_json_and_update_excel(json_file_path, excel_file_path, limit=1000)
