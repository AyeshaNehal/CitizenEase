from typing import Optional, Dict, Any
from fastapi import Header, HTTPException, status
from backend.app.db.client import get_supabase_client

async def get_current_user_optional(authorization: Optional[str] = Header(None)) -> Optional[Dict[str, Any]]:
    """
    Extracts and validates Supabase JWT from 'Authorization: Bearer <token>' header if present.
    Returns user dict with 'id' and 'email' if valid, or None if anonymous/unauthenticated.
    """
    if not authorization or not authorization.startswith("Bearer "):
        return None

    token = authorization.split(" ")[1].strip()
    if not token:
        return None

    supabase = get_supabase_client()
    if not supabase:
        # If Supabase client is not configured yet, don't block guest requests
        return None

    try:
        user_response = supabase.auth.get_user(token)
        if user_response and user_response.user:
            return {
                "id": str(user_response.user.id),
                "email": user_response.user.email,
                "user_metadata": user_response.user.user_metadata or {}
            }
    except Exception:
        # Invalid or expired token
        return None

    return None

async def get_current_user_required(authorization: Optional[str] = Header(None)) -> Dict[str, Any]:
    """
    Requires a valid Supabase JWT token. Raises 401 if missing or invalid.
    """
    user = await get_current_user_optional(authorization)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return user
