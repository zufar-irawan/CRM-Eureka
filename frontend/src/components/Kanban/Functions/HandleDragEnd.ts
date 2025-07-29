import { DragMoveEvent, UniqueIdentifier } from "@dnd-kit/core";
import { DNDType } from "../Kanban";
import { arrayMove } from "@dnd-kit/sortable";
import findValueOfItems from "./FindValueOfItems";
import React from "react";

type handleDragEndProps = {
    event: DragMoveEvent
    containers: DNDType[]
    setContainers: React.Dispatch<React.SetStateAction<DNDType[]>>
    setActiveId: React.Dispatch<React.SetStateAction<UniqueIdentifier | null>>
}

export default function handleDragEnd({event, containers, setContainers, setActiveId} : handleDragEndProps) {
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
            const activeContainer = findValueOfItems({id:active.id, type:'item', container:containers});
            const overContainer = findValueOfItems({id:over.id, type:'item', container:containers});

            if (!activeContainer || !overContainer) return;
            const activeContainerIndex = containers.findIndex(
                (container) => container.id === activeContainer.id,
            );
            const overContainerIndex = containers.findIndex(
                (container) => container.id === overContainer.id,
            );
            const activeitemIndex = activeContainer.items.findIndex(
                (item) => item.id === active.id,
            );
            const overitemIndex = overContainer.items.findIndex(
                (item) => item.id === over.id,
            );

            const movedItem = activeContainer.items[activeitemIndex];
            const newStage = overContainer.title;
            if (activeContainerIndex === overContainerIndex) {
                let newItems = [...containers];
                newItems[activeContainerIndex].items = arrayMove(
                    newItems[activeContainerIndex].items,
                    activeitemIndex,
                    overitemIndex,
                );
                setContainers(newItems);
            } else {
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
                // handleStageChange(movedItem.leadId, newStage, movedItem);
            }
        }
        if (
            active.id.toString().includes('item') &&
            over?.id.toString().includes('container') &&
            active &&
            over &&
            active.id !== over.id
        ) {
            const activeContainer = findValueOfItems({id:active.id, type:'item', container:containers});
            const overContainer = findValueOfItems({id:over.id, type:'container', container:containers});
            if (!activeContainer || !overContainer) return;
            const activeContainerIndex = containers.findIndex(
                (container) => container.id === activeContainer.id,
            );
            const overContainerIndex = containers.findIndex(
                (container) => container.id === overContainer.id,
            );
            const activeitemIndex = activeContainer.items.findIndex(
                (item) => item.id === active.id,
            );

            const movedItem = activeContainer.items[activeitemIndex];
            const newStage = overContainer.title;

            let newItems = [...containers];
            const [removeditem] = newItems[activeContainerIndex].items.splice(
                activeitemIndex,
                1,
            );
            newItems[overContainerIndex].items.push(removeditem);
            setContainers(newItems);
            // handleStageChange(movedItem.leadId, newStage, movedItem);
        }
        setActiveId(null);
    }