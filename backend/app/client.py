from supabase import create_client, Client
from app.config import settings

if not settings.SUPABASE_URL:
    raise ValueError("SUPABASE_URL environment variable is missing.")

# Prefer service role key for backend-to-backend operations, fallback to anon
db_key = settings.SUPABASE_SERVICE_ROLE_KEY or settings.SUPABASE_ANON_KEY
if not db_key:
    raise ValueError("SUPABASE_ANON_KEY or SUPABASE_SERVICE_ROLE_KEY must be provided.")

# Service/Anon initialized client for database operations
supabase_client: Client = create_client(settings.SUPABASE_URL, db_key)
# Anon-only client for operations requiring user context emulation
supabase_anon_client: Client = create_client(settings.SUPABASE_URL, settings.SUPABASE_ANON_KEY)
