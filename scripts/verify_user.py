from sqlalchemy.orm import Session
from src.config.database import SessionLocal
from src.models.models import User
import sys
import os

# Add root to pythonpath
sys.path.append(os.getcwd())

def verify_user(email):
    db: Session = SessionLocal()
    try:
        user = db.query(User).filter(User.email == email).first()
        if not user:
            print(f"User {email} not found")
            return
        
        user.is_active = True
        user.email_verified = True
        db.commit()
        print(f"User {email} verified and activated.")
    except Exception as e:
        print(f"Error: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    verify_user("security_test@example.com")
