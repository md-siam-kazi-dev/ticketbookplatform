'use client'
import TicketCard from "@/components/dashboard/ticketCard";
import { useSession } from "@/lib/auth-client";
import { myTicket } from "@/lib/serverFunction/myticket";
// import { getSession } from "@/lib/session/usersession";
// import { getSession } from "better-auth/api"
import { useEffect, useState } from "react";

export default  function Page() {
   
  const [tickets,setTickets] = useState([]);
  const [issPending,setIsPending] = useState(true)
  const {data,isPending} = useSession();
  const user = data?.user
  const [load,setLoad] = useState(false)
  useEffect(() => {

    const getData = async() => {

      if(!isPending){
        const ticketss= await myTicket(user)
        console.log(ticketss)
        setTickets(ticketss)
        setIsPending(false)

      }
     
     
      
    }
    getData()
    

  },[isPending,load])

 


  
  
  
  return (
    <div className="p-2">
      <h1 className="text-2xl font-semibold">Vendor — My Tickets</h1>
      <p className="mt-2 text-sm mb-10 text-stone-500">Manage tickets you've added.</p>
      <TicketCard tickets={tickets} isLoading={issPending} setLoad={setLoad}/>
    </div>
  )
}
