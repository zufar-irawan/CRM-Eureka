// Kanban.tsx - Updated with rollback functionality
"use client"

import { closestCenter, closestCorners, DndContext, DragEndEvent, DragMoveEvent, DragStartEvent, UniqueIdentifier } from "@dnd-kit/core"
import Sensors from "./Functions/Sensors"
import { JSX, useEffect, useState } from "react"
import handleDragStart from "./Functions/HandleDragStart"
import handleDragMove from "./Functions/HandleDragMove"
import handleDragEnd, { rollbackDrag } from "./Functions/HandleDragEnd"
import { SortableContext } from "@dnd-kit/sortable"
import Container from "./Container/Container"
import Items from "./Item/Item"
import ConvertToDealModal from "./ConvertToDealModal"
import handleConvertToDeal from "./Functions/HandleConvertToDeal"
import fetchKanbanData from "./Functions/FetchKanbanData"
import TaskResultModal from "./TaskResultModal";
import updateStage from "./Functions/UpdateStage";
import path from "path"

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
    const [onConfirmTask, setOnConfirmTask] = useState<((title: string, value: number, stage: string) => Promise<void>) | null>(null)
    const [onConfirm, setOnConfirm] = useState<((title: string, value: number, stage: string) => Promise<void>) | null>(null);
    const [showTaskResultModal, setShowTaskResultModal] = useState(false);
    const [selectedTaskId, setSelectedTaskId] = useState<number | null>(null);
    const [pendingDrag, setPendingDrag] = useState<DragEndEvent | null>(null);

    // Handle convert modal untuk leads
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

    // Fungsi untuk refresh data setelah modal ditutup
    const refreshKanbanData = () => {
        if (pathname === "Leads") {
            fetchKanbanData({
                url: "http://localhost:5000/api/leads",
                setData: setData,
                setContainers: setContainers,
                groupBy: "stage",
                mapItem: (item) => ({
                    id: `item-${item.id}`,
                    itemId: item.id,
                    fullname: item.lead?.fullname || item.fullname || "Unknown",
                    organization: item.lead?.company || item.company || "-",
                    email: item.lead?.email || item.email || "-",
                    mobileno: item.lead?.phone || item.phone || "-",
                }),
            });
        } else if (pathname === "Deals") {
            fetchKanbanData({
                url: "http://localhost:5000/api/deals",
                setData: setData,
                setContainers: setContainers,
                groupBy: "stage",
                mapItem: (deal) => ({
                    id: `item-${deal.id}`,
                    itemId: deal.id,
                    fullname: deal.lead?.fullname || "Unknown",
                    organization: deal.lead?.company || "-",
                    email: deal.lead?.email || "-",
                    mobileno: deal.lead?.phone || "-",
                }),
            })
        } else if (pathname === "Tasks") {
            fetchKanbanData({
                url: "http://localhost:5000/api/tasks",
                setData: setData,
                setContainers: setContainers,
                groupBy: "status", // bisa diganti "status", "type", dll tergantung API
                mapItem: (task) => ({
                    id: `item-${task.id}`,
                    itemId: task.id,
                    fullname: task.title || "Unknown",
                    organization: task.category || "-",
                    email: task.description || "-",
                    mobileno: task.priority || "-",
                }),
            })
        }
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
                        onDragEnd={(event: DragEndEvent) =>
                            handleDragEnd({
                                event,
                                containers,
                                setContainers, // Add this prop
                                setShowConvertModal,
                                setActiveId,
                                draggedItem,
                                setDraggedItem,
                                setConvertingLeadId,
                                onConvertRequest: handleOpenConvertModal,
                                pathname,
                                setShowTaskResultModal,
                                setSelectedTaskId,
                                setPendingDrag,
                            })
                        }
                    >
                        <SortableContext items={containers.map((i) => i.id)}>
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
                                    <SortableContext items={container.items.map((i) => i.id)}>
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
            </div>

            {/* Modal untuk convert lead to deal - hanya muncul jika pathname adalah "Leads" */}
            {showConvertModal && onConfirm && pathname === "Leads" && (
                <ConvertToDealModal
                    onClose={() => {
                        setShowConvertModal(false);
                        setConvertingLeadId(null);
                        // Refresh data setelah modal ditutup
                        refreshKanbanData();
                    }}
                    onConfirm={onConfirm}
                    selectedCount={1}
                    selectedIds={[String(convertingLeadId)]}
                />
            )}

            {showTaskResultModal && selectedTaskId && pathname === "Tasks" && (
                <TaskResultModal
                    taskId={String(selectedTaskId)}
                    onSuccess={async () => {
                        // Modal confirmed → proceed with the update
                        if (pendingDrag) {
                            try {
                                await updateStage({
                                    itemId: selectedTaskId,
                                    newStage: "Completed",
                                    pathname: pathname
                                });
                                console.log("Task status updated to Completed");
                            } catch (error) {
                                console.error("Failed to update task status:", error);
                                // On error, rollback the visual change
                                rollbackDrag(pendingDrag, containers, setContainers);
                            }
                        }

                        // Reset modal state
                        setShowTaskResultModal(false);
                        setSelectedTaskId(null);
                        setPendingDrag(null);
                        setDraggedItem(null);

                        refreshKanbanData()
                    }}
                    onClose={() => {
                        // Modal canceled → rollback the drag
                        console.log("Task result modal canceled - rolling back drag");

                        if (pendingDrag) {
                            rollbackDrag(pendingDrag, containers, setContainers);
                        }

                        // Reset modal state
                        setShowTaskResultModal(false);
                        setSelectedTaskId(null);
                        setPendingDrag(null);
                        setDraggedItem(null);

                        refreshKanbanData()
                    }}
                />
            )}
        </>
    )
}