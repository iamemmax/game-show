"use client"

import React, { useState } from "react"
import { Button, CardDescription } from "@/components/core"
import { Input } from "@/components/core"
import { Label } from "@/components/core/Label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/core"
// import { Badge } from "@/components/core"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/core"
import { Trophy, Plus, Calendar, Star, Users, Play } from "lucide-react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { useCreateSeason, useGetAllSeasons } from "../misc/api"
import { TrapeziumButton } from "@/components/core/ButtonTrapezium"
import Link from "next/link"


// Form schema
const createSeasonSchema = z.object({
    season: z.string().min(3, "Season name must be at least 3 characters"),
    year: z.string().min(4, "Year must be 4 characters").max(4, "Year must be 4 characters"),
    description: z.string().optional(),
})

type CreateSeasonFormValues = z.infer<typeof createSeasonSchema>

export default function Page() {
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)

    const { data: seasons, isLoading } = useGetAllSeasons();
    const { mutate: createNewSeason } = useCreateSeason()

    React.useEffect(() => {
        if (isLoading) {
            console.log("Loading seasons...")
        }
        if (seasons) {
            console.log("Fetched seasons:", seasons)
        }
    }    , [isLoading, seasons])

    const form = useForm<CreateSeasonFormValues>({
        resolver: zodResolver(createSeasonSchema),
        defaultValues: {
            season: "",
            year: new Date().getFullYear().toString(),
            description: "",
        },
    })

    const onSubmit = async (values: CreateSeasonFormValues) => {
        console.log("Creating season:", values)
        // Handle form submission here
        setIsCreateModalOpen(false)
        createNewSeason(values,
            {
                onSuccess: () => {
                    console.log("Season created successfully")
                    form.reset()
                },
                onError: (error) => {
                    console.error("Error creating season:", error)
                },
            }
        )
    }

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
        })
    }


    console.log(seasons, "Seasons data")


    return (
        <div className=" md:w-[90%] container mx-auto px-4 !font-montserrat">
            <div className="space-y-4">  <header className="flex items-center justify-between mb-8">

                <h2 className="text-xl font-bold text-white mb-4">ALL SEASONS</h2>
                <TrapeziumButton variant={"green"} className="" size={"sm"}
                    onClick={() => setIsCreateModalOpen(true)}
                >
                    Create Season
                </TrapeziumButton>


                <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>

                    <DialogContent className="bg-[#2a1a35] border-[#ff00ff]/20 text-white">
                        <DialogHeader>
                            <DialogTitle className="text-xl text-[#ff9500]">Create New Season</DialogTitle>
                        </DialogHeader>

                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mt-4 p-4">
                            <div>
                                <Label className="text-sm text-white/70">Season Name</Label>
                                <Input
                                    {...form.register("season")}
                                    placeholder="Enter season name"
                                    className="bg-[#1a0b25] border-[#ff00ff]/30 focus-visible:ring-[#ff00ff]/50 text-white"
                                />
                                {form.formState.errors.season && (
                                    <p className="text-[#ff00ff] text-xs mt-1">{form.formState.errors.season.message}</p>
                                )}
                            </div>

                            <div>
                                <Label className="text-sm text-white/70">Year</Label>
                                <Input
                                    {...form.register("year")}
                                    placeholder="2024"
                                    className="bg-[#1a0b25] border-[#ff00ff]/30 focus-visible:ring-[#ff00ff]/50 text-white"
                                />
                                {form.formState.errors.year && (
                                    <p className="text-[#ff00ff] text-xs mt-1">{form.formState.errors.year.message}</p>
                                )}
                            </div>

                            <div>
                                <Label className="text-sm text-white/70">Description (Optional)</Label>
                                <Input
                                    {...form.register("description")}
                                    placeholder="Enter season description"
                                    className="bg-[#1a0b25] border-[#ff00ff]/30 focus-visible:ring-[#ff00ff]/50 text-white"
                                />
                            </div>

                            <div className="flex justify-end gap-2 pt-4">
                                <Button
                                    type="button"
                                    variant="outlined"
                                    onClick={() => setIsCreateModalOpen(false)}
                                    className="border-[#ff00ff]/30 text-white hover:bg-[#ff00ff]/10"
                                >
                                    Cancel
                                </Button>
                                <Button type="submit" className="bg-gradient-to-r from-[#ff9500] to-[#ff00ff] hover:opacity-90">
                                    Create Season
                                </Button>
                            </div>
                        </form>
                    </DialogContent>
                </Dialog>
            </header>


                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-[repeat(auto-fit,minmax(250px,1fr))] gap-6">
                    {seasons?.map((season) => (
                        <Card
                            key={season.id}
                            className="text-white hover:border-[#ff00ff]/50 transition-all group cursor-pointer"
                        >
                            <CardHeader className="pb-3 pt-2 !px-4">
                                <CardTitle className="text-lg font-bold text-white group-hover:text-[#ff9500] transition-colors !p-0">
                                    {season.season}
                                </CardTitle>
                                <CardDescription>
                                    <span className="text-sm text-white/70">({season.year})</span>
                                </CardDescription>
                            </CardHeader>

                            <CardContent className="flex flex-col gap-y-2 pt-0">
                                {/* <p className="text-xs font-outfit text-white/70 line-clamp-2 min-h-[1lh]">{season.description}</p> */}

                                <div className="flex items-center justify-center gap-2  mt-auto">
                                    <Link href={`/admin/seasons/${season.id}`}>
                                        <TrapeziumButton size="sm" className="" variant={"purple"}>
                                            View Season
                                        </TrapeziumButton>
                                    </Link>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {seasons?.length === 0 && (
                    <div className="text-center py-12">
                        <Trophy className="h-16 w-16 mx-auto mb-4 text-[#ff00ff]/50" />
                        <h3 className="text-xl font-bold text-white mb-2">No Seasons Found</h3>
                        <p className="text-white/70 mb-4">Create your first season to get started</p>
                        <Button
                            onClick={() => setIsCreateModalOpen(true)}
                            className="bg-gradient-to-r from-[#ff9500] to-[#ff00ff] hover:opacity-90"
                        >
                            <Plus className="h-4 w-4 mr-2" />
                            Create First Season
                        </Button>
                    </div>
                )}
            </div>
        </div>
    )
}
