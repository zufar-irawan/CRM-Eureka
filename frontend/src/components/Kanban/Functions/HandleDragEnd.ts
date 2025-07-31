import { DragEndEvent, UniqueIdentifier } from "@dnd-kit/core";
import { DNDType } from "../Kanban";
import { arrayMove } from "@dnd-kit/sortable";
import findValueOfItems from "./FindValueOfItems";
import React from "react";
import updateStage from "./UpdateStage";

type handleDragEndProps = {
    event: DragEndEvent;
    containers: DNDType[];
    setShowConvertModal: React.Dispatch<React.SetStateAction<boolean>>;
    setActiveId: React.Dispatch<React.SetStateAction<UniqueIdentifier | null>>;
    draggedItem: any
    setDraggedItem: React.Dispatch<React.SetStateAction<any>>
    setConvertingLeadId: React.Dispatch<React.SetStateAction<number | null>>;
    onConvertRequest: (leadId: number) => void
    pathname: string
};

export default async function handleDragEnd({
    event,
    containers,
    setShowConvertModal,
    setActiveId,
    draggedItem,
    setDraggedItem,
    setConvertingLeadId,
    onConvertRequest,
    pathname
}: handleDragEndProps) {
    const { active, over } = event;

    console.log("Drag ended");
    console.log("Active ID:", active.id);
    console.log("Over ID:", over?.id);
    console.log("Dragged Item Info:", draggedItem);

    // Reset active state
    setActiveId(null);

    // Early returns for edge cases
    // if (isUpdating /*|| isConverting*/) {
    //   console.log("Update/Convert in progress - ignoring drag");
    //   setDraggedItem(null);
    //   return;
    // }

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
        onConvertRequest(draggedItem.item.itemId); // ✅
        setDraggedItem(null);
        return;
    }


    console.log(`Updating Lead ${draggedItem.item.leadId}: ${draggedItem.sourceContainer} → ${targetContainerTitle}`);

    try {
        await updateStage({
            itemId: draggedItem.item.itemId, // extract numeric ID
            newStage: targetContainerTitle,
            pathname: pathname
        });

        console.log(`Successfully moved item ${active.id} to stage "${targetContainerTitle}"`);

    } catch (error) {
        console.error('Failed to update stage:', error);
        alert('Failed to move item. Changes have been reverted.');
    }

}


