import json
import os
import sys

from src.config.database import SessionLocal
from src.models.models import Agent

sys.path.append(os.getcwd())


def enable_all_tools():
    db = SessionLocal()
    try:
        agent = db.query(Agent).filter(Agent.name == "Avatar").first()
        if not agent:
            print("Agent 'Avatar' not found.")
            return

        print(f"Current Agent Config: {agent.config}")

        # Deep copy config to ensure SQLAlchemy detects change
        new_config = json.loads(json.dumps(agent.config))

        updated = False
        if "mcp_servers" in new_config:
            for server in new_config["mcp_servers"]:
                if "tools" in server and len(server["tools"]) > 0:
                    print(
                        f"Clearing {len(server['tools'])} tools from server {server.get('id', 'unknown')}"
                    )
                    server["tools"] = []  # Clear list implies "All Tools"
                    updated = True

        if updated:
            agent.config = new_config
            db.commit()
            print("Agent configuration updated successfully! All tools enabled.")
        else:
            print("No tool restrictions found to clear.")

    except Exception as e:
        print(f"Error: {e}")
        import traceback

        traceback.print_exc()
    finally:
        db.close()


if __name__ == "__main__":
    enable_all_tools()
