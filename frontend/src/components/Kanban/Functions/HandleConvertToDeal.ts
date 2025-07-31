import { DNDType } from "../Kanban";
import fetchKanbanData from "./FetchKanbanData";

type handleConvertToDealProps = {
    convertingLeadId: number | null;
    setConvertingLeadId: React.Dispatch<React.SetStateAction<number | null>>;
    setIsConverting: React.Dispatch<React.SetStateAction<boolean>>;
    containers: DNDType[];
    setShowConvertModal: React.Dispatch<React.SetStateAction<boolean>>;
    setData: React.Dispatch<React.SetStateAction<any[]>>;
    setContainers: React.Dispatch<React.SetStateAction<DNDType[]>>;
};

export default function handleConvertToDeal({
    convertingLeadId,
    setConvertingLeadId,
    setIsConverting,
    containers,
    setShowConvertModal,
    setData,
    setContainers,
}: handleConvertToDealProps) {
    const convertToDeal = async (
        dealTitle: string,
        dealValue: number,
        dealStage: string
    ) => {
        if (!convertingLeadId) return;

        setIsConverting(true);
        try {
            console.log("[DEBUG] Converting lead to deal:", {
                leadId: convertingLeadId,
                dealTitle,
                dealValue,
                dealValueType: typeof dealValue,
                dealStage,
            });

            // Get lead data for conversion
            const leadData = containers
                .flatMap((container) => container.items)
                .find((item) => item.itemId === convertingLeadId);

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
                },
            };

            console.log("[DEBUG] Request body being sent:", requestBody);

            const response = await fetch(
                `http://localhost:5000/api/leads/${convertingLeadId}/convert`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(requestBody),
                }
            );

            if (!response.ok) {
                const errorData = await response.json().catch(() => null);
                throw new Error(
                    errorData?.message ||
                    `HTTP ${response.status}: ${response.statusText}`
                );
            }

            const result = await response.json();
            console.log("[DEBUG] Conversion successful:", result);

            // Show success message
            alert(
                `Successfully converted lead "${leadData.fullname
                }" to deal "${dealTitle}" with value $${dealValue.toLocaleString()}!`
            );

            // Close modal
            setShowConvertModal(false);
            setConvertingLeadId(null);

            // Refresh data to show updated status
            setTimeout(() => {
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
                });
            }, 500);
        } catch (error: unknown) {
            console.error("[ERROR] Failed to convert lead:", error);
            const errorMessage =
                error instanceof Error
                    ? error.message
                    : "Failed to convert lead to deal";
            alert(`Error: ${errorMessage}`);

            // Revert UI changes by refetching data
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
            });
        } finally {
            setIsConverting(false);
        }
    };

    return convertToDeal;
}
