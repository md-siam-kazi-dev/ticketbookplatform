import { authClient } from "../auth-client";

export const manageTicket = async () => {
    const {data} = await authClient.token();
    
    const res = await fetch(`${process.env.NEXT_PUBLIC_API}/api/allticket`,{cache:'no-store'},{
        headers:{
            'Authorization':`Bearer ${data.token}`
        }
    });
    const dataa = await res.json();
    return dataa || [];
}