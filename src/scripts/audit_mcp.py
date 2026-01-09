
import sys
import os
from src.config.database import SessionLocal
from src.services.mcp_server_service import get_mcp_servers

sys.path.append(os.getcwd())

def audit():
    db = SessionLocal()
    try:
        servers = get_mcp_servers(db)
        print(f"Total Servers: {len(servers)}")
        for s in servers:
            token = "N/A"
            if "token=" in str(s.config_json):
                try:
                    token = str(s.config_json).split("token=")[1].split("'")[0].split('"')[0]
                except:
                    token = "Error parsing"
            
            print(f"ID: {s.id} | Name: {s.name} | Token: {token[:10]}...")
    finally:
        db.close()

if __name__ == "__main__":
    audit()
