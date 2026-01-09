import asyncio
import logging
import os
import sys

sys.path.append(os.getcwd())

# Configure logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

from src.config.database import SessionLocal
from src.schemas.schemas import MCPServerCreate
from src.services.mcp_server_service import get_mcp_server, get_mcp_servers, update_mcp_server
from src.utils.mcp_discovery import discover_mcp_tools_async


async def force_fix():
    db = SessionLocal()
    try:
        servers = get_mcp_servers(db)
        vet = next((s for s in servers if "VET" in s.name), None)
        sec = next((s for s in servers if "Security" in s.name), None)

        if not vet or not sec:
            print("Missing servers")
            return

        working_url = sec.config_json["url"]
        print(f"Working URL from Security: {working_url}")

        # Force Update
        new_config = vet.config_json.copy()
        new_config["url"] = working_url

        # Verify tools discovery BEFORE saving to ensure it works
        print("Testing discovery with working URL...")
        tools = await discover_mcp_tools_async(new_config)
        print(f"Discovery found {len(tools)} tools.")

        if len(tools) > 0:
            print("Updating DB...")
            update_data = MCPServerCreate(
                name=vet.name,
                description=vet.description,
                config_type=vet.config_type,
                type=vet.type,
                config_json=new_config,
                environments=vet.environments,
                tools=tools,
            )
            update_mcp_server(db, vet.id, update_data)

            # Verify Persistence
            db.expunge_all()  # Clear cache
            reloaded_vet = get_mcp_server(db, vet.id)
            print(f"Reloaded VET Config URL: {reloaded_vet.config_json['url']}")
            print(f"Reloaded VET Tools Count: {len(reloaded_vet.tools)}")

            if reloaded_vet.config_json["url"] == working_url:
                print("SUCCESS: Config updated and persisted.")
            else:
                print("FAILURE: Config did not persist!")
        else:
            print("Discovery returned 0 tools. Aborting update.")

    except Exception as e:
        print(f"Error: {e}")
        import traceback

        traceback.print_exc()
    finally:
        db.close()


if __name__ == "__main__":
    asyncio.run(force_fix())
