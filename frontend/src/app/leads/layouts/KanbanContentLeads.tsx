//kanban leads
"use client";

import {
  closestCorners,
  DndContext,
  DragEndEvent,
  DragMoveEvent,
  DragStartEvent,
  KeyboardSensor,
  PointerSensor,
  UniqueIdentifier,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
} from "@dnd-kit/sortable";
import { Filter, Kanban, RotateCcw } from "lucide-react";
import { JSX, useEffect, useState, useRef } from "react";
import Container from "./Container/Container";
import Items from "./Item/Item";
import { v4 as uuidv4 } from "uuid";
import axios from "axios";
import CreateLeadModal from "../add/AddLeadModal";
import ConvertToDealModal from "../components/ConvertToDealModal";

interface Lead {
  id: number;
  fullname: string;
  company: string;
  email: string;
  mobile: string;
  stage: string;
}

type DNDType = {
  id: UniqueIdentifier;
  title: string;
  icon: JSX.Element;
  items: {
    id: UniqueIdentifier;
    fullname: string;
    organization: string;
    email: string;
    mobileno: string;
    leadId: number;
  }[];
};

const KanbanLead = () => {
  const [leads, setLeads] = useState([]);
  const [isUpdating, setIsUpdating] = useState(false);
  const [draggedItem, setDraggedItem] = useState<any>(null);

  // Convert modal states
  const [showConvertModal, setShowConvertModal] = useState(false);
  const [convertingLeadId, setConvertingLeadId] = useState<number | null>(null);
  const [isConverting, setIsConverting] = useState(false);

  const [containers, setContainers] = useState<DNDType[]>([
    {
      id: `container-${uuidv4()}`,
      icon: (
        <div className="w-4 h-4 rounded-full bg-gray-700 flex items-center justify-center">
          <div className="w-2 h-2 rounded-full bg-white"></div>
        </div>
      ),
      title: "New",
      items: [],
    },
    {
      id: `container-${uuidv4()}`,
      icon: (
        <div className="w-4 h-4 rounded-full bg-blue-600 flex items-center justify-center">
          <div className="w-2 h-2 rounded-full bg-white"></div>
        </div>
      ),
      title: "Contacted",
      items: [],
    },
    {
      id: `container-${uuidv4()}`,
      icon: (
        <div className="w-4 h-4 rounded-full bg-red-600 flex items-center justify-center">
          <div className="w-2 h-2 rounded-full bg-white"></div>
        </div>
      ),
      title: "Qualification",
      items: [],
    },
    {
      id: `container-${uuidv4()}`,
      icon: (
        <div className="w-4 h-4 rounded-full bg-green-600 flex items-center justify-center">
          <div className="w-2 h-2 rounded-full bg-white"></div>
        </div>
      ),
      title: "Converted",
      items: [],
    },
    {
      id: `container-${uuidv4()}`,
      icon: (
        <div className="w-4 h-4 rounded-full bg-gray-800 flex items-center justify-center">
          <div className="w-2 h-2 rounded-full bg-white"></div>
        </div>
      ),
      title: "Unqualified",
      items: [],
    },
  ]);

  useEffect(() => {
    fetchLeads();
  }, []);

  const fetchLeads = async () => {
    try {
      console.log("Fetching leads...");
      const response = await axios.get("http://localhost:5000/api/leads/?status=0");
      const fetchedLeads: Lead[] = response.data.leads;

      console.log("Raw leads data:", fetchedLeads);

      const groupedLeads = fetchedLeads.reduce((acc: Record<string, Lead[]>, lead: Lead) => {
        const stage = lead.stage || "New";
        if (!acc[stage]) acc[stage] = [];
        acc[stage].push(lead);
        return acc;
      }, {} as Record<string, Lead[]>);

      console.log("Grouped leads:", groupedLeads);

      setContainers(prevContainers =>
        prevContainers.map(container => {
          const leadsForStage: Lead[] = groupedLeads[container.title] || [];
          return {
            ...container,
            items: leadsForStage.map((lead: Lead) => ({
              id: `item-${lead.id}`,
              fullname: lead.fullname,
              organization: lead.company,
              email: lead.email,
              mobileno: lead.mobile,
              leadId: lead.id
            }))
          };
        })
      );
    } catch (error) {
      console.error("Fetch error:", error);
    }
  };

  const updateLeadStage = async (leadId: number, newStage: string) => {
    try {
      setIsUpdating(true);
      console.log(`API Call: Updating Lead ${leadId} to stage "${newStage}"`);

      const response = await axios.put(
        `http://localhost:5000/api/leads/${leadId}/stage`,
        { stage: newStage },
        {
          headers: {
            "Content-Type": "application/json",
          },
          timeout: 10000,
        }
      );

      console.log("API Response:", response.data);
      return response.data;
    } catch (error: any) {
      console.error("Failed to update lead stage:", error);

      if (error.response) {
        console.error("Error response:", error.response.data);
        alert(`Failed to update: ${error.response.data.message || "Unknown error"}`);
      } else {
        console.error("Network error:", error.message);
        alert(`Network error: ${error.message}`);
      }

      throw error;
    } finally {
      setIsUpdating(false);
    }
  };

  // Convert to deal function
  const handleConvertToDeal = async (dealTitle: string, dealValue: number, dealStage: string) => {
    if (!convertingLeadId) return;

    setIsConverting(true);
    try {
      console.log('[DEBUG] Converting lead to deal:', {
        leadId: convertingLeadId,
        dealTitle,
        dealValue,
        dealValueType: typeof dealValue,
        dealStage
      });

      // Get lead data for conversion
      const leadData = containers
        .flatMap(container => container.items)
        .find(item => item.leadId === convertingLeadId);

      if (!leadData) {
        throw new Error("Lead data not found");
      }

      const requestBody = {
        dealTitle: dealTitle.trim(),
        dealValue: parseFloat(dealValue.toString()),
        dealStage: dealStage,
        leadData: {
          fullname: leadData.fullname,
          company: leadData.organization,
          email: leadData.email,
          mobile: leadData.mobileno,
        }
      };

      console.log('[DEBUG] Request body being sent:', requestBody);

      const response = await fetch(`http://localhost:5000/api/leads/${convertingLeadId}/convert`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || `HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      console.log('[DEBUG] Conversion successful:', result);

      // Show success message
      alert(`Successfully converted lead "${leadData.fullname}" to deal "${dealTitle}" with value $${dealValue.toLocaleString()}!`);

      // Close modal
      setShowConvertModal(false);
      setConvertingLeadId(null);

      // Refresh data to show updated status
      setTimeout(() => {
        fetchLeads();
      }, 500);

    } catch (error: unknown) {
      console.error('[ERROR] Failed to convert lead:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to convert lead to deal';
      alert(`Error: ${errorMessage}`);

      // Revert UI changes by refetching data
      fetchLeads();
    } finally {
      setIsConverting(false);
    }
  };

  const [activeId, setActiveId] = useState<UniqueIdentifier | null>(null);
  const [currentContainerId, setCurrentContainerId] =
    useState<UniqueIdentifier>();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const findValueOfItems = (id: UniqueIdentifier | undefined, type: string) => {
    if (type === "container") {
      return containers.find((container) => container.id === id);
    }

    if (type === "item") {
      return containers.find((container) =>
        container.items.find((item) => item.id === id)
      );
    }
  };

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  function handleDragStart(event: DragStartEvent) {
    const { active } = event;
    const { id } = active;
    setActiveId(id);

    // Store the dragged item info
    const activeContainer = findValueOfItems(id, "item");
    if (activeContainer) {
      const item = activeContainer.items.find((item) => item.id === id);
      setDraggedItem({
        item: item,
        sourceContainer: activeContainer.title
      });
      console.log("Drag started - Item:", item, "from container:", activeContainer.title);
    }
  }

  const handleDragMove = (event: DragMoveEvent) => {
    const { active, over } = event;

    if (isUpdating || isConverting) {
      console.log("Update/Convert in progress, ignoring drag move");
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
      const activeContainer = findValueOfItems(active.id, "item");
      const overContainer = findValueOfItems(over.id, "item");

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
      const activeContainer = findValueOfItems(active.id, "item");
      const overContainer = findValueOfItems(over.id, "container");

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

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    console.log("Drag ended");
    console.log("Active ID:", active.id);
    console.log("Over ID:", over?.id);
    console.log("Dragged Item Info:", draggedItem);

    // Reset active state
    setActiveId(null);

    // Early returns for edge cases
    if (isUpdating || isConverting) {
      console.log("Update/Convert in progress - ignoring drag");
      setDraggedItem(null);
      return;
    }

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
      const targetContainer = findValueOfItems(over.id, "item");
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
      setConvertingLeadId(draggedItem.item.leadId);
      setShowConvertModal(true);
      setDraggedItem(null);
      return;
    }

    console.log(`Updating Lead ${draggedItem.item.leadId}: ${draggedItem.sourceContainer} → ${targetContainerTitle}`);

    // Call API to update stage for non-converted stages
    updateLeadStage(draggedItem.item.leadId, targetContainerTitle)
      .then(() => {
        console.log("Stage updated successfully, refreshing data...");
        setTimeout(() => {
          fetchLeads();
        }, 500);
      })
      .catch(error => {
        console.error("Update failed, reverting UI changes");
        fetchLeads();
      })
      .finally(() => {
        setDraggedItem(null);
      });
  }

  return (
    <main className="p-4 overflow-auto lg:p-6 bg-white">
      <div className="mx-auto">
        {/* Header Controls */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={fetchLeads}
              disabled={isUpdating || isConverting}
              className="flex items-center gap-2 px-2.5 py-2 text-sm border border-gray-300 rounded-md bg-white hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <RotateCcw
                className={`w-3 h-3 ${isUpdating ? "animate-spin" : ""}`}
              />
            </button>

            <button className="flex items-center gap-2 px-3 py-2 text-xs border border-gray-300 rounded-md bg-white hover:bg-gray-50 transition-colors">
              <Filter className="w-3 h-3" />
              <span className="hidden sm:inline">Filter</span>
            </button>

            <button className="flex items-center gap-2 px-3 py-2 text-xs border border-gray-300 rounded-md bg-white hover:bg-gray-50 transition-colors">
              <Kanban className="w-3 h-3" />
              <span className="hidden sm:inline">Kanban Settings</span>
            </button>

            {/* Loading indicators */}
            {isUpdating && (
              <div className="flex items-center gap-2 px-3 py-2 text-xs text-blue-600 bg-blue-50 rounded-md border border-blue-200">
                <div className="w-3 h-3 border border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                <span>Updating stage...</span>
              </div>
            )}

            {isConverting && (
              <div className="flex items-center gap-2 px-3 py-2 text-xs text-green-600 bg-green-50 rounded-md border border-green-200">
                <div className="w-3 h-3 border border-green-600 border-t-transparent rounded-full animate-spin"></div>
                <span>Converting to deal...</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="mt-8">
        <div className="flex grid-cols-5">
          <DndContext
            sensors={sensors}
            collisionDetection={closestCorners}
            onDragStart={handleDragStart}
            onDragMove={handleDragMove}
            onDragEnd={handleDragEnd}
          >
            <SortableContext items={containers.map((i) => i.id)}>
              {containers.map((container) => (
                <Container
                  key={container.id}
                  title={container.title}
                  icon={container.icon}
                  id={container.id}
                  onAddItem={() => {
                    setIsModalOpen(true);
                    setCurrentContainerId(container.id);
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
                          leadId={item.leadId} // Pass the leadId prop
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

      {/* Create Lead Modal */}
      {isModalOpen && <CreateLeadModal onClose={() => setIsModalOpen(false)} />}

      {/* Convert to Deal Modal */}
      {showConvertModal && convertingLeadId && (
        <ConvertToDealModal
          onClose={() => {
            setShowConvertModal(false);
            setConvertingLeadId(null);
            // Refresh data in case of cancellation
            fetchLeads();
          }}
          onConfirm={handleConvertToDeal}
          selectedCount={1}
          selectedIds={[String(convertingLeadId)]}
        />
      )}
    </main>
  );
};

export default KanbanLead;