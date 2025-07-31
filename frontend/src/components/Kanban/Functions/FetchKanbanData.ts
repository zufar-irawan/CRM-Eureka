import axios from "axios";
import { DNDType } from "../Kanban";
import { error } from "console";

type fetchDataProps = {
  url: string;
  setData: React.Dispatch<React.SetStateAction<any[]>>;
  setContainers: React.Dispatch<React.SetStateAction<DNDType[]>>;
  groupBy: string; // misal "stage", "status", dll
  mapItem: (item: any) => {
    id: string;
    itemId: number;
    fullname: string;
    organization: string;
    email: string;
    mobileno: string;
    value?: number;
    stage?: string;
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
    console.log("Url: ", url)

    const response = await axios.get(url);
    let rawData 
    if(url === "http://localhost:5000/api/leads"){
      rawData = response.data.leads
    } else if (url === "http://localhost:5000/api/deals"){
      rawData = response.data.data
    }

    console.log("Fetched data:", rawData);

    if (!Array.isArray(rawData)) {
      console.error("Expected array, got:", rawData);
      return;
    }

    setData(rawData); 

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
    throw error; 
  }
}