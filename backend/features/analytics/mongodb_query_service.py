# features/analytics/mongodb_query_service.py

"""
MongoDB Query Service for the dynamic analytics dashboard.

Fetches sample documents and schema from the configured collections,
then formats the data as a readable context string for the LLM prompt.
"""

import json
from bson import ObjectId
from pymongo import errors as pymongo_errors
import db

# Collections queried for analytics context
ANALYTICS_COLLECTIONS = ["pollution_metrics", "rse_scores", "companies"]


def _serialize_doc(doc: dict) -> dict:
    """Convert a MongoDB document to a JSON-serializable dict."""
    result = {}
    for key, value in doc.items():
        if isinstance(value, ObjectId):
            result[key] = str(value)
        elif isinstance(value, dict):
            result[key] = _serialize_doc(value)
        elif isinstance(value, list):
            result[key] = [
                _serialize_doc(v) if isinstance(v, dict) else (str(v) if isinstance(v, ObjectId) else v)
                for v in value
            ]
        else:
            result[key] = value
    return result


def fetch_collection_data(collection_name: str, limit: int = 50) -> dict:
    """
    Fetch sample documents and document count from a MongoDB collection.

    Returns a dict with:
      - "documents": list of up to `limit` serializable documents
      - "document_count": total number of documents in the collection
      - "error": present only if an exception occurred
    """
    try:
        collection = db.db.get_collection(collection_name)
        document_count = collection.count_documents({})
        documents = [_serialize_doc(doc) for doc in collection.find({}).limit(limit)]
        return {
            "documents": documents,
            "document_count": document_count,
        }
    except pymongo_errors.PyMongoError as e:
        return {"document_count": 0, "error": str(e)}
    except Exception as e:
        return {"document_count": 0, "error": str(e)}


def get_collection_schema(collection_name: str) -> dict:
    """
    Infer a schema dict mapping field name → Python type name from a sample document.

    Returns an empty dict if the collection is empty or unreachable.
    """
    try:
        collection = db.db.get_collection(collection_name)
        sample = collection.find_one({})
        if sample is None:
            return {}
        return {key: type(value).__name__ for key, value in sample.items()}
    except pymongo_errors.PyMongoError:
        return {}
    except Exception:
        return {}


def prepare_analytics_context() -> dict:
    """
    Query all configured analytics collections and return a context dict.

    Returns a dict keyed by collection name, each value being the result
    of `fetch_collection_data` for that collection.
    """
    context = {}
    for collection_name in ANALYTICS_COLLECTIONS:
        context[collection_name] = fetch_collection_data(collection_name)
    return context


def format_context_for_llm(context: dict) -> str:
    """
    Produce a readable string from the analytics context dict.

    Includes for each collection:
      - Collection name and document count
      - Schema (field → type)
      - Up to 3 sample documents as formatted JSON
    """
    lines = ["=== MongoDB Analytics Context ===\n"]

    for collection_name, data in context.items():
        lines.append(f"Collection: {collection_name}")

        if "error" in data:
            lines.append(f"  Status: ERROR — {data['error']}")
            lines.append(f"  Document count: 0\n")
            continue

        document_count = data.get("document_count", 0)
        documents = data.get("documents", [])

        lines.append(f"  Document count: {document_count}")

        # Schema from the first document
        if documents:
            schema = {key: type(value).__name__ for key, value in documents[0].items()}
            schema_str = ", ".join(f"{k}: {v}" for k, v in schema.items())
            lines.append(f"  Schema: {schema_str}")

            # Up to 3 sample documents
            samples = documents[:3]
            lines.append(f"  Sample documents ({len(samples)}):")
            for i, doc in enumerate(samples, start=1):
                try:
                    doc_str = json.dumps(doc, indent=4, default=str)
                except (TypeError, ValueError):
                    doc_str = str(doc)
                lines.append(f"    [{i}] {doc_str}")
        else:
            lines.append("  Schema: (no documents)")
            lines.append("  Sample documents: (none)")

        lines.append("")  # blank line between collections

    return "\n".join(lines)
