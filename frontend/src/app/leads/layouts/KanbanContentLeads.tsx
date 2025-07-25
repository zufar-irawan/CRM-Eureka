"use client"

import { closestCorners, DndContext, DragEndEvent, DragMoveEvent, DragOverlay, DragStartEvent, KeyboardSensor, PointerSensor, UniqueIdentifier, useSensor, useSensors } from "@dnd-kit/core"
import { arrayMove, SortableContext, sortableKeyboardCoordinates } from "@dnd-kit/sortable"
import { Filter, Kanban, RotateCcw } from "lucide-react"
import { JSX, useState } from "react"
import Container from "./Container/Container"
import Items from "./Item/Item"
import { v4 as uuidv4 } from 'uuid'
import Modal from "./Modal/Modal"
import Input from "./Input/Input"
import { Button } from "./Button/Button"


type DNDType = {
    id: UniqueIdentifier
    title: string
    icon: JSX.Element
    items: {
        id: UniqueIdentifier
        title: string
    }[]
}

const KanbanLead = () => {
    const [containers, setContainers] = useState<DNDType[]>([
        {
            id: `container-${uuidv4()}`,
            icon: <div className="w-4 h-4 rounded-full bg-gray-700 flex items-center justify-center">
                <div className="w-2 h-2 rounded-full bg-white"></div>
            </div>
            ,
            title: 'New',
            items: [
                {
                    id: `item-${uuidv4()}`,
                    title: 'Item 1'
                }
            ]
        },
        {
            id: `container-${uuidv4()}`,
            icon: <div className="w-4 h-4 rounded-full bg-blue-600 flex items-center justify-center">
                <div className="w-2 h-2 rounded-full bg-white"></div>
            </div>
            ,
            title: 'Contacted',
            items: [
                {
                    id: `item-${uuidv4()}`,
                    title: 'Item 2'
                }
            ]
        },
        {
            id: `container-${uuidv4()}`,
            icon: <div className="w-4 h-4 rounded-full bg-green-700 flex items-center justify-center">
                <div className="w-2 h-2 rounded-full bg-white"></div>
            </div>,
            title: 'Nurture',
            items: [
                {
                    id: `item-${uuidv4()}`,
                    title: 'Item 3'
                }
            ]
        },
        {
            id: `container-${uuidv4()}`,
            icon: <div className="w-4 h-4 rounded-full bg-red-600 flex items-center justify-center">
                <div className="w-2 h-2 rounded-full bg-white"></div>
            </div>,
            title: 'Qualified',
            items: [
                {
                    id: `item-${uuidv4()}`,
                    title: 'Item 4'
                }
            ]
        },
        {
            id: `container-${uuidv4()}`,
            icon: <div className="w-4 h-4 rounded-full bg-gray-800 flex items-center justify-center">
                <div className="w-2 h-2 rounded-full bg-white"></div>
            </div>,
            title: 'Unqualified',
            items: [
                {
                    id: `item-${uuidv4()}`,
                    title: 'Item 5'
                }
            ]
        },
        {
            id: `container-${uuidv4()}`,
            icon: <div className="w-4 h-4 rounded-full bg-pink-500 flex items-center justify-center">
                <div className="w-2 h-2 rounded-full bg-white"></div>
            </div>,
            title: 'Junk',
            items: [
                {
                    id: `item-${uuidv4()}`,
                    title: 'Item 6'
                }
            ]
        },
    ])
    const [activeId, setActiveId] = useState<UniqueIdentifier | null>(null)
    const [currentContainerId, setCurrentContainerId] = useState<UniqueIdentifier>()
    const [containerName, setContainerName] = useState('')
    const [itemName, setItemName] = useState('')
    const [showAddContainerModal, setShowAddContainerModal] = useState(false)
    const [showAddItemModal, setShowAddItemModal] = useState(false)

    const findValueOfItems = (id: UniqueIdentifier | undefined, type: string) => {
        if (type === 'container') {
            return containers.find((container) => container.id === id)
        }

        if (type === 'item') {
            return containers.find((container) => container.items.find((item) => item.id === id))
        }
    }

    const findItemTitle = (id: UniqueIdentifier | undefined) => {
        const container = findValueOfItems(id, 'item');
        if (!container) return '';
        const item = container.items.find((item) => item.id === id);
        if (!item) return '';
        return item.title;
    };

    const findContainerTitle = (id: UniqueIdentifier | undefined) => {
        const container = findValueOfItems(id, 'container');
        if (!container) return '';
        return container.title;
    };

    const findContainerItems = (id: UniqueIdentifier | undefined) => {
        const container = findValueOfItems(id, 'container');
        if (!container) return [];
        return container.items;
    }

    const findContainerIcons = (id: UniqueIdentifier | undefined) => {
        const container = findValueOfItems(id, 'container')
        if (!container) return <></>
        return container.icon
    }

    const onAddItem = () => {
        if (!itemName) return
        const id = `item-${uuidv4()}`
        const container = containers.find((item) => item.id === currentContainerId)

        if (!container) return
        container.items.push({
            id,
            title: itemName
        })
        setContainers([...containers])
        setItemName('')
        setShowAddItemModal(false)
    }

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates
        }),
    )

    function handleDragStart(event: DragStartEvent) {
        const { active } = event;
        const { id } = active;
        setActiveId(id);
    }

    const handleDragMove = (event: DragMoveEvent) => {
        const { active, over } = event;

        // Handle Items Sorting
        if (
            active.id.toString().includes('item') &&
            over?.id.toString().includes('item') &&
            active &&
            over &&
            active.id !== over.id
        ) {
            // Find the active container and over container
            const activeContainer = findValueOfItems(active.id, 'item');
            const overContainer = findValueOfItems(over.id, 'item');

            // If the active or over container is not found, return
            if (!activeContainer || !overContainer) return;

            // Find the index of the active and over container
            const activeContainerIndex = containers.findIndex(
                (container) => container.id === activeContainer.id,
            );
            const overContainerIndex = containers.findIndex(
                (container) => container.id === overContainer.id,
            );

            // Find the index of the active and over item
            const activeitemIndex = activeContainer.items.findIndex(
                (item) => item.id === active.id,
            );
            const overitemIndex = overContainer.items.findIndex(
                (item) => item.id === over.id,
            );
            // In the same container
            if (activeContainerIndex === overContainerIndex) {
                let newItems = [...containers];
                newItems[activeContainerIndex].items = arrayMove(
                    newItems[activeContainerIndex].items,
                    activeitemIndex,
                    overitemIndex,
                );

                setContainers(newItems);
            } else {
                // In different containers
                let newItems = [...containers];
                const [removeditem] = newItems[activeContainerIndex].items.splice(
                    activeitemIndex,
                    1,
                );
                newItems[overContainerIndex].items.splice(
                    overitemIndex,
                    0,
                    removeditem,
                );
                setContainers(newItems);
            }
        }

        // Handling Item Drop Into a Container
        if (
            active.id.toString().includes('item') &&
            over?.id.toString().includes('container') &&
            active &&
            over &&
            active.id !== over.id
        ) {
            // Find the active and over container
            const activeContainer = findValueOfItems(active.id, 'item');
            const overContainer = findValueOfItems(over.id, 'container');

            // If the active or over container is not found, return
            if (!activeContainer || !overContainer) return;

            // Find the index of the active and over container
            const activeContainerIndex = containers.findIndex(
                (container) => container.id === activeContainer.id,
            );
            const overContainerIndex = containers.findIndex(
                (container) => container.id === overContainer.id,
            );

            // Find the index of the active and over item
            const activeitemIndex = activeContainer.items.findIndex(
                (item) => item.id === active.id,
            );

            // Remove the active item from the active container and add it to the over container
            let newItems = [...containers];
            const [removeditem] = newItems[activeContainerIndex].items.splice(
                activeitemIndex,
                1,
            );
            newItems[overContainerIndex].items.push(removeditem);
            setContainers(newItems);
        }
    };

    // This is the function that handles the sorting of the containers and items when the user is done dragging.
    function handleDragEnd(event: DragEndEvent) {
        const { active, over } = event;

        // Handling Container Sorting
        if (
            active.id.toString().includes('container') &&
            over?.id.toString().includes('container') &&
            active &&
            over &&
            active.id !== over.id
        ) {
            // Find the index of the active and over container
            const activeContainerIndex = containers.findIndex(
                (container) => container.id === active.id,
            );
            const overContainerIndex = containers.findIndex(
                (container) => container.id === over.id,
            );
            // Swap the active and over container
            let newItems = [...containers];
            newItems = arrayMove(newItems, activeContainerIndex, overContainerIndex);
            setContainers(newItems);
        }

        // Handling item Sorting
        if (
            active.id.toString().includes('item') &&
            over?.id.toString().includes('item') &&
            active &&
            over &&
            active.id !== over.id
        ) {
            // Find the active and over container
            const activeContainer = findValueOfItems(active.id, 'item');
            const overContainer = findValueOfItems(over.id, 'item');

            // If the active or over container is not found, return
            if (!activeContainer || !overContainer) return;
            // Find the index of the active and over container
            const activeContainerIndex = containers.findIndex(
                (container) => container.id === activeContainer.id,
            );
            const overContainerIndex = containers.findIndex(
                (container) => container.id === overContainer.id,
            );
            // Find the index of the active and over item
            const activeitemIndex = activeContainer.items.findIndex(
                (item) => item.id === active.id,
            );
            const overitemIndex = overContainer.items.findIndex(
                (item) => item.id === over.id,
            );

            // In the same container
            if (activeContainerIndex === overContainerIndex) {
                let newItems = [...containers];
                newItems[activeContainerIndex].items = arrayMove(
                    newItems[activeContainerIndex].items,
                    activeitemIndex,
                    overitemIndex,
                );
                setContainers(newItems);
            } else {
                // In different containers
                let newItems = [...containers];
                const [removeditem] = newItems[activeContainerIndex].items.splice(
                    activeitemIndex,
                    1,
                );
                newItems[overContainerIndex].items.splice(
                    overitemIndex,
                    0,
                    removeditem,
                );
                setContainers(newItems);
            }
        }
        // Handling item dropping into Container
        if (
            active.id.toString().includes('item') &&
            over?.id.toString().includes('container') &&
            active &&
            over &&
            active.id !== over.id
        ) {
            // Find the active and over container
            const activeContainer = findValueOfItems(active.id, 'item');
            const overContainer = findValueOfItems(over.id, 'container');

            // If the active or over container is not found, return
            if (!activeContainer || !overContainer) return;
            // Find the index of the active and over container
            const activeContainerIndex = containers.findIndex(
                (container) => container.id === activeContainer.id,
            );
            const overContainerIndex = containers.findIndex(
                (container) => container.id === overContainer.id,
            );
            // Find the index of the active and over item
            const activeitemIndex = activeContainer.items.findIndex(
                (item) => item.id === active.id,
            );

            let newItems = [...containers];
            const [removeditem] = newItems[activeContainerIndex].items.splice(
                activeitemIndex,
                1,
            );
            newItems[overContainerIndex].items.push(removeditem);
            setContainers(newItems);
        }
        setActiveId(null);
    }


    return (
        <main className="p-4 overflow-auto lg:p-6 bg-gray-50">
            {/* Add Modal */}
            <Modal
                showModal={showAddItemModal}
                setShowModal={setShowAddItemModal}
            >
                <div className="flex flex-col w-full items-start gap-y-4">
                    <h1 className="text-gray-800 text-3xl font-bold">
                        Add Item
                    </h1>

                    <Input type="text" placeholder="Item Title" name="itemname" value={itemName} onChange={(e) => setItemName(e.target.value)} />

                    <Button onClick={onAddItem}>
                        Add Item
                    </Button>
                </div>
            </Modal>

            <div className="mx-auto">
                {/* Header Controls */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                    <div className="flex flex-wrap gap-2">
                        <button className="flex items-center gap-2 px-2.5 py-2 text-sm border border-gray-300 rounded-md bg-white hover:bg-gray-50 transition-colors">
                            <RotateCcw className="w-3 h-3" />
                        </button>

                        <button className="flex items-center gap-2 px-3 py-2 text-xs border border-gray-300 rounded-md bg-white hover:bg-gray-50 transition-colors">
                            <Filter className="w-3 h-3" />
                            <span className="hidden sm:inline">Filter</span>
                        </button>

                        <button className="flex items-center gap-2 px-3 py-2 text-xs border border-gray-300 rounded-md bg-white hover:bg-gray-50 transition-colors">
                            <Kanban className="w-3 h-3" />
                            <span className="hidden sm:inline">Kanban Settings</span>
                        </button>
                    </div>
                </div>
            </div>

            <div className="mt-8">
                <div className="grid grid-cols-6 gap-1">
                    <DndContext
                        sensors={sensors}
                        collisionDetection={closestCorners}
                        onDragStart={handleDragStart}
                        onDragMove={handleDragMove}
                        onDragEnd={handleDragEnd}
                    >
                        <SortableContext
                            items={containers.map((i) => i.id)}
                        >
                            {containers.map((container) => (
                                <Container
                                    key={container.id}
                                    title={container.title}
                                    icon={container.icon}
                                    id={container.id}
                                    onAddItem={() => {
                                        setShowAddItemModal(true)
                                        setCurrentContainerId(container.id)
                                    }}
                                >
                                    <SortableContext
                                        items={container.items.map((i) => i.id)}
                                    >
                                        <div className="flex items-start flex-col gap-y-4">
                                            {container.items.map((item) => (
                                                <Items key={item.id} id={item.id} title={item.title} />
                                            ))}
                                        </div>
                                    </SortableContext>
                                </Container>
                            ))}
                        </SortableContext>

                        <DragOverlay adjustScale={false}>
                            {/* Drag Overlay For item Item */}
                            {activeId && activeId.toString().includes('item') && (
                                <Items id={activeId} title={findItemTitle(activeId)} />
                            )}
                            {/* Drag Overlay For Container */}
                            {activeId && activeId.toString().includes('container') && (
                                <Container id={activeId} icon={findContainerIcons(activeId)} title={findContainerTitle(activeId)}>
                                    {findContainerItems(activeId).map((i) => (
                                        <Items key={i.id} title={i.title} id={i.id} />
                                    ))}
                                </Container>
                            )}
                        </DragOverlay>
                    </DndContext>
                </div>
            </div>
        </main>
    )
}

export default KanbanLead