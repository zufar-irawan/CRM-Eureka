import axios from "axios";
import Swal from "sweetalert2";

export async function checkAuthStatus(): Promise<boolean> {
    try {
        const response = await axios.get("http://localhost:5000/api/auth/me", {
            withCredentials: true,
        });
        return response.status === 200;
    } catch (error) {
        return false;
    }
}
export async function logout() {
    try {
        const response = await axios.post("http://localhost:5000/api/auth/logout", {}, {
            withCredentials: true,
        });

        const isSuccess = response.data.success;

        if (isSuccess) {
            Swal.fire({
                icon: 'question',
                title: 'Are you sure?',
                text: 'You will be logged out from your account',
                showCancelButton: true,
                confirmButtonText: "logout"
            }).then((result) => {
                if (result.isConfirmed) {
                    Swal.fire({
                        icon: 'success',
                        title: 'Logout Success',
                        text: 'you have been logged out',
                    });
                    window.location.href = "/login";
                }
            });
        } else {
            console.log(response.data.message);
        }
    } catch (error) {
        console.error('Logout error:', error);
        window.location.href = "/login";
    }
}