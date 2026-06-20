import { authClient } from "../auth-client"

export const getAdminUser = async () => {
    const {data} = await authClient.token();
    const res = await fetch(`${process.env.NEXT_PUBLIC_API}/api/admin/user`,{
        headers:{
            'Authorization':`Bearer ${data.token}`
        }
    })
    const result = res.json();
    return result || []
}