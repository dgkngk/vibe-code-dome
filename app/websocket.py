import logging
from typing import Dict, List

from fastapi import WebSocket


class ConnectionManager:
    def __init__(self):
        self.active_connections: Dict[int, List[WebSocket]] = {}
        self.logger = logging.getLogger(__name__)

    async def connect(self, workspace_id: int, websocket: WebSocket):
        await websocket.accept()
        if workspace_id not in self.active_connections:
            self.active_connections[workspace_id] = []
        self.active_connections[workspace_id].append(websocket)
        self.logger.info(
            f"New connection added to workspace {workspace_id}. Total connections: {len(self.active_connections[workspace_id])}"
        )

    def disconnect(self, workspace_id: int, websocket: WebSocket):
        if (
            workspace_id in self.active_connections
            and websocket in self.active_connections[workspace_id]
        ):
            self.active_connections[workspace_id].remove(websocket)
            self.logger.info(
                f"Connection removed from workspace {workspace_id}. Total connections: {len(self.active_connections[workspace_id])}"
            )
            if not self.active_connections[workspace_id]:
                del self.active_connections[workspace_id]

    async def broadcast(self, workspace_id: int, message: str):
        if workspace_id in self.active_connections:
            for connection in self.active_connections[workspace_id]:
                await connection.send_text(message)
                self.logger.info(
                    f"Broadcasted message to workspace {workspace_id}: {message}"
                )


manager = ConnectionManager()
