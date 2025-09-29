import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';
import { getLists, createList, getCards, createCard, updateCard } from '../../services/api';
import { ListItem, Card } from '../../types';
import Modal from '../common/Modal';

const KanbanBoard: React.FC = () => {
  const { boardId } = useParams<{ boardId: string }>();
  const [lists, setLists] = useState<ListItem[]>([]);
  const [cardsByList, setCardsByList] = useState<Record<number, Card[]>>({});
  const [showAddList, setShowAddList] = useState(false);
  const [showAddCard, setShowAddCard] = useState<number | null>(null);
  const [newListName, setNewListName] = useState('');
  const [newCardName, setNewCardName] = useState('');
  const [newCardDesc, setNewCardDesc] = useState('');

  useEffect(() => {
    if (boardId) {
      const fetchData = async () => {
        const listsData = await getLists(Number(boardId));
        setLists(listsData);
        const cardsPromises = listsData.map(l => getCards(l.id));
        const cardsArrays = await Promise.all(cardsPromises);
        const newCardsByList: Record<number, Card[]> = {};
        listsData.forEach((l, index) => {
          newCardsByList[l.id] = cardsArrays[index];
        });
        setCardsByList(newCardsByList);
      };
      fetchData();
    }
  }, [boardId]);

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

  if (!boardId) return <div>Invalid board</div>;

  return (
    <div className="p-4 flex-1">
      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="kanban-lists flex overflow-x-auto space-x-4 pb-4">
          <button
            onClick={() => setShowAddList(true)}
            className="bg-primary text-white px-4 py-2 rounded self-start flex-shrink-0"
          >
            + Add List
          </button>
          {lists.map((list) => (
            <div key={list.id} className="min-w-[280px] bg-white rounded-lg shadow p-4 flex-shrink-0">
              <h3 className="font-semibold mb-2">{list.name}</h3>
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
                            className="bg-blue-100 p-2 rounded mb-2 cursor-move"
                          >
                            <p className="font-medium">{card.name}</p>
                            {card.description && (
                              <p className="text-sm text-gray-600">{card.description}</p>
                            )}
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}