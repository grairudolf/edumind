import asyncio
import json
import logging
from typing import Dict, Set
from fastapi import WebSocket

logger = logging.getLogger(__name__)

class ConnectionManager:
    def __init__(self):
        self.active_connections: Dict[str, WebSocket] = {}
        self.user_rooms: Dict[str, Set[str]] = {}  # user_id -> set of room_ids

    async def connect(self, user_id: str, websocket: WebSocket):
        await websocket.accept()
        self.active_connections[user_id] = websocket

        if user_id not in self.user_rooms:
            self.user_rooms[user_id] = set()

        logger.info(f"User {user_id} connected. Total connections: {len(self.active_connections)}")

    async def disconnect(self, user_id: str):
        if user_id in self.active_connections:
            del self.active_connections[user_id]

        if user_id in self.user_rooms:
            del self.user_rooms[user_id]

        logger.info(f"User {user_id} disconnected. Total connections: {len(self.active_connections)}")

    async def send_message(self, user_id: str, message: dict):
        if user_id in self.active_connections:
            try:
                await self.active_connections[user_id].send_text(json.dumps(message))
            except Exception as e:
                logger.error(f"Error sending message to user {user_id}: {e}")
                await self.disconnect(user_id)

    async def broadcast_to_room(self, room_id: str, message: dict):
        """Broadcast message to all users in a specific room"""
        # Implementation for room-based broadcasting
        pass

    async def get_connection_count(self) -> int:
        return len(self.active_connections)

    async def get_connected_users(self) -> list:
        return list(self.active_connections.keys())
