"use client"

import { closestCorners, DndContext, DragEndEvent, DragMoveEvent, DragStartEvent, UniqueIdentifier } from "@dnd-kit/core"
import Sensors from "./Functions/Sensors"
import { JSX, useState } from "react"
import { SortableContext, arrayMove } from "@dnd-kit/sortable"
import Container from "./Container/Container"
import Items from "./Item/Item"
import { usePathname } from "next/navigation"
import findValueOfItems from "./Functions/FindValueOfItems"

export type DNDType = {
    id: UniqueIdentifier
    title: string
    icon: JSX.Element
    items: {
        id: UniqueIdentifier
        itemId: number
        fullname: string
        organization: string
        email: string
        mobileno: string
        value?: number // For deals
    }[]
}

type kanbanProps = {
    containers: DNDType[]
    setContainers: React.Dispatch<React.SetStateAction<DNDType[]>>;
    setDeals: React.Dispatch<React.SetStateAction<any[]>>
    pathname: string
    fetchData?: () => void; // Function to refresh data
    updateStage?: (id: number, stage: string) => Promise<any>; // Function to update stage
    isUpdating?: boolean;
    itemType?: 'lead' | 'deal'; // Specify if this is for leads or deals
    draggedItem?: any;
    setDraggedItem?: React.Dispatch<React.SetStateAction<any>>;
}

