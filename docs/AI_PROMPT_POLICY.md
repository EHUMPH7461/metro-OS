# AI Prompt and Policy Layer

Prompt version metro-listing-v1 separates system rules from delimited inventory facts. Inventory titles, descriptions, and notes are treated as untrusted data rather than instructions. Input is length-limited and suspicious phrases such as instruction overrides, system-prompt requests, and jailbreak language are neutralized and reported.

Outputs are field-level structured candidates. Validation checks title length, unsupported promotional claims, external links, unsafe HTML, missing evidence, and source contradictions. Descriptions strip scripts, tags, and URLs. Unknown facts remain missing or inferred; brand, condition, size, model, material, category, price, dimensions, and item specifics are never fabricated.

Safe metadata may be logged. Full prompts, credentials, and private image data are not logged by default.
