// HandleDragEnd.ts - Updated version with rollback functionality
import { DragEndEvent, UniqueIdentifier } from "@dnd-kit/core";
import { DNDType } from "../Kanban";
import { arrayMove } from "@dnd-kit/sortable";
import findValueOfItems from "./FindValueOfItems";
import React from "react";
import updateStage from "./UpdateStage";

// Export the rollback function for use in Kanban component
export function rollbackDrag(
    event: DragEndEvent, 
    containers: DNDType[], 
    setContainers: React.Dispatch<React.SetStateAction<DNDType[]>>
) {
    const { active, over } = event;
    
    if (!over) return;

    console.log("Rolling back drag operation");

    // Find the source and target containers
    const activeContainer = findValueOfItems({ id: active.id, type: 'item', container: containers });
    let targetContainer;
    
    if (over.id.toString().includes("container")) {
        targetContainer = containers.find(container => container.id === over.id);
    } else {
        targetContainer = findValueOfItems({ id: over.id, type: 'item', container: containers });
    }

    if (!activeContainer || !targetContainer) {
        console.error("Cannot rollback: source or target container not found");
        return;
    }
    
    // If item was moved between different containers, move it back
    if (activeContainer.title !== targetContainer.title) {
        setContainers(prev => {
            const newContainers = [...prev];
            
            // Find container indices
            const targetContainerIndex = newContainers.findIndex(c => c.title === targetContainer.title);
            const sourceContainerIndex = newContainers.findIndex(c => c.title === activeContainer.title);
            
            // Find the item in target container and remove it
            const itemIndex = newContainers[targetContainerIndex].items.findIndex(item => item.id === active.id);
            
            if (itemIndex !== -1) {
                const [movedItem] = newContainers[targetContainerIndex].items.splice(itemIndex, 1);
                
                // Add item back to its original position in source container
                // For simplicity, add it at the end. You could store original position for exact rollback
                newContainers[sourceContainerIndex].items.push(movedItem);
                
                console.log(`Item ${active.id} rolled back from ${targetContainer.title} to ${activeContainer.title}`);
            }
            
            return newContainers;
        });
    }
}

type handleDragEndProps = {
    event: DragEndEvent;
    containers: DNDType[];
    setContainers: React.Dispatch<React.SetStateAction<DNDType[]>>;
    setShowConvertModal: React.Dispatch<React.SetStateAction<boolean>>;
    setActiveId: React.Dispatch<React.SetStateAction<UniqueIdentifier | null>>;
    draggedItem: any
    setDraggedItem: React.Dispatch<React.SetStateAction<any>>
    setConvertingLeadId: React.Dispatch<React.SetStateAction<number | null>>;
    onConvertRequest: (leadId: number) => void
    pathname: string
    setShowTaskResultModal: React.Dispatch<React.SetStateAction<boolean>>;
    setSelectedTaskId: React.Dispatch<React.SetStateAction<number | null>>;
    setPendingDrag: React.Dispatch<React.SetStateAction<DragEndEvent | null>>;
};

export default async function handleDragEnd({
    event,
    containers,
    setContainers,
    setShowConvertModal,
    setActiveId,
    draggedItem,
    setDraggedItem,
    setConvertingLeadId,
    onConvertRequest,
    pathname,
    setShowTaskResultModal,
    setSelectedTaskId,
    setPendingDrag
}: handleDragEndProps) {
    const { active, over } = event;

    console.log("Drag ended");
    console.log("Active ID:", active.id);
    console.log("Over ID:", over?.id);
    console.log("Dragged Item Info:", draggedItem);

    // Reset active state
    setActiveId(null);

    // Early returns for edge cases
    if (!active.id.toString().includes("item")) {
        console.log("Not an item drag - ignoring");
        setDraggedItem(null);
        return;
    }

    if (!over) {
        console.log("No drop target - ignoring");
        setDraggedItem(null);
        return;
    }

    if (!draggedItem) {
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
        const targetContainer = findValueOfItems({ id: over.id, type: 'item', container: containers })
        targetContainerTitle = targetContainer?.title;
    }

    if (!targetContainerTitle) {
        console.error("Target container not found");
        setDraggedItem(null);
        return;
    }

    console.log("Stage Change Details:");
    console.log("Source Stage:", draggedItem.sourceContainer);
    console.log("Target Stage:", targetContainerTitle);
    console.log("Lead ID:", draggedItem.item.leadId);

    // Check if stage actually changed
    if (draggedItem.sourceContainer === targetContainerTitle) {
        console.log("Same container - no update needed");
        setDraggedItem(null);
        return;
    }

    // Special handling for "Converted" stage
    if (targetContainerTitle === "Converted") {
        console.log("Moving to Converted stage - showing convert modal");
        onConvertRequest(draggedItem.item.itemId);
        setDraggedItem(null);
        return;
    }

    // Special handling for "Completed" status (Tasks only)
    if (targetContainerTitle === "completed" && pathname === "Tasks") {
        console.log("Moving to Completed status - opening TaskResultModal");

        setSelectedTaskId(draggedItem.item.itemId);
        setPendingDrag(event);
        setShowTaskResultModal(true);

        // Don't update status yet → wait for modal confirmation
        // Don't call setDraggedItem(null) here so we can rollback if needed
        return;
    }

    console.log(`Updating Lead ${draggedItem.item.leadId}: ${draggedItem.sourceContainer} → ${targetContainerTitle}`);

    try {
        await updateStage({
            itemId: draggedItem.item.itemId,
            newStage: targetContainerTitle,
            pathname: pathname
        });

        console.log(`Successfully moved item ${active.id} to stage "${targetContainerTitle}"`);
        setDraggedItem(null);

    } catch (error) {
        console.error('Failed to update stage:', error);
        // On error, rollback the visual change
        rollbackDrag(event, containers, setContainers);
        setDraggedItem(null);
    }
}

// Helper function to rollback visual drag changes