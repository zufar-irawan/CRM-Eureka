"use client"

import { v4 as uuidv4 } from 'uuid'
import Kanban, { DNDType } from "@/components/Kanban/Kanban"
import { Filter, KanbanIcon, RotateCcw } from "lucide-react"
import { useEffect, useState } from 'react';

interface Deal {
  id: number;
  title: string;
  value: number;
  stage: string;
  lead?: {
    fullname: string;
    company: string;
    email: string;
    phone: string;
    mobile: string;
  };
  company?: string;
  email?: string;
  mobile?: string;
}

export default function DealsKanban() {
    const [deals, setDeals] = useState<Deal[]>([]);
    const [isUpdating, setIsUpdating] = useState(false);
    const [draggedItem, setDraggedItem] = useState<any>(null);

    const [containers, setContainers] = useState<DNDType[]>([
        {
            id: `container-${uuidv4()}`,
            icon: <div className="w-4 h-4 rounded-full bg-gray-700 flex items-center justify-center">
                <div className="w-2 h-2 rounded-full bg-white"></div>
            </div>,
            title: 'proposal',
            items: []
        },
        {
            id: `container-${uuidv4()}`,
            icon: <div className="w-4 h-4 rounded-full bg-blue-600 flex items-center justify-center">
                <div className="w-2 h-2 rounded-full bg-white"></div>
            </div>,
            title: 'negotiation',
            items: []
        },
        {
            id: `container-${uuidv4()}`,
            icon: <div className="w-4 h-4 rounded-full bg-green-700 flex items-center justify-center">
                <div className="w-2 h-2 rounded-full bg-white"></div>
            </div>,
            title: 'won',
            items: []
        },
        {
            id: `container-${uuidv4()}`,
            icon: <div className="w-4 h-4 rounded-full bg-red-600 flex items-center justify-center">
                <div className="w-2 h-2 rounded-full bg-white"></div>
            </div>,
            title: 'lost',
            items: []
        },
    ])

    useEffect(() => {
        fetchDeals();
    }, []);

    // Fetch deals function
    const fetchDeals = async () => {
        try {
            console.log("Fetching deals...");
            
            const response = await fetch("/api/deals");
            const result = await response.json();

            if (!result.success) throw new Error(result.message);

            const fetchedDeals: Deal[] = result.data;
            console.log("Raw deals data:", fetchedDeals);

            // Group deals by stage
            const groupedDeals = fetchedDeals.reduce((acc: Record<string, Deal[]>, deal: Deal) => {
                const stage = deal.stage || "proposal";
                if (!acc[stage]) acc[stage] = [];
                acc[stage].push(deal);
                return acc;
            }, {} as Record<string, Deal[]>);

            console.log("Grouped deals:", groupedDeals);

            // Update containers with fetched data
            setContainers(prevContainers =>
                prevContainers.map(container => {
                    const dealsForStage: Deal[] = groupedDeals[container.title] || [];
                    return {
                        ...container,
                        items: dealsForStage.map((deal: Deal) => ({
                            id: `item-${deal.id}`,
                            dealId: deal.id,
                            fullname: deal.lead?.fullname || deal.title || "Unknown Deal",
                            organization: deal.lead?.company || deal.company || "-",
                            email: deal.lead?.email || deal.email || "-",
                            mobileno: deal.lead?.phone || deal.lead?.mobile || deal.mobile || "-",
                            value: deal.value || 0
                        }))
                    };
                })
            );

            setDeals(fetchedDeals);
        } catch (error) {
            console.error("Fetch error:", error);
            alert("Failed to fetch deals: " + (error instanceof Error ? error.message : "Unknown error"));
        }
    };

    // Update deal stage function - similar to updateLeadStage
    const updateDealStage = async (dealId: number, newStage: string) => {
        try {
            setIsUpdating(true);
            console.log(`API Call: Updating Deal ${dealId} to stage "${newStage}"`);

            const response = await fetch(`/api/deals/${dealId}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ stage: newStage }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
            }

            const result = await response.json();
            console.log("API Response:", result);
            return result;
        } catch (error: any) {
            console.error("Failed to update deal stage:", error);
            
            if (error.message) {
                alert(`Failed to update: ${error.message}`);
            } else {
                alert(`Network error: ${error.toString()}`);
            }
            
            throw error;
        } finally {
            setIsUpdating(false);
        }
    };

    const handleRefresh = () => {
        fetchDeals();
    }

    return (
        <main className="p-4 overflow-auto lg:p-6 bg-white">
            <div className="mx-auto">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                    <div className="flex flex-wrap gap-2">
                        <button
                            onClick={handleRefresh}
                            disabled={isUpdating}
                            className="flex items-center gap-2 px-2.5 py-2 text-sm border border-gray-300 rounded-md bg-white hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <RotateCcw className={`w-3 h-3 ${isUpdating ? "animate-spin" : ""}`} />
                        </button>

                        <button className="flex items-center gap-2 px-3 py-2 text-xs border border-gray-300 rounded-md bg-white hover:bg-gray-50 transition-colors">
                            <Filter className="w-3 h-3" />
                            <span className="hidden sm:inline">Filter</span>
                        </button>

                        <button className="flex items-center gap-2 px-3 py-2 text-xs border border-gray-300 rounded-md bg-white hover:bg-gray-50 transition-colors">
                            <KanbanIcon className="w-3 h-3" />
                            <span className="hidden sm:inline">Kanban Settings</span>
                        </button>

                        {/* Loading indicator */}
                        {isUpdating && (
                            <div className="flex items-center gap-2 px-3 py-2 text-xs text-blue-600 bg-blue-50 rounded-md border border-blue-200">
                                <div className="w-3 h-3 border border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                                <span>Updating stage...</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <Kanban 
                containers={containers}
                setContainers={setContainers} 
                setDeals={setDeals}
                fetchData={fetchDeals}
                updateStage={updateDealStage}
                isUpdating={isUpdating}
                itemType="deal"
                draggedItem={draggedItem}
                setDraggedItem={setDraggedItem}
            />
        </main>
    )
}