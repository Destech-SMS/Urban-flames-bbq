// lib/supabase/roles.ts
import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"

export type AppRole = "super_admin" | "admin" | "manager" | "staff"

export async function getCurrentUserProfile() {
  const supabase = await createClient()
  
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) return null

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single()

  if (profileError || !profile) return null

  return profile
}

export async function requireRole(allowedRoles: AppRole[]) {
  const profile = await getCurrentUserProfile()

  if (!profile) {
    redirect("/login")
  }

  if (!allowedRoles.includes(profile.role as AppRole)) {
    redirect("/unauthorized") // Redirect if role doesn't match
  }

  return profile
}