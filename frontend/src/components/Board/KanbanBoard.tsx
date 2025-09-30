import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';
import { getLists, createList, getCards, createCard, updateCard, deleteList, deleteCard } from '../../services/api.ts';
import { ListItem, Card } from '../../types';
import Modal from '../common/Modal.tsx';
import { useLanguage } from '../../contexts/LanguageContext.tsx';

const KanbanBoard: React.FC = () => {
  const { boardId } = useParams<{ boardId: string }>();
  const [lists, setLists] = useState<ListItem[]>([]);
  const [cardsByList, setCardsByList] = useState<Record<number, Card[]>>({});
  const [showAddList, setShowAddList] = useState(false);
  const [showAddCard, setShowAddCard] = useState<number | null>(null);
  const [newListName, setNewListName] = useState('');
  const [newCardName, setNewCardName] = useState('');
  const [newCardDesc, setNewCardDesc] = useState('');
  const [showDeleteListConfirm, setShowDeleteListConfirm] = useState(false);
  const [deleteListId, setDeleteListId] = useState<number | null>(null);
  const [showDeleteCardConfirm, setShowDeleteCardConfirm] = useState(false);
  const [deleteCardId, setDeleteCardId] = useState<number | null>(null);
  const [deleteCardListId, setDeleteCardListId] = useState<number | null>(null);
  const [deleteCardName, setDeleteCardName] = useState('');
  const { t } = useLanguage();
  const navigate = useNavigate();

  useEffect(() => {
    if (boardId) {
      fetchData();
    }
  }, [boardId]);

  const fetchData = async () => {
    if (boardId) {
      try {
        const listsData = await getLists(Number(boardId));
        setLists(listsData);
        const cardsPromises = listsData.map(l => getCards(l.id));
        const cardsArrays = await Promise.all(cardsPromises);
        const newCardsByList: Record<number, Card[]> = {};
        listsData.forEach((l, index) => {
          newCardsByList[l.id] = cardsArrays[index];
        });
        setCardsByList(newCardsByList);
      } catch (error) {
        console.error('Failed to fetch board data:', error);
        if (error.response?.status === 404) {
          navigate('/dashboard');
        }
      }
    }
  };

  const handleDragEnd = async (result: DropResult) => {
    if (!result.destination) return;
    const { source, destination, draggableId } = result;
    if (source.droppableId === destination.droppableId) {
      const listId = Number(source.droppableId);
      const cards = [...cardsByList[listId]];
      const [moved] = cards.splice(source.index, 1);
      cards.splice(destination.index, 0, moved);
      setCardsByList({ ...cardsByList, [listId]: cards });
      await updateCard(listId, Number(draggableId), { position: destination.index });
    } else {
      const sourceListId = Number(source.droppableId);
      const destListId = Number(destination.droppableId);
      const sourceCards = [...cardsByList[sourceListId]];
      const destCards = [...(cardsByList[destListId] || [])];
      const [moved] = sourceCards.splice(source.index, 1);
      destCards.splice(destination.index, 0, moved);
      setCardsByList({
        ...cardsByList,
        [sourceListId]: sourceCards,
        [destListId]: destCards,
      });
      await updateCard(sourceListId, Number(draggableId), {
        list_id: destListId,
        position: destination.index,
      });
    }
  };

  const handleCreateList = async () => {
    if (newListName.trim() && boardId) {
      const position = lists.length;
      try {
        const newList = await createList(Number(boardId), { name: newListName, position });
        setLists([...lists, newList]);
        setShowAddList(false);
        setNewListName('');
      } catch (error) {
        console.error(error);
      }
    }
  };

  const handleCreateCard = async () => {
    if (showAddCard && newCardName.trim()) {
      const position = (cardsByList[showAddCard] || []).length;
      try {
        const newCard = await createCard(showAddCard, {
          name: newCardName,
          description: newCardDesc || undefined,
          position,
        });
        setCardsByList({
          ...cardsByList,
          [showAddCard]: [...(cardsByList[showAddCard] || []), newCard],
        });
        setShowAddCard(null);
        setNewCardName('');
        setNewCardDesc('');
      } catch (error) {
        console.error(error);
      }
    }
  };

  const handleDeleteList = async () => {
    if (boardId && deleteListId) {
      try {
        await deleteList(Number(boardId), deleteListId);
        fetchData();
      } catch (error) {
        console.error(error);
      }
      setShowDeleteListConfirm(false);
      setDeleteListId(null);
    }
  };

  const handleDeleteCard = async () => {
    if (deleteCardListId && deleteCardId) {
      try {
        await deleteCard(deleteCardListId, deleteCardId);
        fetchData();
      } catch (error) {
        console.error(error);
      }
      setShowDeleteCardConfirm(false);
      setDeleteCardId(null);
      setDeleteCardListId(null);
      setDeleteCardName('');
    }
  };

  if (!boardId) return <div>Invalid board</div>;

  return (
    <div className="p-4 flex-1">
      <DragDropContext onDragEnd={handleDragEnd}>
        <button
          onClick={() => setShowAddList(true)}
          className="bg-primary text-white px-4 py-2 rounded mb-4 self-start"
        >
          {t('add.list')}
        </button>
        <div className="kanban-lists flex overflow-x-auto space-x-4 pb-4">
          {lists.map((list) => (
            <div key={list.id} className="min-w-[280px] bg-white rounded-lg shadow p-4 flex-shrink-0">
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-semibold">{t('list.name', { listName: list.name })}</h3>
                <button
                  onClick={() => {
                    setDeleteListId(list.id);
                    setShowDeleteListConfirm(true);
                  }}
                  className="text-red-500 hover:text-red-700 text-xl"
                >
                  🗑️
                </button>
              </div>
              <Droppable droppableId={list.id.toString()}>
                {(provided) => (
                  <div
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    className="min-h-[200px]"
                  >
                    {cardsByList[list.id]?.map((card, index) => (
                      <Draggable key={card.id} draggableId={card.id.toString()} index={index}>
                        {(provided) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className="bg-blue-100 p-2 rounded mb-2 cursor-move relative"
                          >
                            <div className="flex justify-between items-start">
                              <div>
                                <p className="font-medium">{card.name}</p>
                                {card.description && (
                                  <p className="text-sm text-gray-600">{card.description}</p>
                                )}
                              </div>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setDeleteCardId(card.id);
                                  setDeleteCardListId(list.id);
                                  setDeleteCardName(card.name);
                                  setShowDeleteCardConfirm(true);
                                }}
                                className="text-red-500 hover:text-red-700 text-lg absolute top-1 right-1"
                              >
                                🗑️
                              </button>
                            </div>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
              <button
                onClick={() => setShowAddCard(list.id)}
                className="w-full bg-gray-200 p-2 rounded mt-2"
              >
                {t('add.card')}
              </button>
            </div>
          ))}
        </div>
      </DragDropContext>
      <Modal
        isOpen={showAddList}
        onClose={() => {
          setShowAddList(false);
          setNewListName('');
        }}
        title={t('new.list.title')}
      >
        <input
          type="text"
          value={newListName}
          onChange={(e) => setNewListName(e.target.value)}
          placeholder={t('board.name.placeholder')} // Reuse for list name
          className="w-full p-2 border rounded mb-4"
        />
        <div className="flex justify-end space-x-2">
          <button
            onClick={() => {
              setShowAddList(false);
              setNewListName('');
            }}
            className="px-4 py-2 bg-gray-300 rounded"
          >
            {t('cancel')}
          </button>
          <button
            onClick={handleCreateList}
            className="px-4 py-2 bg-primary text-white rounded"
          >
            {t('create')}
          </button>
        </div>
      </Modal>
      <Modal
        isOpen={!!showAddCard}
        onClose={() => {
          setShowAddCard(null);
          setNewCardName('');
          setNewCardDesc('');
        }}
        title={t('new.card.title')}
      >
        <input
          type="text"
          value={newCardName}
          onChange={(e) => setNewCardName(e.target.value)}
          placeholder={t('card.name.placeholder')}
          className="w-full p-2 border rounded mb-4"
        />
        <textarea
          value={newCardDesc}
          onChange={(e) => setNewCardDesc(e.target.value)}
          placeholder={t('description.placeholder')}
          className="w-full p-2 border rounded mb-4"
          rows={3}
        />
        <div className="flex justify-end space-x-2">
          <button
            onClick={() => {
              setShowAddCard(null);
              setNewCardName('');
              setNewCardDesc('');
            }}
            className="px-4 py-2 bg-gray-300 rounded"
          >
            {t('cancel')}
          </button>
          <button
            onClick={handleCreateCard}
            className="px-4 py-2 bg-primary text-white rounded"
          >
            {t('create')}
          </button>
        </div>
      </Modal>
      <Modal
        isOpen={showDeleteListConfirm}
        onClose={() => {
          setShowDeleteListConfirm(false);
          setDeleteListId(null);
        }}
        title={t('confirm.delete.list.title')}
      >
        <p className="mb-4">{t('confirm.delete.list')}</p>
        <div className="flex justify-end space-x-2">
          <button
            onClick={() => {
              setShowDeleteListConfirm(false);
              setDeleteListId(null);
            }}
            className="px-4 py-2 bg-gray-300 rounded"
          >
            {t('cancel')}
          </button>
          <button
            onClick={handleDeleteList}
            className="px-4 py-2 bg-red-500 text-white rounded"
          >
            {t('delete')}
          </button>
        </div>
      </Modal>
      <Modal
        isOpen={showDeleteCardConfirm}
        onClose={() => {
          setShowDeleteCardConfirm(false);
          setDeleteCardId(null);
          setDeleteCardListId(null);
          setDeleteCardName('');
        }}
        title={t('confirm.delete.card.title')}
      >
        <p className="mb-4">{t('confirm.delete.card', { cardName: deleteCardName })}</p>
        <div className="flex justify-end space-x-2">
          <button
            onClick={() => {
              setShowDeleteCardConfirm(false);
              setDeleteCardId(null);
              setDeleteCardListId(null);
              setDeleteCardName('');
            }}
            className="px-4 py-2 bg-gray-300 rounded"
          >
            {t('cancel')}
          </button>
          <button
            onClick={handleDeleteCard}
            className="px-4 py-2 bg-red-500 text-white rounded"
          >
            {t('delete')}
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default KanbanBoard;
