import axios from "axios";
import path from "path";
import Swal from "sweetalert2";

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
        url = `http://localhost:3000/api/leads/${itemId}`
      } else if( pathname === "Deals"){
        url = `http://localhost:3000/api/deals/${itemId}`
      } else if(pathname === "Tasks"){
        url = `http://localhost:3000/api/tasks/${itemId}`
      }

      if(pathname === "Leads" || pathname === "Deals"){
        const response = await axios.put(
          url,
          { stage: newStage },
          {
            headers: {
              "Content-Type": "application/json",
            },
            timeout: 10000,
            withCredentials: true,
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
            withCredentials: true,
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

        Swal.fire({
          icon:'error',
          title:'Failed',
          text:`Failed to update: ${error.response.data.message || "Unknown error"}`
        })
      } else {
        console.error("Network error:", error.message);

        Swal.fire({
          icon:'error',
          title:'Failed',
          text:`Network error: ${error.message}`
        })
      }

      throw error;
    } 
  };