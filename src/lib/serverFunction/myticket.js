

export const myTicket =async (user) => {
    

    console.log(user)
    const res = await fetch(`${process.env.NEXT_PUBLIC_API}/api/myticket/${user?.email}`)
    const data =await res.json()
    // console.log(data)
    return data || []

}