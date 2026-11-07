import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import type { Profile, UserRole } from '@/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'

const roles: UserRole[] = ['patient', 'receptionist', 'doctor', 'admin', 'it_admin']

export function UsersPage() {
  const [users, setUsers] = useState<Profile[]>([])

  const load = async () => {
    const { data } = await supabase.from('profiles').select('*').order('full_name')
    setUsers((data as Profile[]) ?? [])
  }

  useEffect(() => {
    void load()
  }, [])

  const updateRole = async (id: string, role: UserRole) => {
    await supabase.from('profiles').update({ role }).eq('id', id)
    await load()
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Users & roles</h1>
      <Card>
        <CardHeader>
          <CardTitle>Profiles</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-gray-500">
                <th className="py-2 pr-4">Name</th>
                <th className="py-2 pr-4">Email</th>
                <th className="py-2">Role</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-b border-gray-50">
                  <td className="py-2 pr-4">{u.full_name}</td>
                  <td className="py-2 pr-4">{u.email}</td>
                  <td className="py-2">
                    <Label className="sr-only">Role for {u.full_name}</Label>
                    <select
                      className="rounded border px-2 py-1"
                      value={u.role}
                      onChange={(e) => void updateRole(u.id, e.target.value as UserRole)}
                    >
                      {roles.map((r) => (
                        <option key={r} value={r}>
                          {r}
                        </option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  )
}
