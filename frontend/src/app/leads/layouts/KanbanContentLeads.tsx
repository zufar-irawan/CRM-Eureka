"use client"

import { closestCorners, DndContext, DragEndEvent, DragMoveEvent, DragStartEvent, KeyboardSensor, PointerSensor, UniqueIdentifier, useSensor, useSensors } from "@dnd-kit/core"
import { arrayMove, SortableContext, sortableKeyboardCoordinates } from "@dnd-kit/sortable"
import { Filter, Kanban, RotateCcw } from "lucide-react"
import { JSX, useEffect, useState } from "react"
import Container from "./Container/Container"
import Items from "./Item/Item"
import { v4 as uuidv4 } from 'uuid'
import axios from "axios"
import CreateLeadModal from "../add/page"


type DNDType = {
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

const KanbanLead = () => {
    const [leads, setLeads] = useState([])

    const [containers, setContainers] = useState<DNDType[]>([
        {
            id: `container-${uuidv4()}`,
            icon: <div className="w-4 h-4 rounded-full bg-gray-700 flex items-center justify-center">
                <div className="w-2 h-2 rounded-full bg-white"></div>
            </div>
            ,
            title: 'New',
            items: []
        },
        {
            id: `container-${uuidv4()}`,
            icon: <div className="w-4 h-4 rounded-full bg-blue-600 flex items-center justify-center">
                <div className="w-2 h-2 rounded-full bg-white"></div>
            </div>
            ,
            title: 'Contacted',
            items: []
        },
        {
            id: `container-${uuidv4()}`,
            icon: <div className="w-4 h-4 rounded-full bg-green-700 flex items-center justify-center">
                <div className="w-2 h-2 rounded-full bg-white"></div>
            </div>,
            title: 'Converted',
            items: []
        },
        {
            id: `container-${uuidv4()}`,
            icon: <div className="w-4 h-4 rounded-full bg-red-600 flex items-center justify-center">
                <div className="w-2 h-2 rounded-full bg-white"></div>
            </div>,
            title: 'Qualification',
            items: []
        },
        {
            id: `container-${uuidv4()}`,
            icon: <div className="w-4 h-4 rounded-full bg-gray-800 flex items-center justify-center">
                <div className="w-2 h-2 rounded-full bg-white"></div>
            </div>,
            title: 'Unqualified',
            items: []
        },
    ])

    // Fetch leads data
    const fetchLeads = async () => {
        try {
            const response = await axios.get("http://localhost:5000/api/leads/?status=0");
            const fetchLeads = response.data.leads;
            setLeads(fetchLeads);

            // Group leads by stage
            const groupedLeads: { [key: string]: any[] } = {};

            fetchLeads.forEach((lead: any) => {
                const stage = lead.stage || 'New'
                if (!groupedLeads[stage]) {
                    groupedLeads[stage] = [];
                }
                groupedLeads[stage].push(lead);
            });

            // Update containers based on stage
            setContainers((prevContainers) =>
                prevContainers.map((container) => {
                    const containerStage = container.title;
                    const leadsForStage = groupedLeads[containerStage] || [];

                    const items = leadsForStage.map((lead) => ({
                        id: `item-${lead.id}`,
                        leadId: lead.id, // Store actual lead ID
                        fullname: lead.fullname,
                        organization: lead.company,
                        email: lead.email,
                        mobileno: lead.mobile
                    }));

                    return { ...container, items };
                })
            );

            console.log("Grouped leads:", groupedLeads);
        } catch (error) {
            console.log(error);
        }
    };

    useEffect(() => {
        const delay = setTimeout(() => {
            fetchLeads();
        }, 400);

        return () => clearTimeout(delay);
    }, []);

    const updateLeadStage = async (leadId: number, newStage: string) => {
        try {
            await axios.put(`http://localhost:5000/api/leads/${leadId}/stage`, {
                stage: newStage
            });
            console.log(`Lead ${leadId} updated to stage: ${newStage}`);
        } catch (error) {
            console.error("Error updating lead stage:", error);
            throw error;
        }
    };

    // Function to convert lead to deal
    const convertLeadToDeal = async (leadId: number, leadData: any) => {
        try {
            await axios.post(`http://localhost:5000/api/leads/${leadId}/convert`, {
                deal_title: `Deal from ${leadData.fullname}`,
                deal_value: 0,
                deal_stage: 'negotiation' 
            });
            console.log(`Lead ${leadId} converted to deal successfully`);
        } catch (error) {
            console.error("Error converting lead to deal:", error);
            throw error;
        }
    };

    // Function to handle stage change and conversion
    const handleStageChange = async (leadId: number, newStage: string, leadData: any) => {
        try {
            if (newStage === 'Converted') {
                await convertLeadToDeal(leadId, leadData);
            } else {
                await updateLeadStage(leadId, newStage);
            }
        } catch (error) {
            console.error("Error handling stage change:", error);
            fetchLeads();
            alert("Error updating lead stage. Please try again.");
        }
    };

    const [activeId, setActiveId] = useState<UniqueIdentifier | null>(null)
    const [currentContainerId, setCurrentContainerId] = useState<UniqueIdentifier>()
    const [isModalOpen, setIsModalOpen] = useState(false);

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

    function handleDragStart(event: DragStartEvent) {
        const { active } = event;
        const { id } = active;
        setActiveId(id);
    }

    const handleDragMove = (event: DragMoveEvent) => {
        const { active, over } = event;

        // Handle Items Sorting
        if (
            active.id.toString().includes('item') &&
            over?.id.toString().includes('item') &&
            active &&
            over &&
            active.id !== over.id
        ) {
            // Find the active container and over container
            const activeContainer = findValueOfItems(active.id, 'item');
            const overContainer = findValueOfItems(over.id, 'item');

            // If the active or over container is not found, return
            if (!activeContainer || !overContainer) return;

            // Find the index of the active and over container
            const activeContainerIndex = containers.findIndex(
                (container) => container.id === activeContainer.id,
            );
            const overContainerIndex = containers.findIndex(
                (container) => container.id === overContainer.id,
            );

            // Find the index of the active and over item
            const activeitemIndex = activeContainer.items.findIndex(
                (item) => item.id === active.id,
            );
            const overitemIndex = overContainer.items.findIndex(
                (item) => item.id === over.id,
            );
            // In the same container
            if (activeContainerIndex === overContainerIndex) {
                let newItems = [...containers];
                newItems[activeContainerIndex].items = arrayMove(
                    newItems[activeContainerIndex].items,
                    activeitemIndex,
                    overitemIndex,
                );

                setContainers(newItems);
            } else {
                // In different containers
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
            }
        }

        // Handling Item Drop Into a Container
        if (
            active.id.toString().includes('item') &&
            over?.id.toString().includes('container') &&
            active &&
            over &&
            active.id !== over.id
        ) {
            // Find the active and over container
            const activeContainer = findValueOfItems(active.id, 'item');
            const overContainer = findValueOfItems(over.id, 'container');

            // If the active or over container is not found, return
            if (!activeContainer || !overContainer) return;

            // Find the index of the active and over container
            const activeContainerIndex = containers.findIndex(
                (container) => container.id === activeContainer.id,
            );
            const overContainerIndex = containers.findIndex(
                (container) => container.id === overContainer.id,
            );

            // Find the index of the active and over item
            const activeitemIndex = activeContainer.items.findIndex(
                (item) => item.id === active.id,
            );

            // Remove the active item from the active container and add it to the over container
            let newItems = [...containers];
            const [removeditem] = newItems[activeContainerIndex].items.splice(
                activeitemIndex,
                1,
            );
            newItems[overContainerIndex].items.push(removeditem);
            setContainers(newItems);
        }
    };

    // This is the function that handles the sorting of the containers and items when the user is done dragging.
    function handleDragEnd(event: DragEndEvent) {
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
            const activeContainer = findValueOfItems(active.id, 'item');
            const overContainer = findValueOfItems(over.id, 'item');

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
                handleStageChange(movedItem.leadId, newStage, movedItem);
            }
        }
        if (
            active.id.toString().includes('item') &&
            over?.id.toString().includes('container') &&
            active &&
            over &&
            active.id !== over.id
        ) {
            const activeContainer = findValueOfItems(active.id, 'item');
            const overContainer = findValueOfItems(over.id, 'container');
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
            handleStageChange(movedItem.leadId, newStage, movedItem);
        }
        setActiveId(null);
    }
    const handleRefresh = () => {
        fetchLeads();
    };

    return (
        <main className="p-4 overflow-auto lg:p-6 bg-white">
            <div className="mx-auto">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                    <div className="flex flex-wrap gap-2">
                        <button 
                            onClick={handleRefresh}
                            className="flex items-center gap-2 px-2.5 py-2 text-sm border border-gray-300 rounded-md bg-white hover:bg-gray-50 transition-colors"
                        >
                            <RotateCcw className="w-3 h-3" />
                        </button>

                        <button className="flex items-center gap-2 px-3 py-2 text-xs border border-gray-300 rounded-md bg-white hover:bg-gray-50 transition-colors">
                            <Filter className="w-3 h-3" />
                            <span className="hidden sm:inline">Filter</span>
                        </button>

                        <button className="flex items-center gap-2 px-3 py-2 text-xs border border-gray-300 rounded-md bg-white hover:bg-gray-50 transition-colors">
                            <Kanban className="w-3 h-3" />
                            <span className="hidden sm:inline">Kanban Settings</span>
                        </button>
                    </div>
                </div>
            </div>

            <div className="mt-8">
                <div className="grid grid-cols-5">
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
                                    icon={container.icon}
                                    id={container.id}
                                    onAddItem={() => {
                                        setIsModalOpen(true)
                                        setCurrentContainerId(container.id)
                                    }}
                                >
                                    <SortableContext
                                        items={container.items.map((i) => i.id)}
                                    >
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
            </div>

            {isModalOpen && (
                <CreateLeadModal 
                    onClose={() => {
                        setIsModalOpen(false);
                        fetchLeads();
                    }} 
                />
            )}
        </main>
    )
}

export default KanbanLead