import { DragMoveEvent, UniqueIdentifier } from "@dnd-kit/core";

type handleDragStartProps = {
  setActiveId: (val: UniqueIdentifier | null) => void;
}

export default function handleDragStart(event: DragMoveEvent, {setActiveId} : handleDragStartProps){
    const {active} = event
    const {id} = active
    setActiveId(id)
}