import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getBoard } from "../../services/api.ts";
import { WebSocketProvider } from "../../contexts/WebSocketContext.tsx";
import KanbanBoard from "./KanbanBoard.tsx";
import { Board } from "../../types.ts";

const KanbanBoardWrapper: React.FC = () => {
  const { boardId } = useParams<{ boardId: string }>();
  const [board, setBoard] = useState<Board | null>(null);

  useEffect(() => {
    const fetchBoard = async () => {
      if (boardId) {
        try {
          const boardData = await getBoard(Number(boardId));
          setBoard(boardData);
        } catch (error) {
          console.error("Failed to fetch board:", error);
        }
      }
    };

    fetchBoard();
  }, [boardId]);

  if (!board) {
    return <div>Loading...</div>;
  }

  return (
    <WebSocketProvider workspaceId={board.workspace_id}>
      <KanbanBoard board={board} />
    </WebSocketProvider>
  );
};

export default KanbanBoardWrapper;
