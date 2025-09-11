import axios from "axios";
import { DNDType } from "../Kanban";

type fetchDataProps = {
  url: string;
  setData: React.Dispatch<React.SetStateAction<any[]>>;
  setContainers: React.Dispatch<React.SetStateAction<DNDType[]>>;
  groupBy: string;
  mapItem: (item: any) => {
    id: string;
    itemId: number;
    fullname: string;
    organization: string;
    email: string;
    mobileno: string;
  };
  filterBy?: string;
  searchTerm?: string;
  owner?: number;
  created_by?: number;
  assigned_to?: number;
};

export default async function fetchKanbanData({
  url,
  setData,
  setContainers,
  groupBy,
  mapItem,
  filterBy,
  searchTerm,
  owner,
  created_by,
  assigned_to,
}: fetchDataProps) {
  try {
    console.log("Url: ", url);
    console.log("owner: ", owner);
    let rawData: any[] = [];

    // --- Fetch data ---
    if (owner) {
      const response = await axios.get(url, {
        params: { owner },
        withCredentials: true,
      });
      rawData = response.data.data || response.data.leads;
    } else if (created_by && assigned_to) {
      // fetch dua kali, gabung hasilnya
      const [createdRes, assignedRes] = await Promise.all([
        axios.get(url, { params: { created_by }, withCredentials: true }),
        axios.get(url, { params: { assigned_to }, withCredentials: true }),
      ]);

      const combined = [
        ...(createdRes.data.data || []),
        ...(assignedRes.data.data || []),
      ];

      // hilangkan duplikat by id
      rawData = Array.from(new Map(combined.map((item) => [item.id, item])).values());
    } else {
      const response = await axios.get(url, {
        withCredentials: true,
      });
      if (url.includes("/leads")) {
        rawData = response.data.leads;
      } else {
        rawData = response.data.data;
      }
    }

    console.log("Fetched data:", rawData);

    if (!Array.isArray(rawData)) {
      console.error("Expected array, got:", rawData);
      return;
    }

    // --- Filtering by filterBy + searchTerm ---
    let filteredData = rawData;

    if (filterBy && searchTerm && searchTerm.trim() !== "") {
      filteredData = rawData.filter((item) => {
        let fieldValue = "";

        if (url.includes("/leads")) {
          switch (filterBy.toLowerCase()) {
            case "fullname":
              fieldValue = item.fullname || item.lead?.fullname || "";
              break;
            case "email":
              fieldValue = item.email || item.lead?.email || "";
              break;
            case "company":
              fieldValue = item.company || item.lead?.company || "";
              break;
            case "phone":
            case "mobileno":
              fieldValue =
                item.phone || item.lead?.phone || item.mobileno || "";
              break;
            default:
              fieldValue = item[filterBy] || "";
          }
        } else if (url.includes("/deals")) {
          switch (filterBy.toLowerCase()) {
            case "title":
              fieldValue = item.title || item.data?.title || "";
              break;
            case "fullname":
              fieldValue = item.lead?.fullname || "";
              break;
            default:
              fieldValue = item[filterBy] || "";
          }
        } else if (url.includes("/tasks")) {
          switch (filterBy.toLowerCase()) {
            case "title":
              fieldValue = item.title || item.data?.title || "";
              break;
            case "assigned_to":
              fieldValue = item.assignee?.name || "";
              break;
            default:
              fieldValue = item[filterBy] || "";
          }
        }

        return fieldValue
          .toString()
          .toLowerCase()
          .includes(searchTerm.toLowerCase());
      });

      console.log(
        `Filtered data by ${filterBy} containing "${searchTerm}":`,
        filteredData
      );
    }

    // --- Grouping data ---
    setData(filteredData);

    const grouped: { [key: string]: any[] } = {};
    filteredData.forEach((item) => {
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
