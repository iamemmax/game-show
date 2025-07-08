"use client"

import { Button, GlowyStrokeText, Input } from "@/components/core"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/core/Card"
import { useRouter } from "next/navigation"
import Link from "next/link"
// import { Trophy } from "lucide-react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/core/Form"
import { useGetAllSeasons, useCreateSeason } from "./misc/api"
import Logo from "../icons/Logo"

// Define the form schema with Zod
const startGameSchema = z.object({
  game_nick: z.string().min(3, "Game nickname must be at least 3 characters"),
})

type StartGameFormValues = z.infer<typeof startGameSchema>

export default function AdminDashboard() {
  const router = useRouter()
  const createSeasonMutation = useCreateSeason()

  // Initialize React Hook Form
  const form = useForm<StartGameFormValues>({
    resolver: zodResolver(startGameSchema),
    defaultValues: {
      game_nick: "",
    },
  })


  const { data } = useGetAllSeasons();


  return (
    <div className="text-white">

      <section className="grid md:grid-cols-2 lg:grid-cols-3">
        <Link href="/admin/seasons" className="text-sm text-[#ff9500] hover:underline">
          <article
            className={`relative rounded-2xl overflow-hidden h-32 bg-[#341D44] hover:border-[#ff00ff]/50 transition-all group p-4`}
          >
            <h1 className="text-2xl font-bold text-white">
              View Seasons
            </h1>
          </article>
        </Link>
      </section>
    </div>
  )
}
