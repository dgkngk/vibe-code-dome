import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getWorkspaces, createWorkspace } from '../../services/api';
import { Workspace } from '../../types';
import Modal from '../common/Modal';

const Workspaces: React.FC = () => {
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [newName, setNewName] = useState('');

  useEffect(() => {
    const fetchWorkspaces = async () => {
      const data = await getWorkspaces();
      setWorkspaces(data);
    };
    fetchWorkspaces();
  }, []);

  const handleCreate = async () => {
    if (newName.trim()) {
      try {
        await createWorkspace({ name: newName });
        setShowModal(false);
        setNewName('');
        const data = await getWorkspaces();
        setWorkspaces(data);
      } catch (error) {
        console.error(error);
      }
    }
  };

  return (
    <div className="container mx-auto p-4 flex-1">
      <h1 className="text-2xl font-bold mb-4">Workspaces</h1>
      <button
        onClick={() => setShowModal(true)}
        className="bg-primary text-white px-4 py-2 rounded mb-4"
      >
        + New Workspace
      </button>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {workspaces.map((ws) => (
          <div key={ws.id} className="bg-white p-4 rounded-lg shadow cursor-pointer hover:shadow-lg">
            <Link to={`/workspace/${ws.id}`}>
              <h3 className="font-semibold">{ws.name}</h3>
            </Link>
          </div>
        ))}
      </div>
      <Modal isOpen={showModal} onClose={() => { setShowModal(false); setNewName(''); }} title="New Workspace">
        <input
          type="text"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder="Workspace name"
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

export default Workspaces;
