import base64
from fastapi import UploadFile

async def encode_image_to_base64(file: UploadFile) -> str:
    """
    Encode un UploadFile (FastAPI) en base64 pour GPT-4o Vision.
    """
    content = await file.read()
    b64_encoded = base64.b64encode(content).decode('utf-8')
    return b64_encoded
