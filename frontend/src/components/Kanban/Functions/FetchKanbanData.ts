import axios from "axios";
import { DNDType } from "../Kanban";

type fetchDataProps = {
  url: string;
  setData: React.Dispatch<React.SetStateAction<any[]>>;
  setContainers: React.Dispatch<React.SetStateAction<DNDType[]>>;
  groupBy: string; // misal "stage", "status", dll
  mapItem: (item: any) => {
    id: string;
    leadId: number;
    fullname: string;
    organization: string;
    email: string;
    mobileno: string;
  };
};

export default async function fetchKanbanData({
  url,
  setData,
  setContainers,
  groupBy,
  mapItem,
}: fetchDataProps) {
  try {
    const response = await axios.get(url);
    const rawData = response.data.data;

    console.log("Fetched data:", rawData);

    if (!Array.isArray(rawData)) {
      console.error("Expected array, got:", rawData);
      return;
    }

    setData(rawData); // Simpan data mentah

    const grouped: { [key: string]: any[] } = {};

    rawData.forEach((item) => {
      const category = item[groupBy] || "default";
      if (!grouped[category]) grouped[category] = [];
      grouped[category].push(item);
    });

    setContainers((prevContainers) =>
      prevContainers.map((container) => {
        const itemsForContainer = grouped[container.title] || [];
        const items = itemsForContainer.map(mapItem);
        return { ...container, items };
      })
    );

    console.log("Grouped by", groupBy, ":", grouped);
  } catch (error) {
    console.error("Failed to fetch data:", error);
  }
}
