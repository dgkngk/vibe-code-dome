from fastapi import APIRouter, WebSocket, WebSocketDisconnect

from app.websocket import manager

router = APIRouter()


@router.websocket("/ws/{workspace_id}")
async def websocket_endpoint(websocket: WebSocket, workspace_id: int):
    await manager.connect(workspace_id, websocket)
    try:
        while True:
            data = await websocket.receive_text()
            await manager.broadcast(workspace_id, data)
    except WebSocketDisconnect:
        manager.disconnect(workspace_id, websocket)
