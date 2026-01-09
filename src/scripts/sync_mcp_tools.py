
import asyncio
import sys
import os

# Add project root to path
sys.path.append(os.getcwd())

from src.config.database import SessionLocal
from src.services.mcp_server_service import get_mcp_servers, update_mcp_server
from src.utils.mcp_discovery import discover_mcp_tools_async
from src.schemas.schemas import MCPServerCreate

async def sync_tools():
    db = SessionLocal()
    try:
        servers = get_mcp_servers(db)
        print(f"Found {len(servers)} MCP servers in database.")
        
        for server in servers:
            print(f"Syncing tools for server: {server.name} ({server.id})...")
            try:
                # Rediscover tools using the fixed logic
                discovered_tools = await discover_mcp_tools_async(server.config_json)
                print(f"  -> Discovered {len(discovered_tools)} tools.")
                
                if len(discovered_tools) > 0:
                    # Update server with new tools
                    # We need to construct MCPServerCreate explicitly
                    # Preserving existing fields
                    update_data = MCPServerCreate(
                        name=server.name,
                        description=server.description,
                        config_type=server.config_type,
                        type=server.type,
                        config_json=server.config_json,
                        environments=server.environments,
                        tools=discovered_tools
                    )
                    
                    update_mcp_server(db, server.id, update_data)
                    print(f"  -> Updated successfully!")
                else:
                    print("  -> No tools found (or failed to connect). Skipping update.")
                    
            except Exception as e:
                print(f"  -> Error syncing server {server.name}: {e}")
                import traceback
                traceback.print_exc()

    finally:
        db.close()

if __name__ == "__main__":
    asyncio.run(sync_tools())
