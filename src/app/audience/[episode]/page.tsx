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
import { convertKebabAndSnakeToTitleCase } from "@/utils/strings"
import { cn } from "@/utils/classNames"
import { GAME_STATUSES_ENUMS } from "@/utils/enums"
import toast from "react-hot-toast"
import { useAssignContestant, useGetGameContestants } from "@/app/admin/misc/api"
import { useGetAudienceViewHustlePicks } from "../misc/api"

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
        data: hustlePicksData,
        isLoading: isLoadingHustlePicks,
        refetch: refetchHustlePicks,
    } = useGetAudienceViewHustlePicks(Number.parseInt(gameId))
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

    const handleCopyLoginCode = (code: string) => {
        navigator.clipboard.writeText(code).then(() => {
            toast.success("Login code copied to clipboard!")
        }).catch((error) => {
            console.error("Failed to copy login code:", error)
        })
    }

    return (
        <div className="min-h-screen  text-white">
            <div className="container mx-auto py-8 px-4">
                <div className="flex items-center gap-3 mb-8">
                    <Link href="/admin" className="text-primary hover:text-[#ff00ff] transition-colors">
                        <ArrowLeft className="h-5 w-5" />
                    </Link>
                    <div className="flex items-center gap-3">
                        <Trophy className="h-8 w-8 text-primary" />
                        <GlowyStrokeText
                            size="4xl"
                            strokeWidth={0.1}
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
                                                                    <span className="font-medium text-primary cursor-pointer " onClick={() => handleCopyLoginCode(contestant.login_code)}><Copy className="size-4 hover:text-primary" /></span>
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

            <div className="grid grid-cols-[1fr_5fr_1fr] gap-3 h-full ">
                {/* Left Sidebar */}
                {/* <div className="flex flex-col justify-between">
            <div className="flex justify-center items-center h-3.5 w-full mt-8">
              <Logo />
            </div>
            <div>
              <HustleStages />
            </div>
            <div className=""></div>
         
          </div>
    
          <div className="overflow-y-auto">
      <div className="w-full h-[100px]  flex items-center justify-center">
        <HeaderTitleContainer
          backgroundColor="#791192"
          color="#ed99ff"
          text="Pick-Pad"
          textGradientEnd="#8E17AA"
          textGradientStart="#8E17AA"
          borderGradientStart="#f712fc"
          borderGradientEnd="#e151fe"
          fontSize={45}
          fontFamily="Verdana"
          textStrokeColor="#a219c1"
          textStrokeWidth={4.4}
        />
      </div>

      <div className="flex justify-center  flex-col items-center max-lg:px-3">
                <div className="w-full py-[1rem] max-xl:max-w-[65rem] 2xl:py-[3rem] max-w-[56.25rem] rounded-[.875rem] px-[2rem] 2xl:px-[3rem] bg-[#13051E] -mt-3 relative overflow-hidden">
                    {renderMqttStatus()}

                    <div className="absolute inset-0">
                        <motion.div
                            className="w-[200%] h-[200%] absolute -left-1/2 -top-1/2"
                            style={{
                                background: `conic-gradient(from 0deg at 50% 50%,
                  transparent 0deg,
                  #d91fff 10deg,
                  #d91fff 60deg,
                  #00ffff 90deg,
                  #00ffff 140deg,
                  transparent 180deg,
                  transparent 360deg
                )`,
                            }}
                            animate={{
                                rotate: [0, 360],
                            }}
                            transition={{
                                duration: 3,
                                ease: "linear",
                                repeat: Infinity,
                            }}
                        />
                    </div>

                    <div className="absolute inset-[8px] bg-[#13051E] rounded-[.675rem]" />
                    <div className="relative">
                        <div className="flex justify-between items-center">
                            <div>
                                <h2 className="text-[2.125rem] font-extrabold outline-text text-black">
                                    Stage 1: Hustle Kick-off {user?.contestant_id}
                                </h2>
                            </div>
                            <div>
                                <h2 className="font-extrabold text-[2.75rem] text-white">

                                </h2>



                                <div className="flex items-center justify-center bg-gradient-to-r from-amber-500 to-yellow-500 border-[2px] border-[#C76000] rounded-xl px-3 py-1.5 shadow-md">
                                    <span
                                        className="text-[20px] font-extrabold font-verdana text-white"
                                        style={{
                                            WebkitTextStroke: "1.5px #C76000",
                                            textShadow: "0px 1px 2px rgba(199, 96, 0, 0.5)"
                                        }}
                                    >
                                        {`0:${Math.max(0, timeLeft).toString().padStart(2, "0")}`}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-wrap max-md:gap-[18px] gap-[14px] 2xl:gap-[.875rem] max-xl:gap-y-5 2xl:gap-y-8  2xl:mt-8">
                            {Array.from({ length: 49 }, (_, i) => i + 1).map((num) => (
                                <div
                                    key={num}
                                    onClick={() => handleNumberClick(num)}
                                    className={`cursor-pointer transition-transform ${timeLeft <= 0
                                            ? "cursor-not-allowed"
                                            : isNumberDisabled(num)
                                                ? "opacity-50 cursor-not-allowed"
                                                : selectedNumbers.length >= 5 &&
                                                    !selectedNumbers.includes(num)
                                                    ? "opacity-50 cursor-not-allowed"
                                                    : isLoading
                                                        ? "cursor-wait"
                                                        : "hover:scale-105"
                                        }`}
                                >
                                    <NumberCardContainer
                                        text={String(num)}
                                        textColor={isSelected(num) ? "#fff" : "#F2C94C"}
                                        className="max-xl:w-[54px] max-xl:h-[54px]"
                                        primaryGradientEndColor={
                                            isSelected(num) ? "#FF00FF" : "#3C1272"
                                        }
                                        backgroundColor={
                                            isSelected(num)
                                                ? "#FEC124"
                                                : timeLeft <= 0
                                                    ? "#666"
                                                    : isNumberDisabled(num)
                                                        ? "#666"
                                                        : selectedNumbers.length >= 5 &&
                                                            !selectedNumbers.includes(num)
                                                            ? "#666"
                                                            : "black"
                                        }
                                        active={isSelected(num)}
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
                <div className="flex justify-between items-center mt-4">
                    <div
                        className="flex items-center gap-[2.125rem] border-[5px] border-[#CE64FF]
        py-[1rem] 2xl:px-[2.6875rem]  max-w-[38.5rem] rounded-[.875rem] px-[2rem] bg-[#13051E] mt-2 xl:mt-7"
                    >
                        <div className="flex gap-x-3 items-center">
                            <div className="relative h-[3rem] w-[3rem] bg-[#bf7222] border-[5px] border-[#dba531] rounded-full overflow-hidden">
                                <Image
                                    alt="User avatar"
                                    src="/images/userImage.png"
                                    fill
                                    className="object-cover"
                                />
                            </div>
                            <p className="text-base text-white outline-text-white">Demola</p>
                        </div>

                        <div className="flex divide-x-2 divide-[#4B1874]">
                            {Array.from({ length: 5 }, (_, i) => (
                                <div key={i} className="px-2">
                                    <NumberCardContainer
                                        text={selectedNumbers[i] ? String(selectedNumbers[i]) : ""}
                                        textColor="#F2C94C"
                                        width={55}
                                        height={45}
                                    />
                                </div>
                            ))}
                        </div>
                    </div>

                    {isLoading && (
                        <div className="fixed top-0 right-0 m-4">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-400"></div>
                        </div>
                    )}

                    <Button
                        className="bg-pink-950"
                        onClick={onNext}
                        disabled={isLoading || selectedNumbers.length !== 5}
                    >
                        Proceed
                    </Button>
                </div>
            </div>

            <ErrorModal
                isErrorModalOpen={isErrorModalOpen}
                setErrorModalState={() => {
                    setErrorModalState(false);
                }}
                subheading={
                    errorModalMessage || "Please check your inputs and try again."
                }
            ></ErrorModal>
        </div>
       
    
    <div>
        <HustleSideBar showJackpot={false} showHustlerCard={false} showEmptyCard={true} />
    </div> */
}
        </div >
         
        </div >
    )
}
