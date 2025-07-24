"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"

interface CBankContestant {
  id: string
  phone_number: string
  first_name: string
  last_name: string
  gender?: string
  age?: number
  bio?: string
  email?: string
  created_at: string
  updated_at?: string
  social_to_display?: string
  x?: string
  twitter?: string
  instagram?: string
  facebook?: string
  website?: string
  tiktok?: string
  state_of_origin?: string
}

export function useContestantBank() {
  const [contestants, setContestants] = useState<CBankContestant[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchContestants = async (searchTerm?: string) => {
    setLoading(true)
    setError(null)

    try {
      let query = supabase
        .from("contestants")
        .select(`
          *,
          profiles!inner(email)
        `)
        .eq("profiles.user_type", "CONTESTANT")
        .order("created_at", { ascending: false })

      if (searchTerm) {
        query = query.or(
          `first_name.ilike.%${searchTerm}%,last_name.ilike.%${searchTerm}%,phone_number.ilike.%${searchTerm}%`,
        )
      }

      const { data, error } = await query

      if (error) throw error
      setContestants(data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchContestants()
  }, [])

  return {
    contestants,
    loading,
    error,
    refetch: fetchContestants,
    search: fetchContestants,
  }
}
