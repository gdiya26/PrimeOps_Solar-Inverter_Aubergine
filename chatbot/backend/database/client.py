import os
from dotenv import load_dotenv
from supabase import create_client, Client

# Load environment variables from the root folder
load_dotenv(os.path.join(os.path.dirname(__file__), '../../.env'))

SUPABASE_URL = os.environ.get("SUPABASE_URL")
SUPABASE_KEY = os.environ.get("SUPABASE_KEY")

def get_supabase_client() -> Client:
    """Returns a singleton Supabase client instance."""
    if not SUPABASE_URL or not SUPABASE_KEY:
        raise ValueError("Missing SUPABASE_URL or SUPABASE_KEY in environment variables.")
    return create_client(SUPABASE_URL, SUPABASE_KEY)
