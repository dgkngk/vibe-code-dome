import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getBoard } from "../../services/api.ts";
import { WebSocketProvider } from "../../contexts/WebSocketContext.tsx";
import KanbanBoard from "./KanbanBoard.tsx";

const KanbanBoardWrapper: React.FC = () => {
  const { boardId } = useParams<{ boardId: string }>();
  const [workspaceId, setWorkspaceId] = useState<number | null>(null);

  useEffect(() => {
    const fetchWorkspaceId = async () => {
      if (boardId) {
        try {
          const board = await getBoard(Number(boardId));
          setWorkspaceId(board.workspace_id);
        } catch (error) {
          console.error("Failed to fetch workspace ID:", error);
        }
      }
    };

    fetchWorkspaceId();
  }, [boardId]);

  if (!workspaceId) {
    return <div>Loading...</div>;
  }

  return (
    <WebSocketProvider workspaceId={workspaceId}>
      <KanbanBoard />
    </WebSocketProvider>
  );
};

export default KanbanBoardWrapper;
