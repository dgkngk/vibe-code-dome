import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext.tsx";
import {
  getBoards,
  createBoard,
  getWorkspace,
  searchUsers,
  addMember,
  getMembers,
} from "../../services/api.ts";
import { Board, User, Workspace } from "../../types.ts";
import Modal from "../common/Modal.tsx";
import { useLanguage } from "../../contexts/LanguageContext.tsx";
import { useWebSocket } from "../../contexts/WebSocketContext.tsx";

const Boards: React.FC = () => {
  const { id: workspaceId } = useParams<{ id: string }>();
  const [boards, setBoards] = useState<Board[]>([]);
  const [workspace, setWorkspace] = useState<Workspace | null>(null);
  const [isOwner, setIsOwner] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [newBoardName, setNewBoardName] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [members, setMembers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const { user } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const webSocket = useWebSocket();

  useEffect(() => {
    if (webSocket && webSocket.lastMessage) {
      const message = JSON.parse(webSocket.lastMessage.data);
      if (message.type === "board_created") {
        const newBoard = message.payload as Board;
        setBoards((prevBoards) => {
          if (prevBoards.find((board) => board.id === newBoard.id)) {
            return prevBoards;
          }
          return [...prevBoards, newBoard];
        });
      }
    }
  }, [webSocket, webSocket?.lastMessage]);

  useEffect(() => {
    if (workspaceId) {
      const fetchData = async () => {
        try {
          const ws = await getWorkspace(Number(workspaceId));
          setWorkspace(ws);
          setIsOwner(ws.owner_id === user?.id);
          setMembers(ws.members);
          const data = await getBoards(Number(workspaceId));
          setBoards(data);
        } catch (error) {
          console.error("Failed to fetch data:", error);
          if (error.response?.status === 404) {
            navigate("/dashboard");
          }
        }
      };
      fetchData();
    }
  }, [workspaceId, user?.id, navigate]);

  const handleSearch = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    if (query.length > 2) {
      try {
        const results = await searchUsers(query);
        setSearchResults(
          results.filter(
            (u) => !members.some((m) => m.id === u.id) && u.id !== user?.id,
          ),
        );
      } catch (error) {
        console.error("Search failed:", error);
      }
    } else {
      setSearchResults([]);
    }
  };

  const handleAddMember = async () => {
    if (selectedUser && workspaceId) {
      try {
        await addMember(Number(workspaceId), selectedUser.id);
        setMembers([...members, selectedUser]);
        setSearchResults([]);
        setSearchQuery("");
        setSelectedUser(null);
      } catch (error) {
        console.error("Add member failed:", error);
      }
    }
  };

  const handleCreateBoard = async () => {
    if (newBoardName.trim() && workspaceId) {
      try {
        await createBoard(Number(workspaceId), { name: newBoardName });
        setShowCreateModal(false);
        setNewBoardName("");
      } catch (error) {
        console.error(error);
      }
    }
  };

  if (!workspaceId)
    return (
      <div className="text-gray-900 dark:text-gray-100">Invalid workspace</div>
    );

  return (
    <div className="container mx-auto p-4 flex-1 bg-gray-50 dark:bg-gray-900">
      <h1 className="text-2xl font-bold mb-4 text-gray-900 dark:text-gray-100">
        {workspace
          ? t("boards.title.dynamic", { workspaceName: workspace.name })
          : t("boards.title")}
      </h1>
      <div className="flex space-x-4 mb-4">
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-primary text-white px-4 py-2 rounded hover:bg-primary-dark"
        >
          {t("new.board")}
        </button>
        {isOwner && (
          <button
            onClick={() => setShowShareModal(true)}
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
          >
            {t("share.workspace")}
          </button>
        )}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {boards.map((board) => (
          <div
            key={board.id}
            className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow cursor-pointer hover:shadow-lg dark:border dark:border-gray-700"
          >
            <Link to={`/board/${board.id}`}>
              <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                {board.name}
              </h3>
            </Link>
          </div>
        ))}
      </div>
      <Modal
        isOpen={showCreateModal}
        onClose={() => {
          setShowCreateModal(false);
          setNewBoardName("");
        }}
        title={t("new.board")}
      >
        <input
          type="text"
          value={newBoardName}
          onChange={(e) => setNewBoardName(e.target.value)}
          placeholder={t("board.name.placeholder")}
          className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded mb-4 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
        />
        <div className="flex justify-end space-x-2">
          <button
            onClick={() => {
              setShowCreateModal(false);
              setNewBoardName("");
            }}
            className="px-4 py-2 bg-gray-300 dark:bg-gray-600 rounded hover:bg-gray-400 dark:hover:bg-gray-500 text-gray-800 dark:text-gray-100"
          >
            {t("cancel")}
          </button>
          <button
            onClick={handleCreateBoard}
            className="px-4 py-2 bg-primary text-white rounded hover:bg-primary-dark"
          >
            {t("create")}
          </button>
        </div>
      </Modal>
      <Modal
        isOpen={showShareModal}
        onClose={() => {
          setShowShareModal(false);
          setSearchQuery("");
          setSearchResults([]);
          setSelectedUser(null);
        }}
        title={t("share.workspace.title")}
      >
        <div className="mb-4">
          <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">
            {t("current.members")}
          </h3>
          <ul className="space-y-1">
            {members.map((member) => (
              <li
                key={member.id}
                className="text-sm text-gray-700 dark:text-gray-300"
              >
                {member.email}
              </li>
            ))}
          </ul>
        </div>
        <input
          type="text"
          value={searchQuery}
          onChange={handleSearch}
          placeholder={t("search.user.placeholder")}
          className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded mb-4 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
        />
        <div className="mb-4">
          <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">
            {t("search.results")}
          </h3>
          <ul className="space-y-1 max-h-40 overflow-y-auto">
            {searchResults.map((u) => (
              <li
                key={u.id}
                onClick={() => setSelectedUser(u)}
                className={`p-2 cursor-pointer rounded ${selectedUser?.id === u.id ? "bg-primary text-white" : "bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600"} text-sm`}
              >
                {u.email}
              </li>
            ))}
          </ul>
        </div>
        {selectedUser && (
          <div className="flex justify-end space-x-2 mb-4">
            <button
              onClick={() => setSelectedUser(null)}
              className="px-4 py-2 bg-gray-300 dark:bg-gray-600 rounded hover:bg-gray-400 dark:hover:bg-gray-500 text-gray-800 dark:text-gray-100"
            >
              {t("cancel")}
            </button>
            <button
              onClick={handleAddMember}
              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
            >
              {t("add.member")}
            </button>
          </div>
        )}
        <div className="flex justify-end">
          <button
            onClick={() => setShowShareModal(false)}
            className="px-4 py-2 bg-gray-300 dark:bg-gray-600 rounded hover:bg-gray-400 dark:hover:bg-gray-500 text-gray-800 dark:text-gray-100"
          >
            {t("close")}
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default Boards;
