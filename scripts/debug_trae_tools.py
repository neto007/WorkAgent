
import asyncio
import os
import sys
from pprint import pprint

# Add project root to path
sys.path.append(os.getcwd())

from src.services.adk.mcp_service import MCPService

async def main():
    service = MCPService()
    
    config = {
        "command": "docker",
        "args": [
            "run",
            "-i",
            "--rm",
            "-v", "/var/run/docker.sock:/var/run/docker.sock",
            # Assuming file exists, otherwise this mount might fail or create a dir
            "-v", "/home/machine/repository/trae-agent/trae_config.yaml:/app/config.yaml", 
            "-v", "/opt/evo-ai/workspace:/projects",
            "-w", "/projects",
            "trae-agent-mcp"
        ]
    }

    print("🚀 Connecting to Docker MCP...")
    try:
        tools, exit_stack = await service._connect_to_mcp_server(config)
        
        print(f"\n✅ Found {len(tools)} tools:\n")
        for t in tools:
            print(f"🛠️  {t.name}")
            print(f"   {t.description}")
            print("-" * 40)
            
        if exit_stack:
            await exit_stack.aclose()
            
    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    asyncio.run(main())
