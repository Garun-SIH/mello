"""
Database migration script to create all tables for the Mello application.
Run this script to set up the database with all required tables.
"""

from sqlalchemy import create_engine
from models import Base
from database import DATABASE_URL
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

def create_tables():
    """Create all database tables"""
    try:
        # Create engine
        engine = create_engine(DATABASE_URL)
        
        # Create all tables
        print("Creating database tables...")
        Base.metadata.create_all(bind=engine)
        print("✅ All tables created successfully!")
        
        # Print created tables
        print("\nCreated tables:")
        for table_name in Base.metadata.tables.keys():
            print(f"  - {table_name}")
            
    except Exception as e:
        print(f"❌ Error creating tables: {str(e)}")
        return False
    
    return True

if __name__ == "__main__":
    success = create_tables()
    if success:
        print("\n🎉 Database setup complete! You can now run the seed data script.")
    else:
        print("\n💥 Database setup failed. Please check your database connection and try again.")
