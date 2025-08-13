// Functions/DeleteData.ts
import Swal from 'sweetalert2';
import axios from "axios";

const api = axios.create({
    baseURL: "http://localhost:3000/api",
    headers: {
        "Content-Type": "application/json",
    },
    timeout: 10000,
})

interface DeleteDataParams {
  url: string;
  ids: string[];
  onSuccess?: () => void;
  onError?: (error: any) => void;
}

export default async function deleteData({
  url,
  ids,
  onSuccess,
  onError,
}: DeleteDataParams) {
  const result = await Swal.fire({
    title: 'Are you sure?',
    text: 'Deleted data cannot be recovered.',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#d33',
    cancelButtonColor: '#3085d6',
    confirmButtonText: 'Yes, delete it!',
  });

  if (result.isConfirmed) {
    try {
      for (const id of ids) {
        await api.delete(`${url}${id}`);
      }

      await Swal.fire('Deleted!', 'Your data has been deleted.', 'success');

      if (onSuccess) onSuccess();
    } catch (error) {
      console.error("Delete failed:", error);
      Swal.fire('Error!', 'Failed to delete data.', 'error');
      if (onError) onError(error);
    }
  }
}