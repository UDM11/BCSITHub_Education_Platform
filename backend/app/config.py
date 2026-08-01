import os
from dotenv import load_dotenv

# Load .env file from root backend directory
load_dotenv()

class Settings:
    PROJECT_NAME: str = "BCSITHub Backend API"
    VERSION: str = "1.0.0"
    
    SUPABASE_URL: str = os.getenv("SUPABASE_URL", "")
    SUPABASE_ANON_KEY: str = os.getenv("SUPABASE_ANON_KEY", "")
    # Service role is useful for administrative tasks (like backend file uploads and overriding RLS if needed)
    SUPABASE_SERVICE_ROLE_KEY: str = os.getenv("SUPABASE_SERVICE_ROLE_KEY", "")
    
    JWT_SECRET: str = os.getenv("JWT_SECRET", "super-secret-jwt-key-for-bcsithub")
    QUIZ_API_KEY: str = os.getenv("QUIZ_API_KEY", "")

    # SMTP Email Configuration (for sending OTP verification emails)
    SMTP_HOST: str = os.getenv("SMTP_HOST", "smtp.gmail.com")
    SMTP_PORT: int = int(os.getenv("SMTP_PORT", "587"))
    SMTP_EMAIL: str = os.getenv("SMTP_EMAIL", "")
    SMTP_PASSWORD: str = os.getenv("SMTP_PASSWORD", "")
    SMTP_FROM_NAME: str = os.getenv("SMTP_FROM_NAME", "BCSITHub")

settings = Settings()
