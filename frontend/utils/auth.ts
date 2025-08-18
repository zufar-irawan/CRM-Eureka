import axios from "axios";
import Swal from "sweetalert2";

export function isLoggedIn(): boolean {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    return !!token;
}

// export function getToken(): string | null {
//     return typeof window !== "undefined" ? localStorage.getItem("token") : null;
// }

export function getToken(): string | null {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; token=`);
  if (parts.length === 2) {
    return parts.pop()?.split(";").shift() || null;
  }
  return null;
}

export function removeCookie(name: string) {
  document.cookie = `${name}=; path=/; max-age=0; secure; samesite=strict`;
}

export async function logout() {
    const token = getToken()
    const response = await axios.post("http://localhost:5000/api/auth/logout", {}, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    })

    const isSuccess = response.data.success

    if(isSuccess){
        Swal.fire({
            icon:'question',
            title:'Are you sure?',
            text:'You will be logged out from your account',
            showCancelButton: true,
            confirmButtonText: "logout"
        }).then((result) => {
            if(result.isConfirmed){
                Swal.fire({
                    icon:'success',
                    title:'Logout Success',
                    text:'you have been logged out',
                })

                removeCookie('token')
                window.location.href = "/login"
            }
        })
    } else {
        console.log(response.data.message)
    }
}
