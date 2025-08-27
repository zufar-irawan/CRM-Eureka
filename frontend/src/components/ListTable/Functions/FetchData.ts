import axios from "axios";
import React from "react";
import Swal from "sweetalert2"

const api = axios.create({
    baseURL: "http://localhost:3000/api",
    headers: {
        "Content-Type": "application/json",
    },
    timeout: 10000,
    withCredentials: true,
})

type fetchDataProps = {
    setData:React.Dispatch<React.SetStateAction<any[]>>
    setLoading:React.Dispatch<React.SetStateAction<boolean>>
    url:string
    selectedStatus?:string | null
    selectedCategory?:string | null
    selectedPriority?:string | null
    searchTerm?:string
}

const fetchData = async (
    { setData, setLoading, url, selectedStatus, selectedCategory, selectedPriority, searchTerm }: fetchDataProps
) => {
    try {
        setLoading(true)

        // Buat objek params dinamis berdasarkan nilai yang ada
        const params: Record<string, any> = {}
        if (selectedStatus) params.status = selectedStatus
        if (selectedPriority) params.priority = selectedPriority
        if (selectedCategory) params.category = selectedCategory
        if (searchTerm) params.search = searchTerm

        const response = await api.get(url, { params })
        setData(response.data.data)
    } catch (err: any) {
        Swal.fire({
            title: "Error",
            text: err.message || String(err),
            icon: "error"
        })
    } finally {
        setLoading(false)
    }
}


export default fetchData