import { getRoleAuth } from '@/lib/session/usersession'


const AdminLayout = async({children}) => {
  await getRoleAuth('admin')

  return children
}

export default AdminLayout