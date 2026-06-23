'use client'
import TicketCard from "@/components/dashboard/ticketCard";
import { useSession } from "@/lib/auth-client";
import { myTicket } from "@/lib/serverFunction/myticket";
import { ShieldOff } from "lucide-react";
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

 

  if (user?.isBlock) {
  return (
    <div className="w-full mx-auto p-2">
      <div className="flex flex-col items-center justify-center text-center rounded-xl border border-red-200 bg-red-50/60 dark:bg-red-500/5 dark:border-red-500/20 py-20 px-6 gap-4">
        <div className="w-14 h-14 rounded-full bg-red-100 dark:bg-red-500/10 flex items-center justify-center">
          <ShieldOff className="w-7 h-7 text-red-600 dark:text-red-400" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-red-700 dark:text-red-400">Account Restricted</h2>
          <p className="text-sm text-red-500 dark:text-red-400/80 mt-1.5 max-w-sm">
            Your account has been flagged for fraudulent activity. You are not allowed to add new tickets. Please contact support if you believe this is a mistake.
          </p>
        </div>
        
      </div>
    </div>
  );
}
  
  
  
  return (
    <div className="p-2">
      <h1 className="text-2xl font-semibold">Vendor — My Tickets</h1>
      <p className="mt-2 text-sm mb-10 text-stone-500">Manage tickets you've added.</p>
      <TicketCard tickets={tickets} isLoading={issPending} setLoad={setLoad}/>
    </div>
  )
}
