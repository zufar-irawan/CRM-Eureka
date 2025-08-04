import axios from "axios";
import path from "path";

type updateStageProps = {
    itemId: number
    newStage: string
    pathname: string
}

export default async function updateStage(
    {itemId, newStage, pathname} :
    updateStageProps
) {
    try {
      console.log(`API Call: Updating Lead ${itemId} to stage "${newStage}"`);

      let url = ''
      if(pathname === "Leads"){
        url = `http://localhost:5000/api/leads/${itemId}/stage`
      } else if( pathname === "Deals"){
        url = `http://localhost:5000/api/deals/${itemId}`
      } else if(pathname === "Tasks"){
        url = `http://localhost:5000/api/tasks/${itemId}`
      }

      if(pathname === "Leads" || "Deals"){
        const response = await axios.put(
          url,
          { stage: newStage },
          {
            headers: {
              "Content-Type": "application/json",
            },
            timeout: 10000,
          }
        )

        console.log("API Response:", response.data);
        console.log("Update Stage Success");
        return response.data;
      } else if (pathname === "Tasks"){
        const response = await axios.put(
          url,
          { status: newStage },
          {
            headers: {
              "Content-Type": "application/json",
            },
            timeout: 10000,
          }
        )

        console.log("API Response:", response.data);
        console.log("Update Stage Success");
        return response.data;
      }

      
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
    } 
  };