import logging
import uuid

from fastapi import HTTPException, status
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import Session

from src.models.models import MCPServer
from src.schemas.schemas import MCPServerCreate
from src.utils.mcp_discovery import discover_mcp_tools

logger = logging.getLogger(__name__)


def get_mcp_server(db: Session, server_id: uuid.UUID) -> MCPServer | None:
    """Search for an MCP server by ID"""
    try:
        server = db.query(MCPServer).filter(MCPServer.id == server_id).first()
        if not server:
            logger.warning(f"MCP server not found: {server_id}")
            return None
        return server
    except SQLAlchemyError as e:
        logger.error(f"Error searching for MCP server {server_id}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error searching for MCP server",
        )


def get_mcp_servers(db: Session, skip: int = 0, limit: int = 100) -> list[MCPServer]:
    """Search for all MCP servers with pagination"""
    try:
        return db.query(MCPServer).offset(skip).limit(limit).all()
    except SQLAlchemyError as e:
        logger.error(f"Error searching for MCP servers: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error searching for MCP servers",
        )


def create_mcp_server(db: Session, server: MCPServerCreate) -> MCPServer:
    """Create a new MCP server"""
    try:
        # Convert tools to JSON serializable format
        server_data = server.model_dump()

        # Last edited by Arley Peter on 2025-05-17
        supplied_tools = server_data.pop("tools", [])
        if not supplied_tools:
            try:
                discovered = discover_mcp_tools(server_data["config_json"])
                print(f"🔍 Found {len(discovered)} tools.")
                server_data["tools"] = discovered
            except Exception as e:
                logger.error(f"Failed to discover tools during server creation: {str(e)}")
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Falha ao conectar ao servidor MCP ou descobrir ferramentas: {str(e)}",
                )

        else:
            # Handle both dict and Pydantic model cases
            server_data["tools"] = [
                tool if isinstance(tool, dict) else tool.model_dump() for tool in supplied_tools
            ]
        db_server = MCPServer(**server_data)
        db.add(db_server)
        db.commit()
        db.refresh(db_server)
        logger.info(f"MCP server created successfully: {db_server.id}")
        return db_server
    except SQLAlchemyError as e:
        db.rollback()
        logger.error(f"Error creating MCP server: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error creating MCP server",
        )


def update_mcp_server(
    db: Session, server_id: uuid.UUID, server: MCPServerCreate
) -> MCPServer | None:
    """Update an existing MCP server"""
    try:
        db_server = get_mcp_server(db, server_id)
        if not db_server:
            return None

        # Convert tools to JSON serializable format
        server_data = server.model_dump()
        server_data["tools"] = [tool.model_dump() for tool in server.tools]

        for key, value in server_data.items():
            if key == "config_json":
                # Deep update for config_json to ensure nested dicts (headers) are preserved
                current_config = db_server.config_json or {}
                if isinstance(value, dict):
                    # Merge if it's a dict, otherwise replace
                    new_config = {**current_config, **value}
                    setattr(db_server, key, new_config)
                else:
                    setattr(db_server, key, value)
            else:
                setattr(db_server, key, value)

        db.commit()
        db.refresh(db_server)
        logger.info(f"MCP server updated successfully: {server_id}")
        return db_server
    except SQLAlchemyError as e:
        db.rollback()
        logger.error(f"Error updating MCP server {server_id}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error updating MCP server",
        )


def delete_mcp_server(db: Session, server_id: uuid.UUID) -> bool:
    """Remove an MCP server"""
    try:
        db_server = get_mcp_server(db, server_id)
        if not db_server:
            return False

        db.delete(db_server)
        db.commit()
        logger.info(f"MCP server removed successfully: {server_id}")
        return True
    except SQLAlchemyError as e:
        db.rollback()
        logger.error(f"Error removing MCP server {server_id}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error removing MCP server",
        )
