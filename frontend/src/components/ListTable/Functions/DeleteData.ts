// Functions/DeleteData.ts
import Swal from 'sweetalert2';

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
      const response = await fetch(url, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ids }),
      });

      if (!response.ok) {
        throw new Error(`Failed to delete: ${response.statusText}`);
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
