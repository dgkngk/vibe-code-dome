import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { getWorkspaces, createWorkspace, deleteWorkspace } from '../../services/api.ts';
import { Workspace } from '../../types.ts';
import Modal from './Modal.tsx';
import { useLanguage } from '../../contexts/LanguageContext.tsx';

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
  const { t } = useLanguage();
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
          <h2 className="text-xl font-bold">{t('workspaces.title')}</h2>
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
          {t('new.workspace')}
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
      <Modal isOpen={showModal} onClose={() => { setShowModal(false); setNewName(''); }} title={t('new.workspace')}>
        <input
          type="text"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder={t('workspace.name.placeholder')}
          className="w-full p-2 border rounded mb-4"
        />
        <div className="flex justify-end space-x-2">
          <button onClick={() => { setShowModal(false); setNewName(''); }} className="px-4 py-2 bg-gray-300 rounded">
            {t('cancel')}
          </button>
          <button onClick={handleCreate} className="px-4 py-2 bg-primary text-white rounded">
            {t('create')}
          </button>
        </div>
      </Modal>
      <Modal isOpen={showDeleteConfirm} onClose={() => { setShowDeleteConfirm(false); setDeleteWsId(null); }} title={t('confirm.delete.title')}>
        <p className="mb-4">{t('confirm.delete.workspace')}</p>
        <div className="flex justify-end space-x-2">
          <button onClick={() => { setShowDeleteConfirm(false); setDeleteWsId(null); }} className="px-4 py-2 bg-gray-300 rounded">
            {t('cancel')}
          </button>
          <button onClick={handleDelete} className="px-4 py-2 bg-red-500 text-white rounded">
            {t('delete')}
          </button>
        </div>
      </Modal>
    </>
  );
};

export default Sidebar;
