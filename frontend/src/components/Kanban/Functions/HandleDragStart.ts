import { DragMoveEvent, DragStartEvent, UniqueIdentifier } from "@dnd-kit/core";
import findValueOfItems from "./FindValueOfItems";
import { DNDType } from "../Kanban";

type handleDragStartProps = {
  event: DragStartEvent
  setActiveId: (val: UniqueIdentifier | null) => void;
  setDraggedItem: React.Dispatch<React.SetStateAction<any>>
  containers:DNDType[]
}

export default function handleDragStart({event, setActiveId, setDraggedItem, containers} : handleDragStartProps){
    const {active} = event
    const {id} = active
    setActiveId(id)

    const activeContainer = findValueOfItems({id:id, type:"item", container:containers});
    if (activeContainer) {
      const item = activeContainer.items.find((item) => item.id === id);
      setDraggedItem({
        item: item,
        sourceContainer: activeContainer.title
      });
      console.log("Drag started - Item:", item, "from container:", activeContainer.title);
    }
}