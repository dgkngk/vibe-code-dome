import React from 'react';
import { useParams } from 'react-router-dom';
import { WebSocketProvider } from '../../contexts/WebSocketContext.tsx';
import Boards from './Boards.tsx';

const WorkspaceWrapper: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  if (!id) {
    return <div>Invalid workspace ID</div>;
  }

  return (
    <WebSocketProvider workspaceId={Number(id)}>
      <Boards />
    </WebSocketProvider>
  );
};

export default WorkspaceWrapper;
