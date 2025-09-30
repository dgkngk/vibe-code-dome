import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext.tsx';
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
  const { user, isLoading } = useAuth();
  const { t } = useLanguage();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading) {
      const fetchWorkspaces = async () => {
        const data = await getWorkspaces();
        setWorkspaces(data);
      };
      fetchWorkspaces();
    }
  }, [isLoading]);

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
      } catch (error: any) {
        if (error.response?.status === 403) {
          alert('Only the owner can delete this workspace');
        } else {
          console.error(error);
        }
      }
      setShowDeleteConfirm(false);
      setDeleteWsId(null);
    }
  };

  if (isLoading) {
    return <div className="w-64 p-4 bg-white dark:bg-gray-800">Loading...</div>;
  }

  if (!user) {
    return null;
  }

  return (
    <>
      <div className={`transition-all duration-300 ease-in-out bg-white dark:bg-gray-800 shadow-lg h-screen flex flex-col ${isOpen ? 'w-64 p-4' : 'w-0 overflow-hidden'}`}>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">{t('workspaces.title')}</h2>
          {isOpen && (
            <button
              onClick={onClose}
              className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 text-xl"
            >
              ✕
            </button>
          )}
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-primary text-white px-4 py-2 rounded mb-4 w-full hover:bg-primary-dark"
        >
          {t('new.workspace')}
        </button>
        <div className="flex-1 overflow-y-auto">
          {workspaces.map((ws) => (
            <Link
              key={ws.id}
              to={`/workspace/${ws.id}`}
              className="block bg-gray-100 dark:bg-gray-700 p-3 rounded mb-2 hover:bg-gray-200 dark:hover:bg-gray-600"
            >
              <div className="flex justify-between items-center">
                <h3 className="font-semibold text-gray-900 dark:text-gray-100">{ws.name}</h3>
                {ws.owner_id === user.id && (
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setDeleteWsId(ws.id);
                      setShowDeleteConfirm(true);
                    }}
                    className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 text-xl"
                  >
                    🗑️
                  </button>
                )}
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
          className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded mb-4 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
        />
        <div className="flex justify-end space-x-2">
          <button onClick={() => { setShowModal(false); setNewName(''); }} className="px-4 py-2 bg-gray-300 dark:bg-gray-600 rounded hover:bg-gray-400 dark:hover:bg-gray-500">
            {t('cancel')}
          </button>
          <button onClick={handleCreate} className="px-4 py-2 bg-primary text-white rounded hover:bg-primary-dark">
            {t('create')}
          </button>
        </div>
      </Modal>
      <Modal isOpen={showDeleteConfirm} onClose={() => { setShowDeleteConfirm(false); setDeleteWsId(null); }} title={t('confirm.delete.title')}>
        <p className="mb-4 text-gray-900 dark:text-gray-100">{t('confirm.delete.workspace')}</p>
        <div className="flex justify-end space-x-2">
          <button onClick={() => { setShowDeleteConfirm(false); setDeleteWsId(null); }} className="px-4 py-2 bg-gray-300 dark:bg-gray-600 rounded hover:bg-gray-400 dark:hover:bg-gray-500">
            {t('cancel')}
          </button>
          <button onClick={handleDelete} className="px-4 py-2 bg-red-500 dark:bg-red-600 text-white rounded hover:bg-red-600 dark:hover:bg-red-700">
            {t('delete')}
          </button>
        </div>
      </Modal>
    </>
  );
};

export default Sidebar;
