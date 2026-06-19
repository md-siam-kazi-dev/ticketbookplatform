import { getRoleAuth } from "@/lib/session/usersession"


const VendorLayoutPage = async({children}) => {
  await getRoleAuth('vendor')
  return children
}

export default VendorLayoutPage