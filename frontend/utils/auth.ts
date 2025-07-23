export function isLoggedIn(): boolean {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    return !!token;
}

export function getToken(): string | null {
    return typeof window !== "undefined" ? localStorage.getItem("token") : null;
}
