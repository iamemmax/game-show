"use client"

import { Button, Dialog, DialogContent, DialogBody, DialogHeader, DialogTitle, Select, SelectTrigger, SelectContent, SelectItem, SelectValue, GlowyStrokeText } from "@/components/core"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/core/Card"
import { Input } from "@/components/core/Input"
import { useParams, useRouter } from "next/navigation"
import { ArrowLeft, Trophy, User, Phone, AlertCircle, Plus, Copy } from "lucide-react"
import Link from "next/link"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/core/Form"
import { useState } from "react"
import { useGetGameContestants, useAssignContestant } from "../misc/api"
import { convertKebabAndSnakeToTitleCase } from "@/utils/strings"
import { cn } from "@/utils/classNames"
import { GAME_STATUSES_ENUMS } from "@/utils/enums"
import toast from "react-hot-toast"

// Define the form schema with Zod
const assignContestantSchema = z.object({
    constestants_attr: z.string().min(1, "Please select a contestant position"),
    name: z.string().min(2, "Name must be at least 2 characters"),
    phone_number: z.string().min(10, "Phone number must be at least 10 digits").max(15, "Phone number is too long"),
})

type AssignContestantFormValues = z.infer<typeof assignContestantSchema>

export default function GameDetails() {
    const params = useParams()
    const gameId = params.episode as string
    const router = useRouter()
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [selectedContestant, setSelectedContestant] = useState("")

    const {
        data: contestantsData,
        isLoading: isLoadingContestants,
        refetch: refetchContestants,
    } = useGetGameContestants(Number.parseInt(gameId))

    const assignContestantMutation = useAssignContestant()

    // Initialize React Hook Form
    const form = useForm<AssignContestantFormValues>({
        resolver: zodResolver(assignContestantSchema),
        defaultValues: {
            constestants_attr: "",
            name: "",
            phone_number: "",
        },
    })

    const modalForm = useForm<AssignContestantFormValues>({
        resolver: zodResolver(assignContestantSchema),
        defaultValues: {
            constestants_attr: "",
            name: "",
            phone_number: "",
        },
    })

    const onSubmit = async (values: AssignContestantFormValues) => {
        try {
            await assignContestantMutation.mutateAsync({
                game_episode: Number.parseInt(gameId),
                constestants_attr: values.constestants_attr,
                name: values.name,
                phone_number: values.phone_number,
            })

            form.reset()
            refetchContestants()
        } catch (error) {
            console.error("Failed to assign contestant:", error)
        }
    }

    const onModalSubmit = async (values: AssignContestantFormValues) => {
        try {
            await assignContestantMutation.mutateAsync({
                game_episode: Number.parseInt(gameId),
                constestants_attr: values.constestants_attr,
                name: values.name,
                phone_number: values.phone_number,
            })

            modalForm.reset()
            setIsModalOpen(false)
            refetchContestants()
        } catch (error) {
            console.error("Failed to assign contestant:", error)
        }
    }

    const openAssignModal = (contestantAttr: string) => {
        setSelectedContestant(contestantAttr)
        modalForm.setValue("constestants_attr", contestantAttr)
        setIsModalOpen(true)
    }

    const getContestantStatus = (contestant: any) => {
        if (contestant.name && contestant.phone_number) {
            return "assigned"
        }
        return "unassigned"
    }

    const handleCopyLoginCode = (code:string)=>{
        navigator.clipboard.writeText(code).then(() => {
            toast.success("Login code copied to clipboard!")
        }).catch((error) => {
            console.error("Failed to copy login code:", error)
        })
    }

    return (
        <div className="min-h-screen bg-[#1a0b25] text-white">
            <div className="container mx-auto py-8 px-4">
                <div className="flex items-center gap-3 mb-8">
                    <Link href="/admin" className="text-primary hover:text-[#ff00ff] transition-colors">
                        <ArrowLeft className="h-5 w-5" />
                    </Link>
                    <div className="flex items-center gap-3">
                        <Trophy className="h-8 w-8 text-primary" />
                        <GlowyStrokeText
                            textclassName="text-[4xl]"
                            strokeWidth={0.3}
                        >
                            Game Episode {gameId}
                        </GlowyStrokeText>
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-[#ff00ff] bg-clip-text text-transparent">
                            Game Episode {gameId}
                        </h1>
                    </div>
                </div>

                {isLoadingContestants ? (
                    <div className="text-center py-12">Loading game data...</div>
                ) : !contestantsData ? (
                    <div className="text-center py-12 text-gray-400">
                        <AlertCircle className="h-12 w-12 mx-auto mb-4 text-[#ff00ff]" />
                        <p>Game data not found or error loading data.</p>
                    </div>
                ) : (
                    <>
                        <Card className="mb-8 border-[#ff00ff]/20 bg-[#2a1a35]/80 backdrop-blur-sm">
                            <CardHeader className="border-b border-[#ff00ff]/20 pb-4">
                                <CardTitle className="text-xl text-primary">Game Information</CardTitle>
                            </CardHeader>
                            <CardContent className="pt-6">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div className="p-4 rounded-lg bg-[#3a2a45] border border-[#ff00ff]/20">
                                        <div className="text-sm text-gray-300">Game Name</div>
                                        <div className="font-medium mt-1">{contestantsData.game.game_nick}</div>
                                    </div>
                                    <div className="p-4 rounded-lg bg-[#3a2a45] border border-[#ff00ff]/20">
                                        <div className="text-sm text-gray-300">Status</div>
                                        <div className="flex items-center gap-1.5 font-medium mt-1">
                                            <div
                                                className={cn(
                                                    "size-3 rounded-full font-medium",
                                                    contestantsData.game.status === "IN_PROGESS"
                                                        ? "bg-[#d400ff] animate-pulse"
                                                        // ? "bg-primary"
                                                        : contestantsData.game.status === "IS_COMPLETED"
                                                            ? "bg-[#00ff00]"
                                                            : "bg-[#ff0000]"
                                                )}
                                            ></div>
                                            {GAME_STATUSES_ENUMS[contestantsData.game.status]}
                                        </div>
                                    </div>
                                    <div className="p-4 rounded-lg bg-[#3a2a45] border border-[#ff00ff]/20">
                                        <div className="text-sm text-gray-300">Current Stage</div>
                                        <div className="font-medium mt-1">{convertKebabAndSnakeToTitleCase(contestantsData.game.stage)}</div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="mb-8 border-[#ff00ff]/20 bg-[#2a1a35]/80 backdrop-blur-sm">
                            <CardHeader className="border-b border-[#ff00ff]/20 pb-4">
                                <CardTitle className="text-xl text-primary">Assign Contestant</CardTitle>
                            </CardHeader>
                            <CardContent className="pt-6">
                                <Form {...form}>
                                    <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4">
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                            <FormField
                                                control={form.control}
                                                name="constestants_attr"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel className="text-sm text-gray-300">Contestant Position</FormLabel>
                                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                            <FormControl>
                                                                <SelectTrigger className="bg-[#3a2a45] border-[#ff00ff]/30 focus:border-[#ff00ff] focus:ring-[#ff00ff]/50 text-white">
                                                                    <SelectValue placeholder="Select position" />
                                                                </SelectTrigger>
                                                            </FormControl>
                                                            <SelectContent className="bg-[#3a2a45] border-[#ff00ff]/30 text-white">
                                                                {contestantsData.data.map((contestant: any) => (
                                                                    <SelectItem
                                                                        key={contestant.id}
                                                                        value={contestant.constestant_attr}
                                                                        disabled={getContestantStatus(contestant) === "assigned"}
                                                                        className={getContestantStatus(contestant) === "assigned" ? "opacity-50" : ""}
                                                                    >
                                                                        {contestant.constestant_attr}{" "}
                                                                        {getContestantStatus(contestant) === "assigned" ? "(Assigned)" : ""}
                                                                    </SelectItem>
                                                                ))}
                                                            </SelectContent>
                                                        </Select>
                                                        <FormMessage className="text-[#ff00ff]" />
                                                    </FormItem>
                                                )}
                                            />

                                            <FormField
                                                control={form.control}
                                                name="name"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel className="text-sm text-gray-300">Contestant Name</FormLabel>
                                                        <FormControl>
                                                            <Input
                                                                {...field}
                                                                placeholder="Full Name"
                                                                className="bg-[#3a2a45] border-[#ff00ff]/30 focus-visible:ring-[#ff00ff]/50 text-white"
                                                            />
                                                        </FormControl>
                                                        <FormMessage className="text-[#ff00ff]" />
                                                    </FormItem>
                                                )}
                                            />

                                            <FormField
                                                control={form.control}
                                                name="phone_number"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel className="text-sm text-gray-300">Phone Number</FormLabel>
                                                        <FormControl>
                                                            <Input
                                                                {...field}
                                                                placeholder="Phone Number"
                                                                className="bg-[#3a2a45] border-[#ff00ff]/30 focus-visible:ring-[#ff00ff]/50 text-white"
                                                            />
                                                        </FormControl>
                                                        <FormMessage className="text-[#ff00ff]" />
                                                    </FormItem>
                                                )}
                                            />
                                        </div>
                                        <div className="mt-2">
                                            <Button
                                                type="submit"
                                                disabled={assignContestantMutation.isLoading || form.formState.isSubmitting}
                                                className="bg-gradient-to-r from-primary to-[#ff00ff] hover:opacity-90 transition-opacity"
                                            >
                                                {assignContestantMutation.isLoading ? "Assigning..." : "Assign Contestant"}
                                            </Button>
                                        </div>
                                    </form>
                                </Form>
                            </CardContent>
                        </Card>

                        <Card className="border-[#ff00ff]/20 bg-[#2a1a35]/80 backdrop-blur-sm">
                            <CardHeader className="border-b border-[#ff00ff]/20 pb-4">
                                <CardTitle className="text-xl text-primary">Contestants</CardTitle>
                            </CardHeader>
                            <CardContent className="pt-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 items-stretch">
                                    {contestantsData.data.map((contestant: any) => {
                                        const isAssigned = getContestantStatus(contestant) === "assigned"

                                        return (
                                            <Card
                                                key={contestant.id}
                                                className={`border lg:min-h-[200px] ${isAssigned
                                                    ? "bg-[#3a2a45] border-primary/30"
                                                    : "bg-[#2a1a35] border-[#ff00ff]/20 hover:border-[#ff00ff]/50 transition-all group relative"
                                                    }`}
                                            >
                                                <CardContent className="p-4">
                                                    <div className="flex items-center gap-3 mb-3">
                                                        <div
                                                            className={`p-2 rounded-full ${isAssigned ? "bg-primary/20 text-primary" : "bg-[#ff00ff]/20 text-[#ff00ff]"
                                                                }`}
                                                        >
                                                            <User className="h-5 w-5" />
                                                        </div>
                                                        <div>
                                                            <h3 className="font-medium">{convertKebabAndSnakeToTitleCase(contestant.constestant_attr)}</h3>
                                                            <p className="text-sm text-gray-300">{contestant.name || "Unassigned"}</p>
                                                        </div>
                                                    </div>

                                                    {isAssigned ? (
                                                        <>
                                                            <div className="flex items-center gap-2 text-sm text-gray-300 mb-3">
                                                                <Phone className="h-3 w-3" />
                                                                {contestant.phone_number}
                                                            </div>

                                                            {contestant.login_code && (
                                                                <div className="flex items-center gap-2  text-sm mb-3">
                                                                    <span className="text-gray-300">Login Code:</span>{" "}
                                                                    <span className="font-medium text-primary">{contestant.login_code}</span>
                                                                    <span className="font-medium text-primary cursor-pointer " onClick={()=>handleCopyLoginCode(contestant.login_code)}><Copy className="size-4 hover:text-primary"/></span>
                                                                </div>
                                                            )}

                                                            <div className="grid grid-cols-2 gap-2 text-sm">
                                                                <div className="flex flex-col p-2 rounded-md bg-[#2a1a35]">
                                                                    <span className="text-white/70 text-xs">Final Pot:</span>{" "}
                                                                    <span className="font-medium">₦{contestant.final_pot}</span>
                                                                </div>
                                                                <div className="flex flex-col p-2 rounded-md bg-[#2a1a35]">
                                                                    <span className="text-white/70 text-xs">Eliminated Stage:</span>{" "}
                                                                    <span className="font-medium">{contestant.eliminated_stage || "Still Active"}</span>
                                                                </div>
                                                            </div>
                                                        </>
                                                    ) : (
                                                        <div
                                                            className="absolute inset-0 flex items-center justify-center bg-[#2a1a35]/80 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer rounded-xl"
                                                            onClick={() => openAssignModal(contestant.constestant_attr)}
                                                        >
                                                            <div className="flex flex-col items-center gap-2">
                                                                <div className="p-3 rounded-full bg-[#ff00ff]/20 text-[#ff00ff]">
                                                                    <Plus className="h-6 w-6" />
                                                                </div>
                                                                <span className="font-medium text-white">Assign Contestant</span>
                                                            </div>
                                                        </div>
                                                    )}
                                                </CardContent>
                                            </Card>
                                        )
                                    })}
                                </div>
                            </CardContent>
                        </Card>
                    </>
                )}
            </div>

            {/* Assign Contestant Modal */}
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent className="bg-[#2a1a35] border-[#ff00ff]/20 text-white">
                    <DialogHeader>
                        <DialogTitle className="text-xl text-primary">Assign Contestant: {convertKebabAndSnakeToTitleCase(selectedContestant)}</DialogTitle>
                    </DialogHeader>

                    <DialogBody>
                        <Form {...modalForm}>
                            <form onSubmit={modalForm.handleSubmit(onModalSubmit)} className="grid gap-4 mt-4">
                                <FormField
                                    control={modalForm.control}
                                    name="constestants_attr"
                                    render={({ field }) => (
                                        <FormItem className="hidden">
                                            <FormControl>
                                                <Input {...field} type="hidden" />
                                            </FormControl>
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={modalForm.control}
                                    name="name"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-sm text-gray-300">Contestant Name</FormLabel>
                                            <FormControl>
                                                <Input
                                                    {...field}
                                                    placeholder="Full Name"
                                                    className="bg-[#3a2a45] border-[#ff00ff]/30 focus-visible:ring-[#ff00ff]/50 text-white"
                                                />
                                            </FormControl>
                                            <FormMessage className="text-[#ff00ff]" />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={modalForm.control}
                                    name="phone_number"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-sm text-gray-300">Phone Number</FormLabel>
                                            <FormControl>
                                                <Input
                                                    {...field}
                                                    placeholder="Phone Number"
                                                    className="bg-[#3a2a45] border-[#ff00ff]/30 focus-visible:ring-[#ff00ff]/50 text-white"
                                                />
                                            </FormControl>
                                            <FormMessage className="text-[#ff00ff]" />
                                        </FormItem>
                                    )}
                                />

                                <div className="flex justify-end gap-2 mt-2">
                                    <Button
                                        type="button"
                                        variant="outlined"
                                        onClick={() => setIsModalOpen(false)}
                                        className="border-[#ff00ff]/30 text-white hover:bg-[#3a2a45] hover:text-white"
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        type="submit"
                                        disabled={assignContestantMutation.isLoading || modalForm.formState.isSubmitting}
                                        className="bg-gradient-to-r from-primary to-[#ff00ff] hover:opacity-90 transition-opacity"
                                    >
                                        {assignContestantMutation.isLoading ? "Assigning..." : "Assign Contestant"}
                                    </Button>
                                </div>
                            </form>
                        </Form>
                    </DialogBody>
                </DialogContent>
            </Dialog>
        </div>
    )
}
