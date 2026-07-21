# v0.5.0 AI Listing Assistant

The AI Listing Assistant is a review-first workspace for title, description, category, item-specific, condition, keyword, pricing, shipping, missing-information, and complete-draft suggestions. Generation is always user-triggered. Suggestions remain marked AI-generated until accepted, edited, or rejected; acceptance never silently overwrites listing data.

The queue supports search, readiness/status filters, previous/next navigation, per-item history, and a safe batch missing-information queue. Batch concurrency is one, results are reviewed item by item, and nothing is automatically accepted or published to eBay.

Schema version 6 adds isolated AI generation sessions and feedback events. It stores provider/model metadata, timestamps, source hashes, structured responses, status, safe usage metadata, and error summaries. It never stores credentials or image binaries. AI history can be cleared without deleting inventory, listings, or photos.

Known source limitations include missing measurements, structured defects, packed weight/dimensions, model/style/material, and real marketplace comparable sales.
