// app/test-users/page.tsx
"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"

interface User {
  id: string
  email: string
  created_at: string
  email_confirmed_at: string | null
  last_sign_in_at: string | null
  role?: string
  raw_user_meta_data?: any
}

interface Profile {
  id: string
  email: string
  role: string
  sender_id: string
  created_at: string
}

export default function TestUsersPage() {
  const [authUsers, setAuthUsers] = useState<User[]>([])
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentUser, setCurrentUser] = useState<any>(null)

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    setLoading(true)
    setError(null)
    
    const supabase = createClient()

    try {
      // 1. Get current user
      const { data: { user } } = await supabase.auth.getUser()
      setCurrentUser(user)
      console.log("👤 Current user:", user)

      // 2. Fetch auth users (requires admin privileges)
      // Note: This might not work if you don't have admin access
      const { data: authData, error: authError } = await supabase
        .from('auth.users')
        .select('id, email, created_at, email_confirmed_at, last_sign_in_at, raw_user_meta_data')
        .limit(100)

      if (authError) {
        console.warn("⚠️ Could not fetch auth.users directly:", authError.message)
        // Try to fetch profiles instead
        fetchProfiles()
        return
      }

      setAuthUsers(authData || [])
      
      // 3. Also fetch profiles
      await fetchProfiles()

    } catch (err) {
      console.error("💥 Error:", err)
      setError(err instanceof Error ? err.message : "Failed to fetch users")
      // Try to fetch profiles as fallback
      await fetchProfiles()
    } finally {
      setLoading(false)
    }
  }

  const fetchProfiles = async () => {
    const supabase = createClient()
    
    try {
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false })

      if (profileError) {
        console.error("❌ Error fetching profiles:", profileError)
        setError(profileError.message)
        return
      }

      setProfiles(profileData || [])
      console.log("✅ Profiles fetched:", profileData?.length || 0)
    } catch (err) {
      console.error("💥 Error fetching profiles:", err)
    }
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A'
    const date = new Date(dateString)
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 text-zinc-100 p-8">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-2xl font-bold mb-6">Loading users...</h1>
          <div className="space-y-4">
            {[1,2,3].map(i => (
              <div key={i} className="bg-zinc-900 p-4 rounded-lg animate-pulse">
                <div className="h-4 bg-zinc-800 rounded w-48 mb-2"></div>
                <div className="h-3 bg-zinc-800 rounded w-32"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-zinc-100">📊 User Management Test</h1>
          <button
            onClick={fetchUsers}
            className="px-4 py-2 bg-orange-600 hover:bg-orange-500 text-white text-sm font-medium rounded-lg transition-colors"
          >
            🔄 Refresh
          </button>
        </div>

        {/* Current User Info */}
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-4 mb-6">
          <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-2">👤 Current Session</h2>
          {currentUser ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
              <div>
                <span className="text-zinc-500">Email:</span>
                <span className="text-zinc-200 ml-2">{currentUser.email}</span>
              </div>
              <div>
                <span className="text-zinc-500">ID:</span>
                <span className="text-zinc-200 ml-2 text-xs">{currentUser.id?.slice(0, 8)}...</span>
              </div>
              <div>
                <span className="text-zinc-500">Created:</span>
                <span className="text-zinc-200 ml-2 text-xs">{formatDate(currentUser.created_at)}</span>
              </div>
              <div>
                <span className="text-zinc-500">Confirmed:</span>
                <span className="text-zinc-200 ml-2 text-xs">{currentUser.email_confirmed_at ? '✅ Yes' : '❌ No'}</span>
              </div>
            </div>
          ) : (
            <p className="text-zinc-500 text-sm">No user logged in</p>
          )}
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-lg mb-6">
            <p className="text-sm font-medium">⚠️ Error: {error}</p>
          </div>
        )}

        {/* Profiles Table */}
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg overflow-hidden mb-6">
          <div className="px-4 py-3 border-b border-zinc-800 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider">
              📋 Profiles ({profiles.length})
            </h2>
            <span className="text-xs text-zinc-500">From public.profiles</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-zinc-800/50">
                <tr className="text-left text-zinc-400 text-xs uppercase">
                  <th className="px-4 py-3 font-medium">Email</th>
                  <th className="px-4 py-3 font-medium">Role</th>
                  <th className="px-4 py-3 font-medium">Sender ID</th>
                  <th className="px-4 py-3 font-medium">Created At</th>
                  <th className="px-4 py-3 font-medium">User ID</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800">
                {profiles.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-6 text-center text-zinc-500">
                      No profiles found
                    </td>
                  </tr>
                ) : (
                  profiles.map((profile) => (
                    <tr key={profile.id} className="hover:bg-zinc-800/30 transition-colors">
                      <td className="px-4 py-3 font-medium text-zinc-200">{profile.email}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          profile.role === 'superadmin' 
                            ? 'bg-amber-500/20 text-amber-400' 
                            : 'bg-blue-500/20 text-blue-400'
                        }`}>
                          {profile.role}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-zinc-300">{profile.sender_id}</td>
                      <td className="px-4 py-3 text-zinc-400 text-xs">{formatDate(profile.created_at)}</td>
                      <td className="px-4 py-3 text-zinc-500 text-xs font-mono">{profile.id.slice(0, 8)}...</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Auth Users Table (if available) */}
        {authUsers.length > 0 && (
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg overflow-hidden">
            <div className="px-4 py-3 border-b border-zinc-800 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider">
                🔐 Auth Users ({authUsers.length})
              </h2>
              <span className="text-xs text-zinc-500">From auth.users</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-zinc-800/50">
                  <tr className="text-left text-zinc-400 text-xs uppercase">
                    <th className="px-4 py-3 font-medium">Email</th>
                    <th className="px-4 py-3 font-medium">Created</th>
                    <th className="px-4 py-3 font-medium">Confirmed</th>
                    <th className="px-4 py-3 font-medium">Last Sign In</th>
                    <th className="px-4 py-3 font-medium">Role</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800">
                  {authUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-zinc-800/30 transition-colors">
                      <td className="px-4 py-3 font-medium text-zinc-200">{user.email}</td>
                      <td className="px-4 py-3 text-zinc-400 text-xs">{formatDate(user.created_at)}</td>
                      <td className="px-4 py-3">
                        {user.email_confirmed_at ? (
                          <span className="text-emerald-400">✅</span>
                        ) : (
                          <span className="text-amber-400">⏳</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-zinc-400 text-xs">
                        {user.last_sign_in_at ? formatDate(user.last_sign_in_at) : 'Never'}
                      </td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-zinc-700 text-zinc-300">
                          {user.raw_user_meta_data?.role || 'unknown'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Debug Info */}
        <div className="mt-6 bg-zinc-900/50 border border-zinc-800 rounded-lg p-4">
          <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">🔧 Debug Info</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs text-zinc-500">
            <div>
              <span>Total Auth Users: </span>
              <span className="text-zinc-300">{authUsers.length}</span>
            </div>
            <div>
              <span>Total Profiles: </span>
              <span className="text-zinc-300">{profiles.length}</span>
            </div>
            <div>
              <span>Admin Users: </span>
              <span className="text-zinc-300">
                {profiles.filter(p => p.role === 'admin').length}
              </span>
            </div>
            <div>
              <span>Super Admins: </span>
              <span className="text-zinc-300">
                {profiles.filter(p => p.role === 'superadmin').length}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}