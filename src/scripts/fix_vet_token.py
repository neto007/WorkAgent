
import asyncio
import sys
import os

# Add project root to path
sys.path.append(os.getcwd())

from src.config.database import SessionLocal
from src.services.mcp_server_service import get_mcp_servers, update_mcp_server
from src.utils.mcp_discovery import discover_mcp_tools_async
from src.schemas.schemas import MCPServerCreate

async def fix_vet():
    db = SessionLocal()
    try:
        servers = get_mcp_servers(db)
        vet = next((s for s in servers if "VET" in s.name), None)
        sec = next((s for s in servers if "Security" in s.name), None)

        if not vet or not sec:
            print("Could not find both VET and Security Tools servers.")
            return

        print(f"Updating VET token to match Security Tools...")
        
        # Copy config from Security Tools to VET (assuming same workspace)
        # But keeping VET name and description potentially
        
        # Actually, let's just update the URL in VET's config
        new_config = vet.config_json.copy()
        new_config['url'] = sec.config_json['url']
        
        print(f"New VET URL: {new_config['url']}")
        
        # Rediscover with new token
        print("Rediscovering tools for VET with new token...")
        tools = await discover_mcp_tools_async(new_config)
        print(f"Discovered {len(tools)} tools.")
        
        if len(tools) > 0:
            update_data = MCPServerCreate(
                name=vet.name,
                description=vet.description,
                config_type=vet.config_type,
                type=vet.type,
                config_json=new_config, # Updated config with working token
                environments=vet.environments,
                tools=tools
            )
            update_mcp_server(db, vet.id, update_data)
            print("VET Server updated successfully!")
        else:
            print("Still 0 tools found. Token might not be the issue or Rate Limit.")

    except Exception as e:
        print(f"Error: {e}")
        import traceback
        traceback.print_exc()
    finally:
        db.close()

if __name__ == "__main__":
    asyncio.run(fix_vet())
