import { getRoleAuth } from "@/lib/session/usersession"


const UserLayoutPage = async({children}) => {
  await getRoleAuth('user')
  return children
}

export default UserLayoutPage