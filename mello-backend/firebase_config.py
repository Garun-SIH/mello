import os
import sys

import firebase_admin
from dotenv import load_dotenv
from firebase_admin import auth, credentials

load_dotenv()


def safe_print(message):
    """Safe print function to handle Windows terminal issues"""
    try:
        print(message)
        sys.stdout.flush()
    except (OSError, IOError):
        # Silently handle terminal output errors on Windows
        pass


def initialize_firebase():
    """Initialize Firebase Admin SDK"""
    try:
        # Check if Firebase is already initialized
        firebase_admin.get_app()
        return True
    except ValueError:
        # Firebase not initialized, proceed with initialization
        pass

    # Try to use credentials file first
    credentials_path = os.getenv("FIREBASE_ADMIN_CREDENTIALS_PATH")

    if credentials_path and os.path.exists(credentials_path):
        try:
            # Initialize with credentials file
            cred = credentials.Certificate(credentials_path)
            firebase_admin.initialize_app(cred)
            safe_print(
                "Firebase Admin SDK initialized successfully with credentials file"
            )
            return True
        except Exception as e:
            safe_print(f"Failed to initialize Firebase with credentials file: {str(e)}")

    # Fallback to environment variables
    firebase_config = {
        "type": "service_account",
        "project_id": os.getenv("FIREBASE_PROJECT_ID"),
        "private_key_id": os.getenv("FIREBASE_PRIVATE_KEY_ID"),
        "private_key": os.getenv("FIREBASE_PRIVATE_KEY", "").replace("\\n", "\n"),
        "client_email": os.getenv("FIREBASE_CLIENT_EMAIL"),
        "client_id": os.getenv("FIREBASE_CLIENT_ID"),
        "auth_uri": "https://accounts.google.com/o/oauth2/auth",
        "token_uri": "https://oauth2.googleapis.com/token",
        "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
        "client_x509_cert_url": os.getenv("FIREBASE_CLIENT_CERT_URL"),
    }

    # Check if all required fields are present
    required_fields = ["project_id", "private_key", "client_email"]
    missing_fields = [
        field for field in required_fields if not firebase_config.get(field)
    ]

    if missing_fields:
        safe_print(f"Warning: Missing Firebase configuration fields: {missing_fields}")
        safe_print("Firebase authentication will not be available.")
        return False

    try:
        # Initialize Firebase Admin SDK
        cred = credentials.Certificate(firebase_config)
        firebase_admin.initialize_app(cred)
        safe_print(
            "Firebase Admin SDK initialized successfully with environment variables"
        )
        return True
    except Exception as e:
        safe_print(f"Failed to initialize Firebase: {str(e)}")
        return False


def verify_firebase_token(token: str):
    """Verify Firebase ID token"""
    try:
        decoded_token = auth.verify_id_token(token)
        return decoded_token
    except Exception as e:
        safe_print(f"Token verification failed: {str(e)}")
        return None


def get_user_by_uid(uid: str):
    """Get Firebase user by UID"""
    try:
        user_record = auth.get_user(uid)
        return user_record
    except Exception as e:
        safe_print(f"Failed to get user: {str(e)}")
        return None
