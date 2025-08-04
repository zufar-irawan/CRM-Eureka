import axios from "axios";
import React from "react";
import Swal from "sweetalert2"

const api = axios.create({
    baseURL: "http://localhost:3000/api",
    headers: {
        "Content-Type": "application/json",
    },
    timeout: 10000,
})

const fetchData = async (
    {setData, setLoading, url} :
    {
        setData:React.Dispatch<React.SetStateAction<any[]>>,
        setLoading:React.Dispatch<React.SetStateAction<boolean>>,
        url:string
    }
) => {
    
    try{
        setLoading(true)
        const response = await api.get(url)
        setData(response.data.data)
    } catch (err: any) {
        Swal.fire({
            title: "Error",
            text: err,
            icon: "error"
        })
    } finally{
        setLoading(false)
    }
}

export default fetchData