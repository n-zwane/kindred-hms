import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import type { Profile, UserRole } from '@/types'
import { Card, CardContent } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { PageHeader } from '@/components/layout/PageHeader'
import { Avatar } from '@/components/ui/avatar'

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
    <div className="space-y-5">
      <PageHeader
        title="Accounts"
        meta={<span className="pb-2 text-muted">{users.length} users</span>}
      />
      <Card className="overflow-hidden">
        <CardContent className="overflow-x-auto p-0">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-border text-xs font-medium text-muted">
              <tr>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Role</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-b border-border/60 hover:bg-surface-muted">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <Avatar fullName={u.full_name} email={u.email} firstName={u.full_name.split(' ')[0]} lastName={u.full_name.split(' ').slice(1).join(' ')} size="sm" />
                      <span className="font-medium text-foreground">{u.full_name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-muted">{u.email}</td>
                  <td className="px-4 py-3">
                    <Label className="sr-only">Role for {u.full_name}</Label>
                    <select
                      className="h-9 cursor-pointer rounded-md border border-border bg-white px-2 text-xs font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
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
