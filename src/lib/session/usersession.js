import { auth } from "@/lib/auth";
import { headers } from "next/headers";

const getSession = async ()=>{
    const {user} = await auth.api.getSession({
  headers: await headers(),
});
 return user;
}