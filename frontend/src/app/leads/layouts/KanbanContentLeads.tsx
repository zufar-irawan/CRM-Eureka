"use client"

import { closestCorners, DndContext, DragEndEvent, DragMoveEvent, DragStartEvent, KeyboardSensor, PointerSensor, UniqueIdentifier, useSensor, useSensors } from "@dnd-kit/core"
import { arrayMove, SortableContext, sortableKeyboardCoordinates } from "@dnd-kit/sortable"
import { Filter, Kanban, RotateCcw } from "lucide-react"
import { useState } from "react"
import Container from "./Container/Container"
import Items from "./Item/Item"
import { v4 as uuidv4 } from 'uuid'
import { findValueType } from "framer-motion"

type DNDType = {
    id: UniqueIdentifier
    title: string
    items: {
        id: UniqueIdentifier
        title: string
    }[]
}

const KanbanLead = () => {
    const [containers, setContainers] = useState<DNDType[]>([
        {
            id: `container-${uuidv4()}`,
            title: 'container 1',
            items: [
                {
                    id: `item-${uuidv4()}`,
                    title: 'Item 1'
                }
            ]
        },
        {
            id: `container-${uuidv4()}`,
            title: 'container 2',
            items: [
                {
                    id: `item-${uuidv4()}`,
                    title: 'Item 2'
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

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates
        }),
    )

    const handleDragStart = (event: DragStartEvent) => {
        const { active } = event
        const { id } = active
        setActiveId(id)
    }

    const handleDragMove = (event: DragMoveEvent) => {
        const { active, over } = event

        //Handle item sorting
        if (active.id.toString().includes("item") && over?.id.toString().includes('item') && active && over && activeId !== over.id) {
            //find the active and over container
            const activeContainer = findValueOfItems(active.id, 'item')
            const overContainer = findValueOfItems(over.id, 'item')

            //if the active or over container is undefined, return
            if (!activeContainer || !overContainer) return

            //find the active and over container index
            const activeContainerIndex = containers.findIndex(
                (container) => container.id === activeContainer.id
            )
            const overContainerIndex = containers.findIndex(
                (container) => container.id === overContainer.id
            )

            // find the index of the active and over item
            const activeItemIndex = activeContainer.items.findIndex(
                (item) => item.id === active.id
            )
            const overItemIndex = overContainer.items.findIndex(
                (item) => item.id === over.id
            )

            // In the same container
            if (activeContainerIndex === overContainerIndex) {
                let newItems = [...containers]
                newItems[activeContainerIndex].items = arrayMove(
                    newItems[activeContainerIndex].items,
                    activeItemIndex,
                    overItemIndex
                )

                setContainers(newItems)
            } else {
                let newItems = [...containers]
                const [removedItem] = newItems[activeContainerIndex].items.splice(
                    activeItemIndex,
                    1
                )
                newItems[overContainerIndex].items.splice(
                    overItemIndex,
                    0,
                    removedItem
                )

                setContainers(newItems)
            }
        }

        //handle item drop
        if (active.id.toString().includes('item') && over?.id.toString().includes('container') && active && over && active.id !== over.id) {
            //Find the active and over container
            const activeContainer = findValueOfItems(active.id, 'item')
            const overContainer = findValueOfItems(over.id, 'item')

            //if the active or over container is undefined, return
            if (!activeContainer || !overContainer) return

            //find the active and over container index
            const activeContainerIndex = containers.findIndex(
                (container) => container.id === activeContainer.id
            )
            const overContainerIndex = containers.findIndex(
                (container) => container.id === overContainer.id
            )

            // find the index of the active item
            const activeItemIndex = activeContainer.items.findIndex(
                (item) => item.id === active.id
            )

            // Remove the active item from the active container and add it to the over container
            let newItems = [...containers]
            const [removedItem] = newItems[activeContainerIndex].items.splice(
                activeItemIndex,
                1
            )
            newItems[overContainerIndex].items.push(removedItem)
            setContainers(newItems)
        }
    }

    const handleDragEnd = (event: DragEndEvent) => {

    }


    return (
        <main className="p-4 overflow-auto lg:p-6 bg-gray-50">
            <div className="max-w-7xl mx-auto">
                {/* Header Controls */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                    <div className="flex flex-wrap gap-2">
                        <button className="flex items-center gap-2 px-3 py-2 text-sm border border-gray-300 rounded-md bg-white hover:bg-gray-50 transition-colors">
                            <RotateCcw className="w-4 h-4" />
                        </button>

                        <button className="flex items-center gap-2 px-3 py-2 text-sm border border-gray-300 rounded-md bg-white hover:bg-gray-50 transition-colors">
                            <Filter className="w-4 h-4" />
                            <span className="hidden sm:inline">Filter</span>
                        </button>

                        <button className="flex items-center gap-2 px-3 py-2 text-sm border border-gray-300 rounded-md bg-white hover:bg-gray-50 transition-colors">
                            <Kanban className="w-4 h-4" />
                            <span className="hidden sm:inline">Kanban Settings</span>
                        </button>
                    </div>
                </div>
            </div>

            <div className="mt-10">
                <div className="grid grid-cols-3 gap-6">
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
                    </DndContext>
                </div>
            </div>
        </main>
    )
}

export default KanbanLead