export default function Kanban({
    containers,
    setContainers,
    pathname,
    fetchData,
    updateStage,
    isUpdating = false,
    itemType = 'lead',
    draggedItem,
    setDraggedItem
}: kanbanProps) {
    const [activeId, setActiveId] = useState<UniqueIdentifier | null>(null)
    const [localDraggedItem, setLocalDraggedItem] = useState<any>(null);

    // Use parent's draggedItem state if available, otherwise use local state
    const currentDraggedItem = draggedItem !== undefined ? draggedItem : localDraggedItem;
    const setCurrentDraggedItem = setDraggedItem || setLocalDraggedItem;

    // Handle drag start
    function handleDragStart(event: DragStartEvent) {
        const { active } = event;
        const { id } = active;
        setActiveId(id);

        // Store the dragged item info
        const activeContainer = findValueOfItems({ id, type: 'item', container: containers });
        if (activeContainer) {
            const item = activeContainer.items.find((item) => item.id === id);
            setCurrentDraggedItem({
                item: item,
                sourceContainer: activeContainer.title
            });
            console.log("Drag started - Item:", item, "from container:", activeContainer.title);
        }
    }

    // Handle drag move
    const handleDragMove = (event: DragMoveEvent) => {
        const { active, over } = event;

        if (isUpdating) {
            console.log("Update in progress, ignoring drag move");
            return;
        }

        // Handle item to item movement
        if (
            active.id.toString().includes("item") &&
            over?.id.toString().includes("item") &&
            active &&
            over &&
            active.id !== over.id
        ) {
            const activeContainer = findValueOfItems({ id: active.id, type: 'item', container: containers });
            const overContainer = findValueOfItems({ id: over.id, type: 'item', container: containers });

            if (!activeContainer || !overContainer) return;

            const activeContainerIndex = containers.findIndex(
                (container) => container.id === activeContainer.id
            );
            const overContainerIndex = containers.findIndex(
                (container) => container.id === overContainer.id
            );

            const activeitemIndex = activeContainer.items.findIndex(
                (item) => item.id === active.id
            );
            const overitemIndex = overContainer.items.findIndex(
                (item) => item.id === over.id
            );

            if (activeContainerIndex === overContainerIndex) {
                let newItems = [...containers];
                newItems[activeContainerIndex].items = arrayMove(
                    newItems[activeContainerIndex].items,
                    activeitemIndex,
                    overitemIndex
                );
                setContainers(newItems);
            } else {
                let newItems = [...containers];
                const [removeditem] = newItems[activeContainerIndex].items.splice(
                    activeitemIndex,
                    1
                );
                newItems[overContainerIndex].items.splice(
                    overitemIndex,
                    0,
                    removeditem
                );
                setContainers(newItems);
            }
        }

        // Handle item to container movement
        if (
            active.id.toString().includes("item") &&
            over?.id.toString().includes("container") &&
            active &&
            over &&
            active.id !== over.id
        ) {
            const activeContainer = findValueOfItems({ id: active.id, type: 'item', container: containers });
            const overContainer = findValueOfItems({ id: over.id, type: 'container', container: containers });

            if (!activeContainer || !overContainer) return;

            const activeContainerIndex = containers.findIndex(
                (container) => container.id === activeContainer.id
            );
            const overContainerIndex = containers.findIndex(
                (container) => container.id === overContainer.id
            );

            const activeitemIndex = activeContainer.items.findIndex(
                (item) => item.id === active.id
            );

            let newItems = [...containers];
            const [removeditem] = newItems[activeContainerIndex].items.splice(
                activeitemIndex,
                1
            );
            newItems[overContainerIndex].items.push(removeditem);
            setContainers(newItems);
        }
    };

    // Handle drag end
    function handleDragEnd(event: DragEndEvent) {
        const { active, over } = event;

        console.log("Drag ended");
        console.log("Active ID:", active.id);
        console.log("Over ID:", over?.id);
        console.log("Dragged Item Info:", currentDraggedItem);

        // Reset active state
        setActiveId(null);

        // Early returns for edge cases
        if (isUpdating) {
            console.log("Update in progress - ignoring drag");
            setCurrentDraggedItem(null);
            return;
        }

        if (!active.id.toString().includes("item")) {
            console.log("Not an item drag - ignoring");
            setCurrentDraggedItem(null);
            return;
        }

        if (!over) {
            console.log("No drop target - ignoring");
            setCurrentDraggedItem(null);
            return;
        }

        if (!currentDraggedItem) {
            console.log("No dragged item info - ignoring");
            return;
        }

        // Determine target container
        let targetContainerTitle;
        if (over.id.toString().includes("container")) {
            // Dropped directly on container
            const targetContainer = containers.find(container => container.id === over.id);
            targetContainerTitle = targetContainer?.title;
        } else {
            // Dropped on another item - find its container
            const targetContainer = findValueOfItems({ id: over.id, type: 'item', container: containers });
            targetContainerTitle = targetContainer?.title;
        }

        if (!targetContainerTitle) {
            console.error("Target container not found");
            setCurrentDraggedItem(null);
            return;
        }

        console.log("Stage Change Details:");
        console.log("Source Stage:", currentDraggedItem.sourceContainer);
        console.log("Target Stage:", targetContainerTitle);
        console.log(`${itemType} ID:`, currentDraggedItem.item.leadId || currentDraggedItem.item.dealId);

        // Check if stage actually changed
        if (currentDraggedItem.sourceContainer === targetContainerTitle) {
            console.log("Same container - no update needed");
            setCurrentDraggedItem(null);
            return;
        }

        // Get the ID to update
        const itemId = itemType === 'deal' ? currentDraggedItem.item.dealId : currentDraggedItem.item.leadId;

        if (!itemId) {
            console.error("Item ID not found");
            setCurrentDraggedItem(null);
            return;
        }

        console.log(`Updating ${itemType} ${itemId}: ${currentDraggedItem.sourceContainer} → ${targetContainerTitle}`);

        // Call API to update stage if updateStage function is provided
        if (updateStage) {
            updateStage(itemId, targetContainerTitle)
                .then(() => {
                    console.log("Stage updated successfully, refreshing data...");
                    if (fetchData) {
                        setTimeout(() => {
                            fetchData();
                        }, 500);
                    }
                })
                .catch(error => {
                    console.error("Update failed, reverting UI changes");
                    if (fetchData) {
                        fetchData();
                    }
                })
                .finally(() => {
                    setCurrentDraggedItem(null);
                });
        } else {
            setCurrentDraggedItem(null);
        }
    }

    return (
        <div className="mt-8 overflow-x-auto">
            <div className="flex gap-4 w-max">
                <DndContext
                    sensors={Sensors()}
                    collisionDetection={closestCorners}
                    onDragStart={handleDragStart}
                    onDragMove={handleDragMove}
                    onDragEnd={handleDragEnd}
                >
                    <SortableContext items={containers.map((i) => i.id)} >
                        {containers.map((container) => (
                            <Container
                                key={container.id}
                                title={container.title}
                                icon={container.icon}
                                id={container.id}
                                onAddItem={() => {
                                    // Handle add item functionality if needed
                                    console.log("Add item to container:", container.title);
                                }}
                            >
                                <SortableContext items={container.items.map((i) => i.id)} >
                                    <div className="flex items-start flex-col gap-y-4">
                                        {container.items.map((item) => (
                                            <Items
                                                key={item.id}
                                                id={item.itemId}
                                                fullname={item.fullname}
                                                organization={item.organization}
                                                email={item.email}
                                                mobileno={item.mobileno}
                                                pathname={pathname}
                                                itemId={item.itemId}
                                                value={item.value}
                                                itemType={itemType}
                                                isUpdating={isUpdating && currentDraggedItem?.item?.id === item.id}
                                            />
                                        ))}
                                    </div>
                                </SortableContext>
                            </Container>
                        ))}
                    </SortableContext>
                </DndContext>
            </div>
        </div >
    )
}