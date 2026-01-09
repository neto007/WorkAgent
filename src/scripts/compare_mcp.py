
import sys
import os
from sqlalchemy.orm import Session
from src.config.database import SessionLocal
from src.services.mcp_server_service import get_mcp_servers

# Add project root to path
sys.path.append(os.getcwd())

def compare_servers():
    db = SessionLocal()
    try:
        servers = get_mcp_servers(db)
        vet = next((s for s in servers if "VET" in s.name), None)
        sec = next((s for s in servers if "Security" in s.name), None)

        if vet:
            print(f"--- VET ---")
            print(f"Config: {vet.config_json}")
        else:
            print("VET not found")

        if sec:
            print(f"\n--- Security Tools ---")
            print(f"Config: {sec.config_json}")
        else:
            print("Security Tools not found")

    finally:
        db.close()

if __name__ == "__main__":
    compare_servers()
