import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export const getSession = async ()=>{
    const session = await auth.api.getSession({
     headers: await headers(),
});
    return session?.user;
}


export const getRoleAuth = async (role) => {
  const session = await getSession();
  console.log(session)
  
  if(role != session?.role){
    redirect('/nonauthorized');

  }
}