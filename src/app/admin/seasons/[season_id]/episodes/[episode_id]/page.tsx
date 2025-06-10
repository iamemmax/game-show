"use client"

import {
    Button,
    Dialog,
    DialogContent,
    DialogBody,
    DialogHeader,
    DialogTitle,
    Select,
    SelectTrigger,
    SelectContent,
    SelectItem,
    SelectValue,
    GlowyStrokeText,
    RadioGroup,
    RadioGroupItem,
} from "@/components/core"
import { Input } from "@/components/core/Input"
import { useParams, useRouter } from "next/navigation"
import { ArrowLeft, User, Phone, AlertCircle, Plus, Copy, Award, ScanLine } from "lucide-react"
import Link from "next/link"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/core/Form"
import React, { useState } from "react"
import { convertKebabAndSnakeToTitleCase } from "@/utils/strings"
import toast from "react-hot-toast"
import { TrapeziumButton } from "@/components/core/ButtonTrapezium"
import { useMQTT } from "@/hooks/useMqttService"
import { Question2AnswerData, Question2AnswerDataAPIResponse } from "@/app/components/stages/api/stage2/getQuestion2Answer"
import { useBooleanStateControl } from "@/hooks"
import { Label } from "@/components/core/Label"
import { useGetGameContestants, useAssignContestant, useCreditDebitContestant, CreditDebitContestantRequest } from "@/app/admin/misc/api"

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
    const {
        state: isCreditDebitModalOpen,
        setTrue: openCreditDebitModal,
        setFalse: closeCreditDebitModal,
        setState: setCreditDebitModalState,
    } = useBooleanStateControl()
    const [selectedContestant, setSelectedContestant] = useState("")
    const { isConnected, sendMessage, onMessage } = useMQTT()
    const [isSending, setIsSending] = useState(false)


    const [debitWalletData, setDebitWalletData] = useState<Question2AnswerDataAPIResponse | null>(null)
    const [debitWalletPayload, setDebitWalletPayload] = useState<CreditDebitContestantRequest | null>()

    const sendGameMessage = React.useCallback(
        async (eventCode: string, data: any = {}) => {
            if (!isConnected) {
                toast.error("Not connected to server")
                return
            }
            setIsSending(true)

            try {
                const message = {
                    event: eventCode,
                    payload: {
                        game_episode: Number.parseInt(gameId),
                        ...data,
                    },
                }
                await sendMessage(message)
                refetchContestants();
                toast.success(`Sent: ${eventCode}`)

            } catch (error) {
                console.error("Failed to send message:", error)
                toast.error("Failed to send message")
            } finally {
                setIsSending(false)
            }
        },
        [isConnected, sendMessage, gameId],
    )

    React.useEffect(() => {
        const handleMessage = (message: any) => {
            console.log("Received message:", message)
            if (message.event === "game_s2_question_answer") {
                setDebitWalletData(message.payload.data)
            }
        }

        if (isConnected) {
            onMessage(handleMessage)
            refetchContestants()
        }

        return () => {
            if (isConnected) {
                onMessage(null)
            }
        }
    }, [isConnected, onMessage])

    const startGameEpisode = () => sendGameMessage("game_start")


    const {
        data: contestantsData,
        isLoading: isLoadingContestants,
        refetch: refetchContestants,
    } = useGetGameContestants(Number.parseInt(gameId))


    const assignContestantMutation = useAssignContestant()
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
        navigator.clipboard
            .writeText(code)
            .then(() => {
                toast.success("Login code copied to clipboard!")
            })
            .catch((error) => {
                console.error("Failed to copy login code:", error)
            })
    }

    const { mutate: creditDebit, isLoading: isCreditDebitLoading } = useCreditDebitContestant()

    const handleDebitWallet = () => {
        if (!debitWalletPayload) {
            alert("Please select a credit source");
            return
        };

        const payload: CreditDebitContestantRequest = {
            question_id: Number(debitWalletData?.question_id),
            giver_contestant_id: debitWalletPayload.credit_source === "gameshow_float"
                ? ""
                : debitWalletPayload.giver_contestant_id,
            credit_source: debitWalletPayload.credit_source === "gameshow_float"
                ? "gameshow_float"
                : "",
        };

        creditDebit(payload, {
            onSuccess: () => {
                toast.success("Wallet debited successfully");
                setDebitWalletData(null);
                setDebitWalletPayload(null);
                closeCreditDebitModal();
                refetchContestants();
            },
            onError: (error: unknown) => {
                console.error("Failed to debit wallet:", error);
                toast.error("Failed to debit wallet");
                refetchContestants();
            },
        });


    };


    return (
        <div className="min-h-screen bg-[#1a0b25] text-white !font-montserrat">
            <div className="w-[90%] max-w-[1200px] mx-auto py-4 px-3">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center gap-3 mb-2">
                        <Link href="/admin" className="text-primary hover:text-[#ff00ff] transition-colors">
                            <ArrowLeft className="h-5 w-5" />
                        </Link>
                        <h1 className="text-xl font-bold text-white">EPISODES</h1>
                    </div>
                    <div className="text-sm text-white">Dashboard / Episodes / {gameId}</div>
                </div>

                {isLoadingContestants ? (
                    <div className="text-center py-12">Loading game data...</div>
                ) : !contestantsData ? (
                    <div className="text-center py-12 text-white">
                        <AlertCircle className="h-12 w-12 mx-auto mb-4 text-[#ff00ff]" />
                        <p>Game data not found or error loading data.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-[0.7fr,1fr,1fr] gap-4">
                        {/* Left Column - Episode Information */}
                        <section className="lg:col-span-1 space-y-4">
                            <header className="font-bold text-sm">EPISODE INFORMATION</header>
                            <section className="bg-[#341D44] p-5 rounded-xl">
                                <div>
                                    <div className="rounded-lg space-y-3">
                                        <div>
                                            <div className="text-[0.65rem] text-white mb-1">Episode Name</div>
                                            <div className="font-medium text-[0.825rem]">The Hustle S1</div>
                                        </div>
                                        <div>
                                            <div className="text-[0.65rem] text-white mb-1">Status</div>
                                            <div className="flex items-center gap-1.5 text-[0.825rem]">
                                                <div className="size-2 rounded-full bg-[#d400ff] animate-pulse"></div>
                                                <span>In Progress</span>
                                            </div>
                                        </div>
                                        <div>
                                            <div className="text-[0.65rem] text-white mb-1">Current Stage</div>
                                            <div className="text-[0.825rem] font-medium">Stage One</div>
                                        </div>
                                    </div>
                                </div>

                                {/* Assign Contestant */}
                                <div className="border-white/40 border-t-[0.3px] mt-6 pt-6">
                                    <h2 className="text uppercase font-semibold mb-4 text-white text-[0.8rem]">ASSIGN CONTESTANT</h2>
                                    <Form {...form}>
                                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-2">
                                            <FormField
                                                control={form.control}
                                                name="constestants_attr"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel className="text-[0.7rem] text-white">Contestant Position</FormLabel>
                                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                            <FormControl>
                                                                <SelectTrigger className=" border-[#ff00ff]/30 focus:border-[#ff00ff] focus:ring-[#ff00ff]/50 text-white h-7">
                                                                    <SelectValue placeholder="Select " />
                                                                </SelectTrigger>
                                                            </FormControl>
                                                            <SelectContent className=" border-[#ff00ff]/30 text-white">
                                                                {contestantsData.data.map((contestant: any) => (
                                                                    <SelectItem
                                                                        key={contestant.id}
                                                                        value={contestant.constestant_attr}
                                                                        disabled={getContestantStatus(contestant) === "assigned"}
                                                                        className={getContestantStatus(contestant) === "assigned" ? "opacity-50" : ""}
                                                                    >
                                                                        {convertKebabAndSnakeToTitleCase(contestant.constestant_attr)}{" "}
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
                                                        <FormLabel className="text-[0.7rem] text-white">Contestant Name</FormLabel>
                                                        <FormControl>
                                                            <Input
                                                                {...field}
                                                                placeholder="Enter contestant name"
                                                                className=" border-[#ff00ff]/30 focus-visible:ring-[#ff00ff]/50 text-white h-7"
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
                                                        <FormLabel className="text-[0.7rem] text-white">Phone Number</FormLabel>
                                                        <FormControl>
                                                            <Input
                                                                {...field}
                                                                placeholder="Enter contestant number"
                                                                className=" border-[#ff00ff]/30 focus-visible:ring-[#ff00ff]/50 text-white h-7"
                                                            />
                                                        </FormControl>
                                                        <FormMessage className="text-[#ff00ff]" />
                                                    </FormItem>
                                                )}
                                            />

                                            <div>
                                                <Button
                                                    type="submit"
                                                    disabled={assignContestantMutation.isLoading || form.formState.isSubmitting}
                                                    className="bg-[#6f2da8] hover:bg-[#8a3ad3] text-white w-full"
                                                >
                                                    Assign
                                                </Button>
                                            </div>
                                        </form>
                                    </Form>
                                </div>
                            </section>
                        </section>

                        {/* Right Column - Contestants */}
                        <section className="lg:col-span-2">
                            <h2 className="uppercase font-bold mb-4 text-white text-sm">CONTESTANTS</h2>
                            <div className="">
                                <div className="p-5 rounded-xl bg-[#341D44] grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {
                                        contestantsData.data.map((contestant) => {
                                            const isAssigned = getContestantStatus(contestant) === "assigned"

                                            return (
                                                <article
                                                    key={contestant.id}
                                                    className={`relative rounded-2xl overflow-hidden bg-[#462B58] ${isAssigned
                                                        ? "]"
                                                        : "bg-[#1a0b25] hover:border-[#ff00ff]/50 transition-all group relative"
                                                        }`}
                                                    style={{ height: "100px" }}
                                                >
                                                    {isAssigned && (
                                                        <div className="absolute inset-0 z-0 translate-x-1/2">
                                                            <img src="/images/polygon-mask.svg" alt="" className="w-full h-full object-cover" />
                                                        </div>
                                                    )}

                                                    <div className="relative z-10 p-4 h-full flex flex-col justify-between">
                                                        <div className="relative flex items-start gap-3">

                                                            <div>
                                                                <div className="flex items-center text-xs gap-1 text-white">
                                                                    <User className="h-3 w-3" />
                                                                    {isAssigned ? contestant.name : "Unassigned: Click to assign"}
                                                                </div>
                                                                <div className="text-xs text-white mt-1">
                                                                    {isAssigned && (
                                                                        <div className="flex items-center gap-1">
                                                                            <Phone className="h-3 w-3" />
                                                                            08238495867
                                                                        </div>
                                                                    )}
                                                                </div>
                                                                <div className="flex items-center gap-1 mt-1">
                                                                    {isAssigned && !!contestant.login_code && (
                                                                        <>
                                                                            <ScanLine className="h-3 w-3" />
                                                                            <div className="text-xs text-white">{contestant.login_code}</div>
                                                                            <Copy
                                                                                className="size-3 hover:text-primary cursor-pointer"
                                                                                onClick={() => handleCopyLoginCode(contestant.login_code || "")}
                                                                            />
                                                                        </>
                                                                    )}
                                                                </div>
                                                                <div className="text-xs text-white mt-1">
                                                                    {isAssigned && (
                                                                        <div className="flex items-center gap-1">
                                                                            <Award className="h-3 w-3" />
                                                                            <span>Status:</span>
                                                                            <span className="text-green-400">Active</span>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>

                                                        {isAssigned ? (
                                                            <div className="absolute bottom-0 right-0 w-1/2 text-right mt-auto px-4 pb-1.5 pt-0 ">
                                                                <div className="text-xs text-white font-bold">FINAL POT</div>
                                                                <GlowyStrokeText
                                                                    textclassName="text-base text-center"
                                                                    glowColor="#C76000"
                                                                    strokeWidth={2}
                                                                    glowIntensity="none"
                                                                    fillColor="#FFFFFF"
                                                                    strokeColor="#C76000"
                                                                >
                                                                    {contestant.final_pot}
                                                                </GlowyStrokeText>
                                                            </div>
                                                        ) : (
                                                            <div
                                                                className="absolute inset-0 flex items-center justify-center bg-[#1a0b25]/90 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer rounded-xl"
                                                                onClick={() => openAssignModal(contestant.constestant_attr)}
                                                            >
                                                                <div className="flex flex-col items-center gap-2">
                                                                    <div className="p-3 rounded-full bg-[#ff00ff]/20 text-[#ff00ff]">
                                                                        <Plus className="h-4 w-4" />
                                                                    </div>
                                                                    <span className="text-sm font-medium text-white">Assign Contestant</span>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                </article>
                                            )
                                        })}
                                </div>
                                <div className="flex justify-center gap-4 mt-8 mb-4">
                                    <TrapeziumButton variant="red" size="sm" backgroundColor="#ff00ff" onClick={startGameEpisode}>
                                        START EPISODE
                                    </TrapeziumButton>
                                    {
                                        !!debitWalletData &&
                                        <TrapeziumButton variant="yellow" size="sm" backgroundColor="#ff00ff"

                                            onClick={openCreditDebitModal}>
                                            pp
                                            {/* DEBIT WALLET FOR QUESTION {debitWalletData..question_id} */}
                                        </TrapeziumButton>
                                    }
                                    <TrapeziumButton variant="green" size="sm" backgroundColor="#ff00ff">
                                        END EPISODE
                                    </TrapeziumButton>
                                </div>
                            </div>
                        </section>
                    </div>
                )}
            </div>

            {/* Assign Contestant Modal */}
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent className="bg-[#2a1a35] border-[#ff00ff]/20 text-white">
                    <DialogHeader>
                        <DialogTitle className="text-xl text-primary">
                            Assign Contestant: {convertKebabAndSnakeToTitleCase(selectedContestant)}
                        </DialogTitle>
                    </DialogHeader>

                    <DialogBody>
                        <Form {...modalForm}>
                            <form onSubmit={modalForm.handleSubmit(onModalSubmit)} className="grid gap-2 mt-2">
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
                                                    className=" border-[#ff00ff]/30 focus-visible:ring-[#ff00ff]/50 text-white"
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
                                                    className=" border-[#ff00ff]/30 focus-visible:ring-[#ff00ff]/50 text-white"
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
                                        className="border-[#ff00ff]/30 text-white hover: hover:text-white"
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

            {/* Debit/Credit Modal */}

            <Dialog open={isCreditDebitModalOpen} onOpenChange={setCreditDebitModalState}>
                <DialogContent className="bg-[#2a1a35] border-[#ff00ff]/20 text-white">
                    <DialogHeader>
                        <DialogTitle className="text-xl text-primary">
                            Winning Contestant: {convertKebabAndSnakeToTitleCase(debitWalletData?.data.find((item) => item.is_winner)?.contestant_name || "Unknown")}
                        </DialogTitle>
                    </DialogHeader>

                    <DialogBody>
                        <div className="grid gap-2 mt-2">
                            <div className="text-sm text-gray-300">Contestant ID:
                                {
                                    debitWalletData?.data.find((item) => item.is_winner)?.contestant_id || "Unknown"
                                }
                            </div>
                            {/* <div className="text-sm text-gray-300">Contestant Phone Number: {debitWalletData?.winner_details?.contestant_attr}</div> */}
                            {/* <div className="text-sm text-gray-300">Winning Amount: ₦{debitWalletData.contestant_answers}</div> */}
                        </div>


                        <div className="mt-4">
                            <label className="text-sm text-gray-300 mb-2 block">Credit Source</label>

                            <div className="mt-4">
                                <label className="text-sm text-gray-300 mb-2 block">Credit Source</label>

                                <RadioGroup
                                    // defaultValue="gameshow_float"
                                    onValueChange={(value) => {
                                        if (value === "gameshow_float") {
                                            setDebitWalletPayload((prev) => ({
                                                ...prev,
                                                credit_source: "gameshow_float",
                                                giver_contestant_id: "",
                                                question_id: prev?.question_id ?? (debitWalletData?.question_id ?? 0),
                                            }));
                                        } else {
                                            // For contestant options, value will be the contestant ID
                                            setDebitWalletPayload((prev) => ({
                                                ...prev,
                                                credit_source: "",
                                                giver_contestant_id: Number(value),
                                                question_id: prev?.question_id ?? (debitWalletData?.question_id ?? 0),
                                            }));
                                        }
                                    }}
                                    className="space-y-2"
                                >
                                    {/* Gameshow Float option */}
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="gameshow_float" id="gameshow_float" />
                                        <Label htmlFor="gameshow_float" className="text-white">Gameshow Wallet</Label>
                                    </div>

                                    {/* Divider */}
                                    <div className="py-1">
                                        <div className="h-px w-full bg-[#ff00ff]/20"></div>
                                    </div>

                                    {/* Contestant options */}
                                    <div className="text-sm text-white mb-1">Contestant Wallets:</div>

                                    {contestantsData?.data
                                        ?.filter(
                                            (contestant: any) =>
                                                contestant.id !==
                                                debitWalletData?.data.find((item: any) => item.is_winner)?.contestant_id
                                        )
                                        .map((contestant: any) => (
                                            <div key={contestant.id} className="flex items-center space-x-2 ml-2">
                                                <RadioGroupItem
                                                    value={contestant.id.toString()}
                                                    id={`contestant-${contestant.id}`}
                                                />
                                                <Label
                                                    htmlFor={`contestant-${contestant.id}`}
                                                    className="text-white"
                                                >
                                                    {convertKebabAndSnakeToTitleCase(contestant.name || contestant.constestant_attr)}
                                                    <span>
                                                    </span>
                                                </Label>
                                            </div>
                                        ))}
                                </RadioGroup>
                            </div>
                        </div>


                        <div className="flex justify-end gap-2 mt-4">
                            <Button
                                type="button"
                                variant="outlined"
                                onClick={closeCreditDebitModal}
                                className="border-[#ff00ff]/30 text-white hover: hover:text-white"
                            >
                                Cancel
                            </Button>
                            <Button
                                type="button"
                                disabled={isCreditDebitLoading || !debitWalletPayload}
                                onClick={handleDebitWallet}
                                className="bg-gradient-to-r from-primary to-[#ff00ff] hover:opacity-90 transition-opacity"
                            >
                                Debit Wallet
                            </Button>
                        </div>

                    </DialogBody>
                </DialogContent>
            </Dialog>

        </div>
    )
}
