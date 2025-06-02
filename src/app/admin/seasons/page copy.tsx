"use client"

import { Button, Input } from "@/components/core"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/core/Card"
import { useRouter } from "next/navigation"
import Link from "next/link"
// import { Trophy } from "lucide-react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/core/Form"
import { useGetAllSeasons, useCreateSeason } from "../misc/api"

// Define the form schema with Zod
const createSeasonSchema = z.object({
    season: z.string().min(3, "Game nickname must be at least 3 characters"),
    year: z.string().min(4, "Year must be at least 4 characters").max(4, "Year must be 4 characters"),
})

type StartGameFormValues = z.infer<typeof createSeasonSchema>

export default function AdminDashboard() {
    const router = useRouter()
    const createSeasonMutation = useCreateSeason()

    // Initialize React Hook Form
    const form = useForm<StartGameFormValues>({
        resolver: zodResolver(createSeasonSchema),
        defaultValues: {
            season: "",
            year: new Date().getFullYear().toString(),
        },
    })


    const { data } = useGetAllSeasons();


    return (
        <div className="min-h-screen bg-[#1a0b25] text-white bg-[url('/images/host-bg.png')] bg-no-repeat bg-contain bg-center">
            <div className="container mx-auto py-8 px-4 min-h-dvh">
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-3">
                        {/* <Trophy className="h-8 w-8 text-[#ff9500]" /> */}
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-[#ff9500] to-[#ff00ff] bg-clip-text text-transparent">
                            Hustle Seasons
                        </h1>
                    </div>
                </div>

            </div>
        </div>
    )
}
