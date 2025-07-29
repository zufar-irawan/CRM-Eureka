"use client"

import { closestCorners, DndContext, DragMoveEvent, UniqueIdentifier } from "@dnd-kit/core"
import Sensors from "./Functions/Sensors"
import { JSX, useState } from "react"
import handleDragStart from "./Functions/HandleDragStart"
import handleDragMove from "./Functions/HandleDragMove"
import handleDragEnd from "./Functions/HandleDragEnd"
import { SortableContext } from "@dnd-kit/sortable"
import Container from "./Container/Container"
import Items from "./Item/Item"

export type DNDType = {
    id: UniqueIdentifier
    title: string
    icon: JSX.Element
    items: {
        id: UniqueIdentifier
        leadId: number
        fullname: string
        organization: string
        email: string
        mobileno: string
    }[]
}

type kanbanProps = {
    containers: DNDType[]
    setContainers: React.Dispatch<React.SetStateAction<DNDType[]>>;
    setDeals: React.Dispatch<React.SetStateAction<any[]>>;
}

export default function Kanban({ containers, setContainers, setDeals }: kanbanProps) {
    const [activeId, setActiveId] = useState<UniqueIdentifier | null>(null)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [currentContainerId, setCurrentContainerId] = useState<UniqueIdentifier>()

    return (
        <div className="mt-8 overflow-x-auto">
            <div className="flex gap-4 w-max">
                <DndContext
                    sensors={Sensors()}
                    collisionDetection={closestCorners}
                    onDragStart={(event: DragMoveEvent) => handleDragStart(event, { setActiveId })}
                    onDragMove={(event: DragMoveEvent) => handleDragMove({ event, containers, setContainers })}
                    onDragEnd={(event: DragMoveEvent) => handleDragEnd({ event, containers, setContainers, setActiveId })}
                >
                    <SortableContext items={containers.map((i) => i.id)} >
                        {containers.map((container) => (
                            <Container
                                key={container.id}
                                title={container.title}
                                icon={container.icon}
                                id={container.id}
                                onAddItem={() => {
                                    setIsModalOpen(true)
                                    setCurrentContainerId(container.id)
                                }}
                            >
                                <SortableContext items={container.items.map((i) => i.id)} >
                                    <div className="flex items-start flex-col gap-y-4">
                                        {container.items.map((item) => (
                                            <Items
                                                key={item.id}
                                                id={item.id}
                                                fullname={item.fullname}
                                                organization={item.organization}
                                                email={item.email}
                                                mobileno={item.mobileno}
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