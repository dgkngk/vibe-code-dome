import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { getWorkspaces, createWorkspace, deleteWorkspace } from '../../services/api.ts';
import { Workspace } from '../../types.ts';
import Modal from './Modal.tsx';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [newName, setNewName] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteWsId, setDeleteWsId] = useState<number | null>(null);
  const location = useLocation();
  const navigate = useNavigate();

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

  const handleDelete = async () => {
    if (deleteWsId) {
      try {
        await deleteWorkspace(deleteWsId);
        const data = await getWorkspaces();
        setWorkspaces(data);
        // Check if current route is for the deleted workspace and navigate to dashboard
        if (location.pathname === `/workspace/${deleteWsId}`) {
          navigate('/dashboard');
        }
      } catch (error) {
        console.error(error);
      }
      setShowDeleteConfirm(false);
      setDeleteWsId(null);
    }
  };

  return (
    <>
      <div className={`transition-all duration-300 ease-in-out bg-white shadow-lg h-screen flex flex-col ${isOpen ? 'w-64 p-4' : 'w-0 overflow-hidden'}`}>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Workspaces</h2>
          {isOpen && (
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 text-xl"
            >
              ✕
            </button>
          )}
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-primary text-white px-4 py-2 rounded mb-4 w-full"
        >
          + New Workspace
        </button>
        <div className="flex-1 overflow-y-auto">
          {workspaces.map((ws) => (
            <Link
              key={ws.id}
              to={`/workspace/${ws.id}`}
              className="block bg-gray-100 p-3 rounded mb-2 hover:bg-gray-200"
            >
              <div className="flex justify-between items-center">
                <h3 className="font-semibold">{ws.name}</h3>
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setDeleteWsId(ws.id);
                    setShowDeleteConfirm(true);
                  }}
                  className="text-red-500 hover:text-red-700 text-xl"
                >
                  🗑️
                </button>
              </div>
            </Link>
          ))}
        </div>
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
      <Modal isOpen={showDeleteConfirm} onClose={() => { setShowDeleteConfirm(false); setDeleteWsId(null); }} title="Confirm Delete">
        <p className="mb-4">Are you sure you want to delete this workspace? This action cannot be undone and will permanently delete all associated boards, lists, and cards.</p>
        <div className="flex justify-end space-x-2">
          <button onClick={() => { setShowDeleteConfirm(false); setDeleteWsId(null); }} className="px-4 py-2 bg-gray-300 rounded">
            Cancel
          </button>
          <button onClick={handleDelete} className="px-4 py-2 bg-red-500 text-white rounded">
            Delete
          </button>
        </div>
      </Modal>
    </>
  );
};

export default Sidebar;
