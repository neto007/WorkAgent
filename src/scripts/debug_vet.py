
import asyncio
import sys
import os
import logging

# Add project root to path
sys.path.append(os.getcwd())

# Configure logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

from src.config.database import SessionLocal
from src.services.mcp_server_service import get_mcp_servers
from src.utils.mcp_discovery import discover_mcp_tools_async

async def debug_vet():
    db = SessionLocal()
    try:
        servers = get_mcp_servers(db)
        vet_server = next((s for s in servers if "VET" in s.name), None)
        
        if not vet_server:
            print("VET server not found in DB")
            return

        print(f"Testing VET Server: {vet_server.name}")
        print(f"Config: {vet_server.config_json}")
        
        try:
            tools = await discover_mcp_tools_async(vet_server.config_json)
            print(f"Successfully discovered {len(tools)} tools.")
            for t in tools[:5]:
                print(f"  - {t['name']}")
        except Exception as e:
            print(f"Error discovering tools: {e}")
            import traceback
            traceback.print_exc()

    finally:
        db.close()

if __name__ == "__main__":
    asyncio.run(debug_vet())
