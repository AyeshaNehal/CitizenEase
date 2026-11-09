import os
from typing import Optional
from app.config import settings

try:
    from supabase import create_client, Client
except ImportError:
    Client = None
    create_client = None

supabase_client: Optional[Any] = None

def get_supabase_client():
    global supabase_client
    if supabase_client is None and create_client is not None:
        url = os.environ.get("SUPABASE_URL", "")
        key = settings.SUPABASE_SERVICE_KEY
        if url and key:
            supabase_client = create_client(url, key)
    return supabase_client
