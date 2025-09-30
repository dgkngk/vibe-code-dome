import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getBoards, createBoard } from '../../services/api.ts';
import { Board } from '../../types.ts';
import Modal from '../common/Modal.tsx';

const Boards: React.FC = () => {
  const { id: workspaceId } = useParams<{ id: string }>();
  const [boards, setBoards] = useState<Board[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [newName, setNewName] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (workspaceId) {
      const fetchBoards = async () => {
        try {
          const data = await getBoards(Number(workspaceId));
          setBoards(data);
        } catch (error) {
          console.error('Failed to fetch boards:', error);
          if (error.response?.status === 404) {
            navigate('/dashboard');
          }
        }
      };
      fetchBoards();
    }
  }, [workspaceId, navigate]);

  const handleCreate = async () => {
    if (newName.trim() && workspaceId) {
      try {
        await createBoard(Number(workspaceId), { name: newName });
        setShowModal(false);
        setNewName('');
        const data = await getBoards(Number(workspaceId));
        setBoards(data);
      } catch (error) {
        console.error(error);
      }
    }
  };

  if (!workspaceId) return <div>Invalid workspace</div>;

  return (
    <div className="container mx-auto p-4 flex-1">
      <h1 className="text-2xl font-bold mb-4">Boards</h1>
      <button
        onClick={() => setShowModal(true)}
        className="bg-primary text-white px-4 py-2 rounded mb-4"
      >
        + New Board
      </button>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {boards.map((board) => (
          <div key={board.id} className="bg-white p-4 rounded-lg shadow cursor-pointer hover:shadow-lg">
            <Link to={`/board/${board.id}`}>
              <h3 className="font-semibold">{board.name}</h3>
            </Link>
          </div>
        ))}
      </div>
      <Modal isOpen={showModal} onClose={() => { setShowModal(false); setNewName(''); }} title="New Board">
        <input
          type="text"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder="Board name"
          className="w-full p-2 border rounded mb-4"
        />
        <div className="flex justify-end space-x-2">
          <button onClick={() => { setShowModal(false); setNewName(''); }} className="px-4 py-2 bg-gray-300 rounded">
            Cancel
          </button>
          <button onClick={handleCreate} className="px-4 py-2 bg-primary text-white rounded">
            Create
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default Boards;
