"use client"

import { closestCenter, closestCorners, DndContext, DragEndEvent, DragMoveEvent, DragStartEvent, UniqueIdentifier } from "@dnd-kit/core"
import Sensors from "./Functions/Sensors"
import { JSX, useEffect, useState } from "react"
import handleDragStart from "./Functions/HandleDragStart"
import handleDragMove from "./Functions/HandleDragMove"
import handleDragEnd from "./Functions/HandleDragEnd"
import { SortableContext } from "@dnd-kit/sortable"
import Container from "./Container/Container"
import Items from "./Item/Item"
import ConvertToDealModal from "./ConvertToDealModal"
import handleConvertToDeal from "./Functions/HandleConvertToDeal"
import fetchKanbanData from "./Functions/FetchKanbanData"

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
    }[]
}

type kanbanProps = {
    containers: DNDType[]
    setContainers: React.Dispatch<React.SetStateAction<DNDType[]>>;
    setData: React.Dispatch<React.SetStateAction<any[]>>
    pathname: string
}

export default function Kanban({ containers, setContainers, setData, pathname }: kanbanProps) {
    const [activeId, setActiveId] = useState<UniqueIdentifier | null>(null)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [currentContainerId, setCurrentContainerId] = useState<UniqueIdentifier>()
    const [draggedItem, setDraggedItem] = useState<any>(null)
    const [showConvertModal, setShowConvertModal] = useState(false)
    const [convertingLeadId, setConvertingLeadId] = useState<number | null>(null)
    const [isConverting, setIsConverting] = useState(false);
    const [onConfirm, setOnConfirm] = useState<((title: string, value: number, stage: string) => Promise<void>) | null>(null);

    // Saat modal dibuka atau lead diklik:
    const handleOpenConvertModal = (leadId: number) => {
        setConvertingLeadId(leadId);

        const confirmFn = handleConvertToDeal({
            convertingLeadId: leadId,
            setConvertingLeadId,
            setIsConverting,
            containers,
            setShowConvertModal,
            setData,
            setContainers,
        });

        setOnConfirm(() => confirmFn);
        setShowConvertModal(true);
    };



    return (
        <>
            <div className="mt-8 overflow-x-auto">
                <div className="flex gap-4 w-max">
                    <DndContext
                        sensors={Sensors()}
                        collisionDetection={closestCorners}
                        onDragStart={(event: DragStartEvent) => handleDragStart({ event, setActiveId, setDraggedItem, containers })}
                        onDragMove={(event: DragMoveEvent) => handleDragMove({ event, containers, setContainers })}
                        onDragEnd={(event: DragEndEvent) => handleDragEnd({ event, containers, setShowConvertModal, setActiveId, draggedItem, setDraggedItem, setConvertingLeadId, onConvertRequest: handleOpenConvertModal, pathname })}
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
                                                    pathname={pathname}
                                                    itemId={item.itemId}
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

            {showConvertModal && onConfirm && (
                <ConvertToDealModal
                    onClose={() => {
                        setShowConvertModal(false);
                        setConvertingLeadId(null);
                        // Refresh data in case of cancellation
                        fetchKanbanData({
                            url: "http://localhost:5000/api/leads",
                            setData: setData,
                            setContainers: setContainers,
                            groupBy: "stage", // bisa diganti "status", "type", dll tergantung API
                            mapItem: (lead) => ({
                                id: `item-${lead.id}`,
                                itemId: lead.id,
                                fullname: lead.lead?.fullname || "Unknown",
                                organization: lead.lead?.company || "-",
                                email: lead.lead?.email || "-",
                                mobileno: lead.lead?.phone || "-",
                            }),
                        })
                    }}
                    onConfirm={onConfirm}
                    selectedCount={1}
                    selectedIds={[String(convertingLeadId)]}
                />
            )}
        </>
    )
}