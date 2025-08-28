import axios from "axios";
import { DNDType } from "../Kanban";
import { error } from "console";

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
};

export default async function fetchKanbanData({
  url,
  setData,
  setContainers,
  groupBy,
  mapItem,
  filterBy,
  searchTerm,
}: fetchDataProps) {
  try {
    console.log("Url: ", url)

    const response = await axios.get(url, {
      withCredentials: true,
    });
    let rawData 
    if(url === "http://localhost:5000/api/leads"){
      rawData = response.data.leads
    } else if (url === "http://localhost:5000/api/deals"){
      rawData = response.data.data
    } else if (url === "http://localhost:5000/api/tasks"){
      rawData = response.data.data
    }

    console.log("Fetched data:", rawData);

    if (!Array.isArray(rawData)) {
      console.error("Expected array, got:", rawData);
      return;
    }

    // Filter data berdasarkan filterBy dan searchTerm dengan operator LIKE
    let filteredData = rawData;
    
    if(url === "http://localhost:5000/api/leads"){
      if (filterBy && searchTerm && searchTerm.trim() !== '') {
        filteredData = rawData.filter((item) => {
          let fieldValue = '';
          
          // Ambil nilai field berdasarkan filterBy
          switch (filterBy.toLowerCase()) {
            case 'fullname':
              fieldValue = item.fullname || item.lead?.fullname || '';
              break;
            case 'email':
              fieldValue = item.email || item.lead?.email || '';
              break;
            case 'company':
              fieldValue = item.company || item.lead?.company || '';
              break;
            case 'phone':
            case 'mobileno':
              fieldValue = item.phone || item.lead?.phone || item.mobileno || '';
              break;
            default:
              fieldValue = item[filterBy] || '';
          }
          
          // Implementasi operator LIKE (case insensitive)
          return fieldValue.toString().toLowerCase().includes(searchTerm.toLowerCase());
        });
        
        console.log(`Filtered data by ${filterBy} containing "${searchTerm}":`, filteredData);
      }
    } else if(url === "http://localhost:5000/api/deals"){
      if (filterBy && searchTerm && searchTerm.trim() !== '') {
        filteredData = rawData.filter((item) => {
          let fieldValue = '';
          
          // Ambil nilai field berdasarkan filterBy
          switch (filterBy.toLowerCase()) {
            case 'title':
              fieldValue = item.title || item.data?.title || '';
              break;
            case 'fullname':
              fieldValue = item.lead?.fullname || "";
              break;
            default:
              fieldValue = item[filterBy] || '';
          }
          
          // Implementasi operator LIKE (case insensitive)
          return fieldValue.toString().toLowerCase().includes(searchTerm.toLowerCase());
        });
        
        console.log(`Filtered data by ${filterBy} containing "${searchTerm}":`, filteredData);
      }
    } else if(url === "http://localhost:5000/api/tasks"){
      if (filterBy && searchTerm && searchTerm.trim() !== '') {
        filteredData = rawData.filter((item) => {
          let fieldValue = '';
          
          // Ambil nilai field berdasarkan filterBy
          switch (filterBy.toLowerCase()) {
            case 'title':
              fieldValue = item.title || item.data?.title || '';
              break;
            // case 'fullname':
            //   fieldValue = item.lead?.fullname || "";
            //   break;
            default:
              fieldValue = item[filterBy] || '';
          }
          
          // Implementasi operator LIKE (case insensitive)
          return fieldValue.toString().toLowerCase().includes(searchTerm.toLowerCase());
        });
        
        console.log(`Filtered data by ${filterBy} containing "${searchTerm}":`, filteredData);
      }
    }



    setData(filteredData); // Simpan data yang sudah difilter

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