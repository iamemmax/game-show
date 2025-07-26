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
  Checkbox,
  Textarea,
} from "@/components/core"
import { Input } from "@/components/core/Input"
import { useParams, useRouter } from "next/navigation"
import { ArrowLeft, User, Phone, AlertCircle, Plus, Copy, Award, ScanLine, Upload, Search, Edit, X } from "lucide-react"
import Link from "next/link"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/core/Form"
import React, { useState, useMemo } from "react"
import {
  useGetGameContestants,
  useAssignContestant,
  useCreditDebitContestant,
  type CreditDebitContestantRequest,
} from "../misc/api"
import { convertKebabAndSnakeToTitleCase } from "@/utils/strings"
import { TrapeziumButton } from "@/components/core/ButtonTrapezium"
import { useMQTT } from "@/hooks/useMqttService"
import { useBooleanStateControl } from "@/hooks"
import { Label } from "@/components/core/Label"
import type { DebitWalletData } from "../misc/types"
import { toast } from "sonner"
import { useContestantBank } from "../misc/api/contestant_bank"

// Enhanced schema with all Supabase fields
const assignContestantSchema = z.object({
  constestants_attr: z.string().min(1, "Please select a contestant position"),
  first_name: z.string().min(2, "First name must be at least 2 characters"),
  last_name: z.string().min(2, "Last name must be at least 2 characters"),
  phone_number: z.string().min(10, "Phone number must be at least 10 digits").max(15, "Phone number is too long"),
  email: z.string().email("Please enter a valid email").optional().or(z.literal("")),
  gender: z.string().optional(),
  age: z.number().min(18, "Must be at least 18 years old").max(100, "Invalid age").optional().or(z.literal(0)),
  bio: z.string().optional(),
  state_of_origin: z.string().optional(),
  instagram: z.string().optional(),
  twitter: z.string().optional(),
  tiktok: z.string().optional(),
  facebook: z.string().optional(),
  website: z.string().optional(),
  x: z.string().optional(),
  social_to_display: z.string().optional(),
  contestant_photo: z.any(),
})

type AssignContestantFormValues = z.infer<typeof assignContestantSchema>

interface MultiCreditDebitContestantRequest extends Omit<CreditDebitContestantRequest, "giver_contestant_id"> {
  giver_contestant_ids: number[]
}

export default function GameDetailsEnhanced() {
  const params = useParams()
  const gameId = params.episode as string
  const router = useRouter()

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [editingContestant, setEditingContestant] = useState<any>(null)

  const {
    state: isCreditDebitModalOpen,
    setTrue: openCreditDebitModal,
    setFalse: closeCreditDebitModal,
    setState: setCreditDebitModalState,
  } = useBooleanStateControl()

  // Search and selection states
  const [selectedContestant, setSelectedContestant] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  const [showContestantSearch, setShowContestantSearch] = useState(false)
  const [selectedSupabaseContestant, setSelectedSupabaseContestant] = useState<any>(null)

  // Other existing states
  const { isConnected, sendMessage, addMessageListener, removeMessageListener } = useMQTT()
  const [isSending, setIsSending] = useState(false)
  const [debitWalletData, setDebitWalletData] = useState<DebitWalletData | null>(null)
  const [debitWalletPayload, setDebitWalletPayload] = useState<MultiCreditDebitContestantRequest | null>()
  const [selectedContestantIds, setSelectedContestantIds] = useState<number[]>([])
  const [creditSource, setCreditSource] = useState<"gameshow_float" | "contestants">()
  const [selectedFile, setSelectedFile] = useState<File | null>(null)

  // Supabase contestants hook
  const { contestants, loading: loadingContestants, search: searchContestants } = useContestantBank()

  // Filtered contestants based on search
  const filteredContestants = useMemo(() => {
    if (!searchTerm) return contestants
    return contestants.filter(
      (contestant) =>
        `${contestant.first_name} ${contestant.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        contestant.phone_number.includes(searchTerm),
    )
  }, [contestants, searchTerm])

  // Existing MQTT and game logic (unchanged)
  const sendGameMessage = React.useCallback(
    async (eventCode: string, data: any = {}) => {
      if (!isConnected) {
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
        refetchContestants()
      } catch (error) {
        console.error("Failed to send message:", error)
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
        console.log(message, "debitWalletData")
        setDebitWalletData(message.payload)
      }
    }

    if (isConnected) {
      addMessageListener(handleMessage)
      refetchContestants()
    }

    return () => {
      removeMessageListener(handleMessage)
    }
  }, [isConnected, addMessageListener, removeMessageListener])

  const startGameEpisode = () => sendGameMessage("game_start")

  const {
    data: contestantsData,
    isLoading: isLoadingContestants,
    refetch: refetchContestants,
  } = useGetGameContestants(Number.parseInt(gameId))

  const assignContestantMutation = useAssignContestant()

  // Enhanced form with all fields
  const modalForm = useForm<AssignContestantFormValues>({
    resolver: zodResolver(assignContestantSchema),
    defaultValues: {
      constestants_attr: "",
      first_name: "",
      last_name: "",
      phone_number: "",
      email: "",
      gender: "",
      age: 0,
      bio: "",
      state_of_origin: "",
      instagram: "",
      twitter: "",
      tiktok: "",
      facebook: "",
      website: "",
      x: "",
      social_to_display: "",
      contestant_photo: null,
    },
  })

  // Edit form
  const editForm = useForm<AssignContestantFormValues>({
    resolver: zodResolver(assignContestantSchema),
  })

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setSelectedFile(file)
      modalForm.setValue("contestant_photo", e.target.files?.[0])
    }
    e.target.value = ""
  }

  // Handle contestant selection from Supabase
  const handleSelectSupabaseContestant = (contestant: any) => {
    setSelectedSupabaseContestant(contestant)

    // Prefill form with selected contestant data
    modalForm.setValue("first_name", contestant.first_name || "")
    modalForm.setValue("last_name", contestant.last_name || "")
    modalForm.setValue("phone_number", contestant.phone_number || "")
    modalForm.setValue("email", contestant.email || "")
    modalForm.setValue("gender", contestant.gender || "")
    modalForm.setValue("age", contestant.age || undefined)
    modalForm.setValue("bio", contestant.bio || "")
    modalForm.setValue("state_of_origin", contestant.state_of_origin || "")
    modalForm.setValue("instagram", contestant.instagram || "")
    modalForm.setValue("twitter", contestant.twitter || "")
    modalForm.setValue("tiktok", contestant.tiktok || "")
    modalForm.setValue("facebook", contestant.facebook || "")
    modalForm.setValue("website", contestant.website || "")
    modalForm.setValue("x", contestant.x || "")
    modalForm.setValue("social_to_display", contestant.social_to_display || "")

    setShowContestantSearch(false)
  }

  const onModalSubmit = async (values: AssignContestantFormValues) => {
    try {
      // Combine first and last name for the API
      const fullName = `${values.first_name} ${values.last_name}`

      await assignContestantMutation.mutateAsync({
        game_episode: Number.parseInt(gameId),
        name: fullName,
        contestant_photo: values.contestant_photo,
        gender: values.gender ?? "MALE",
        age: values.age ?? 0,
        bio: values.bio ?? null,
        state_of_origin: values.state_of_origin ?? null,
        instagram: values.instagram ?? "",
        tiktok: values.tiktok ?? "",
        facebook: values.facebook ?? "",
        website: values.website ?? "",
        x: values.x ?? "",
        contestant_hustle: "", // Provide a sensible default or get from form if available
        date_of_birth: "", // Provide a sensible default or get from form if available
        ...values,
      })

      refetchContestants()
      modalForm.reset()
      setSelectedSupabaseContestant(null)
      setIsModalOpen(false)
      setShowContestantSearch(false)
    } catch (error) {
      console.error("Failed to assign contestant:", error)
    }
  }

  const openAssignModal = (contestantAttr: string) => {
    setSelectedContestant(contestantAttr)
    modalForm.setValue("constestants_attr", contestantAttr)
    setIsModalOpen(true)
  }

  const openEditModal = (contestant: any) => {
    setEditingContestant(contestant)

    // Split name back to first and last
    const nameParts = contestant.name?.split(" ") || ["", ""]
    const firstName = nameParts[0] || ""
    const lastName = nameParts.slice(1).join(" ") || ""

    editForm.reset({
      constestants_attr: contestant.constestants_attr,
      first_name: firstName,
      last_name: lastName,
      phone_number: contestant.phone_number || "",
      // Add other existing fields if available
    })

    setIsEditModalOpen(true)
  }

  const onEditSubmit = async (values: AssignContestantFormValues) => {
    try {
      const fullName = `${values.first_name} ${values.last_name}`.trim()

      // You'll need to create an update mutation
      // await updateContestantMutation.mutateAsync({
      //   id: editingContestant.id,
      //   name: fullName,
      //   phone_number: values.phone_number,
      //   ...values
      // })

      refetchContestants()
      editForm.reset()
      setEditingContestant(null)
      setIsEditModalOpen(false)
      toast.success("Contestant updated successfully")
    } catch (error) {
      console.error("Failed to update contestant:", error)
      toast.error("Failed to update contestant")
    }
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

  // Handle contestant selection for multiple contestants
  const handleContestantSelection = (contestantId: number, checked: boolean) => {
    setSelectedContestantIds((prev) => {
      if (checked) {
        return [...prev, contestantId]
      } else {
        return prev.filter((id) => id !== contestantId)
      }
    })
  }

  // Update payload when credit source or selected contestants change
  React.useEffect(() => {
    if (debitWalletData) {
      setDebitWalletPayload({
        question_id: Number(debitWalletData.question_id),
        credit_source: creditSource === "gameshow_float" ? "gameshow_float" : "",
        giver_contestant_ids: creditSource === "contestants" ? selectedContestantIds : [],
      })
    }
  }, [creditSource, selectedContestantIds, debitWalletData])

  const handleDebitWallet = () => {
    if (!debitWalletPayload) {
      alert("Please select a credit source")
      return
    }
    if (creditSource === "contestants" && selectedContestantIds.length === 0) {
      alert("Please select at least one contestant")
      return
    }

    const payload = {
      question_id: Number(debitWalletData?.question_id),
      giver_contestant_ids: debitWalletPayload.giver_contestant_ids,
      credit_source: debitWalletPayload.credit_source,
    }

    if (creditSource === "contestants" && selectedContestantIds.length > 0) {
      creditDebit(payload, {
        onSuccess: (data) => {
          toast.success(`Wallet debited for contestant`)
          sendGameMessage(`game_s2_question_answer`, {
            question_id: Number(debitWalletData?.question_id),
            data: data?.data,
            question_index: Number(debitWalletData?.question_index),
            show_modal: true,
          })
        },
        onError: (error) => {
          console.error(`Failed to debit wallet for contestant `, error)
          toast.error(`Failed to debit wallet for contestant `)
        },
      })
    } else {
      const singlePayload: CreditDebitContestantRequest = {
        question_id: Number(debitWalletData?.question_id),
        giver_contestant_ids: [],
        credit_source: "gameshow_float",
      }
      creditDebit(singlePayload, {
        onSuccess: (data) => {
          toast.success("Wallet debited successfully")
          sendGameMessage(`game_s2_question_answer`, {
            question_id: Number(debitWalletData?.question_id),
            data: data?.data,
            question_index: Number(debitWalletData?.question_index),
            show_modal: true,
          })
        },
        onError: (error) => {
          console.error("Failed to debit wallet:", error)
          toast.error("Failed to debit wallet")
        },
      })
    }

    sendMessage({
      event: "game_s2_debit_wallet",
      payload: {
        game_episode: Number.parseInt(gameId),
        ...payload,
      },
    })

    setDebitWalletData(null)
    setDebitWalletPayload(null)
    setSelectedContestantIds([])
    setCreditSource(undefined)
    closeCreditDebitModal()
    refetchContestants()
  }

  return (
    <div className="min-h-full text-white !font-montserrat">
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
            <section className="lg:col-span-1 space-y-4 max-h-[1000px]">
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
                        <span>
                          {contestantsData?.game.status === "IN_ACTIVE"
                            ? "Not Started"
                            : contestantsData?.game.status === "IN_PROGRESS"
                              ? "In Progress"
                              : "Completed"}
                        </span>
                      </div>
                    </div>
                    <div>
                      <div className="text-[0.65rem] text-white mb-1">Current Stage</div>
                      <div className="text-[0.825rem] font-medium">
                        {convertKebabAndSnakeToTitleCase(contestantsData?.game.stage)}
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            </section>

            {/* Right Column - Contestants */}
            <section className="lg:col-span-2">
              <h2 className="uppercase font-bold mb-4 text-white text-sm">CONTESTANTS</h2>
              <div className="">
                <div className="p-5 rounded-xl bg-[#341D44] grid grid-cols-1 md:grid-cols-2 gap-4">
                  {contestantsData.data.map((contestant) => {
                    const isAssigned = getContestantStatus(contestant) === "assigned"
                    return (
                      <article
                        key={contestant.id}
                        className={`relative rounded-2xl overflow-hidden bg-[#462B58] ${
                          isAssigned ? "]" : "bg-[#1a0b25] hover:border-[#ff00ff]/50 transition-all group relative"
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
                            <div className="flex-1">
                              <div className="flex items-center text-xs gap-1 text-white">
                                <User className="h-3 w-3" />
                                {isAssigned ? contestant.name : "Unassigned: Click to assign"}
                              </div>
                              <div className="text-xs text-white mt-1">
                                {isAssigned && (
                                  <div className="flex items-center gap-1">
                                    <Phone className="h-3 w-3" />
                                    {contestant.phone_number}
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
                            {isAssigned && (
                              <Button
                                size="sm"
                                variant="light"
                                onClick={() => openEditModal(contestant)}
                                className="h-6 w-6 p-0 hover:bg-[#ff00ff]/20"
                              >
                                <Edit className="h-3 w-3" />
                              </Button>
                            )}
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
                  {debitWalletData !== null && !!debitWalletData?.data && (
                    <TrapeziumButton
                      variant="yellow"
                      size="sm"
                      backgroundColor="#ff00ff"
                      onClick={openCreditDebitModal}
                    >
                      DEBIT WALLET FOR QUESTION
                    </TrapeziumButton>
                  )}
                  <TrapeziumButton variant="green" size="sm" backgroundColor="#ff00ff">
                    END EPISODE
                  </TrapeziumButton>
                </div>
              </div>
            </section>
          </div>
        )}
      </div>

      {/* Enhanced Assign Contestant Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="bg-[#2a1a35] border-[#ff00ff]/20 text-white max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl text-primary">
              Assign Contestant: {convertKebabAndSnakeToTitleCase(selectedContestant)}
            </DialogTitle>
          </DialogHeader>
          <DialogBody>
            {/* Search Section */}
            <div className="mb-4">
              <Button
                type="button"
                onClick={() => setShowContestantSearch(!showContestantSearch)}
                className="mb-3 bg-[#ff00ff]/20 hover:bg-[#ff00ff]/30 text-white border border-[#ff00ff]/30"
              >
                <Search className="h-4 w-4 mr-2" />
                {showContestantSearch ? "Hide" : "Search"} Existing Contestants
              </Button>

              {showContestantSearch && (
                <div className="border border-[#ff00ff]/30 rounded-lg p-4 mb-4">
                  <div className="flex gap-2 mb-3">
                    <Input
                      placeholder="Search by name or phone number..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="flex-1 border-[#ff00ff]/30 focus-visible:ring-[#ff00ff]/50 text-white"
                    />
                    <Button
                      type="button"
                      onClick={() => searchContestants(searchTerm)}
                      disabled={loadingContestants}
                      className="bg-[#ff00ff] hover:bg-[#ff00ff]/80"
                    >
                      <Search className="h-4 w-4" />
                    </Button>
                  </div>

                  {selectedSupabaseContestant && (
                    <div className="mb-3 p-2 bg-[#ff00ff]/10 rounded border border-[#ff00ff]/30 flex items-center justify-between">
                      <span className="text-sm">
                        Selected: {selectedSupabaseContestant.first_name} {selectedSupabaseContestant.last_name}
                      </span>
                      <Button
                        type="button"
                        size="sm"
                        variant="light"
                        onClick={() => setSelectedSupabaseContestant(null)}
                        className="h-6 w-6 p-0"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  )}

                  <div className="max-h-40 overflow-y-auto space-y-2">
                    {loadingContestants ? (
                      <div className="text-center py-4">Loading contestants...</div>
                    ) : filteredContestants.length === 0 ? (
                      <div className="text-center py-4 text-gray-400">No contestants found</div>
                    ) : (
                      filteredContestants.map((contestant) => (
                        <div
                          key={contestant.id}
                          onClick={() => handleSelectSupabaseContestant(contestant)}
                          className="p-3 border border-[#ff00ff]/20 rounded cursor-pointer hover:bg-[#ff00ff]/10 transition-colors"
                        >
                          <div className="font-medium">
                            {contestant.first_name} {contestant.last_name}
                          </div>
                          <div className="text-sm text-gray-400">{contestant.phone_number}</div>
                          {contestant.email && <div className="text-sm text-gray-400">{contestant.email}</div>}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            <Form {...modalForm}>
              <form
                encType="multipart/form-data"
                onSubmit={modalForm.handleSubmit(onModalSubmit)}
                className="grid gap-4 mt-2"
              >
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

                {/* Basic Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={modalForm.control}
                    name="first_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm text-gray-300">First Name *</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="First Name"
                            className="border-[#ff00ff]/30 focus-visible:ring-[#ff00ff]/50 text-white"
                          />
                        </FormControl>
                        <FormMessage className="text-[#ff00ff]" />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={modalForm.control}
                    name="last_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm text-gray-300">Last Name *</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="Last Name"
                            className="border-[#ff00ff]/30 focus-visible:ring-[#ff00ff]/50 text-white"
                          />
                        </FormControl>
                        <FormMessage className="text-[#ff00ff]" />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={modalForm.control}
                    name="phone_number"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm text-gray-300">Phone Number *</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="Phone Number"
                            className="border-[#ff00ff]/30 focus-visible:ring-[#ff00ff]/50 text-white"
                          />
                        </FormControl>
                        <FormMessage className="text-[#ff00ff]" />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={modalForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm text-gray-300">Email</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            type="email"
                            placeholder="Email Address"
                            className="border-[#ff00ff]/30 focus-visible:ring-[#ff00ff]/50 text-white"
                          />
                        </FormControl>
                        <FormMessage className="text-[#ff00ff]" />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormField
                    control={modalForm.control}
                    name="gender"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm text-gray-300">Gender</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="border-[#ff00ff]/30 focus:ring-[#ff00ff]/50 text-white">
                              <SelectValue placeholder="Select gender" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="male">Male</SelectItem>
                            <SelectItem value="female">Female</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage className="text-[#ff00ff]" />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={modalForm.control}
                    name="age"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm text-gray-300">Age</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            type="number"
                            placeholder="Age"
                            onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                            className="border-[#ff00ff]/30 focus-visible:ring-[#ff00ff]/50 text-white"
                          />
                        </FormControl>
                        <FormMessage className="text-[#ff00ff]" />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={modalForm.control}
                    name="state_of_origin"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm text-gray-300">State of Origin</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="State of Origin"
                            className="border-[#ff00ff]/30 focus-visible:ring-[#ff00ff]/50 text-white"
                          />
                        </FormControl>
                        <FormMessage className="text-[#ff00ff]" />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={modalForm.control}
                  name="bio"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm text-gray-300">Bio</FormLabel>
                      <FormControl>
                        <Textarea
                          {...field}
                          placeholder="Tell us about yourself..."
                          className="border-[#ff00ff]/30 focus-visible:ring-[#ff00ff]/50 text-white min-h-[80px]"
                        />
                      </FormControl>
                      <FormMessage className="text-[#ff00ff]" />
                    </FormItem>
                  )}
                />

                {/* Social Media Fields */}
                <div className="space-y-3">
                  <h3 className="text-sm font-medium text-gray-300">Social Media</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={modalForm.control}
                      name="instagram"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm text-gray-300">Instagram</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              placeholder="@username"
                              className="border-[#ff00ff]/30 focus-visible:ring-[#ff00ff]/50 text-white"
                            />
                          </FormControl>
                          <FormMessage className="text-[#ff00ff]" />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={modalForm.control}
                      name="twitter"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm text-gray-300">Twitter</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              placeholder="@username"
                              className="border-[#ff00ff]/30 focus-visible:ring-[#ff00ff]/50 text-white"
                            />
                          </FormControl>
                          <FormMessage className="text-[#ff00ff]" />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={modalForm.control}
                      name="tiktok"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm text-gray-300">TikTok</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              placeholder="@username"
                              className="border-[#ff00ff]/30 focus-visible:ring-[#ff00ff]/50 text-white"
                            />
                          </FormControl>
                          <FormMessage className="text-[#ff00ff]" />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={modalForm.control}
                      name="facebook"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm text-gray-300">Facebook</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              placeholder="Profile URL"
                              className="border-[#ff00ff]/30 focus-visible:ring-[#ff00ff]/50 text-white"
                            />
                          </FormControl>
                          <FormMessage className="text-[#ff00ff]" />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={modalForm.control}
                      name="website"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm text-gray-300">Website</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              placeholder="https://..."
                              className="border-[#ff00ff]/30 focus-visible:ring-[#ff00ff]/50 text-white"
                            />
                          </FormControl>
                          <FormMessage className="text-[#ff00ff]" />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={modalForm.control}
                      name="social_to_display"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm text-gray-300">Primary Social to Display</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger className="border-[#ff00ff]/30 focus:ring-[#ff00ff]/50 text-white">
                                <SelectValue placeholder="Select primary social" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="instagram">Instagram</SelectItem>
                              <SelectItem value="twitter">Twitter</SelectItem>
                              <SelectItem value="tiktok">TikTok</SelectItem>
                              <SelectItem value="facebook">Facebook</SelectItem>
                              <SelectItem value="website">Website</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage className="text-[#ff00ff]" />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                {/* Photo Upload */}
                <div className="w-full max-w-sm mx-auto p-4 bg-white rounded-xl shadow-md border border-gray-200 dark:bg-gray-900 dark:border-gray-700">
                  <label
                    htmlFor="fileInput"
                    className="flex flex-col items-center justify-center p-6 text-center cursor-pointer border-2 border-dashed border-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition"
                  >
                    <Upload className="w-8 h-8 mb-2 text-gray-500 dark:text-gray-400" />
                    <p className="text-gray-600 dark:text-gray-300 text-sm">Tap to upload or use your camera</p>
                    <p className="text-xs text-gray-400 mt-1">JPEG, PNG, or take photo</p>
                    <input
                      id="fileInput"
                      type="file"
                      accept="image/*"
                      capture="environment"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </label>
                  {selectedFile && (
                    <div className="mt-4 text-sm text-gray-700 dark:text-gray-300">
                      Selected: <strong>{selectedFile.name}</strong>
                    </div>
                  )}
                </div>

                <div className="flex justify-end gap-2 mt-6">
                  <Button
                    type="button"
                    variant="outlined"
                    onClick={() => {
                      setIsModalOpen(false)
                      setSelectedSupabaseContestant(null)
                      setShowContestantSearch(false)
                      modalForm.reset()
                    }}
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

      {/* Edit Contestant Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="bg-[#2a1a35] border-[#ff00ff]/20 text-white max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl text-primary">Edit Contestant: {editingContestant?.name}</DialogTitle>
          </DialogHeader>
          <DialogBody>
            <Form {...editForm}>
              <form onSubmit={editForm.handleSubmit(onEditSubmit)} className="grid gap-4 mt-2">
                {/* Similar form fields as assign modal but for editing */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={editForm.control}
                    name="first_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm text-gray-300">First Name *</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="First Name"
                            className="border-[#ff00ff]/30 focus-visible:ring-[#ff00ff]/50 text-white"
                          />
                        </FormControl>
                        <FormMessage className="text-[#ff00ff]" />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={editForm.control}
                    name="last_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm text-gray-300">Last Name *</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="Last Name"
                            className="border-[#ff00ff]/30 focus-visible:ring-[#ff00ff]/50 text-white"
                          />
                        </FormControl>
                        <FormMessage className="text-[#ff00ff]" />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={editForm.control}
                  name="phone_number"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm text-gray-300">Phone Number *</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="Phone Number"
                          className="border-[#ff00ff]/30 focus-visible:ring-[#ff00ff]/50 text-white"
                        />
                      </FormControl>
                      <FormMessage className="text-[#ff00ff]" />
                    </FormItem>
                  )}
                />

                <div className="flex justify-end gap-2 mt-6">
                  <Button
                    type="button"
                    variant="outlined"
                    onClick={() => {
                      setIsEditModalOpen(false)
                      setEditingContestant(null)
                      editForm.reset()
                    }}
                    className="border-[#ff00ff]/30 text-white hover: hover:text-white"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={editForm.formState.isSubmitting}
                    className="bg-gradient-to-r from-primary to-[#ff00ff] hover:opacity-90 transition-opacity"
                  >
                    Update Contestant
                  </Button>
                </div>
              </form>
            </Form>
          </DialogBody>
        </DialogContent>
      </Dialog>

      {/* Debit/Credit Modal - (unchanged from original) */}
      <Dialog open={isCreditDebitModalOpen} onOpenChange={setCreditDebitModalState}>
        <DialogContent className="bg-[#2a1a35] border-[#ff00ff]/20 text-white max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl text-primary">
              Winning Contestant:{" "}
              {convertKebabAndSnakeToTitleCase(
                debitWalletData?.data?.answers.find((item) => item.is_winner)?.contestant_name || "Unknown",
              )}
            </DialogTitle>
          </DialogHeader>
          <DialogBody>
            <div className="grid gap-2 mt-2">
              <div className="text-sm text-gray-300">
                Contestant ID:
                {debitWalletData?.data?.answers.find((item) => item.is_winner)?.contestant_id || "Unknown"}
              </div>
            </div>
            <div className="mt-4">
              <label className="text-sm text-gray-300 mb-2 block">Credit Source</label>
              <RadioGroup
                onValueChange={(value) => {
                  setCreditSource(value as "gameshow_float" | "contestants")
                  if (value === "gameshow_float") {
                    setSelectedContestantIds([])
                  }
                }}
                className="space-y-2"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="gameshow_float" id="gameshow_float" />
                  <Label htmlFor="gameshow_float" className="text-white">
                    Gameshow Wallet
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="contestants" id="contestants" />
                  <Label htmlFor="contestants" className="text-white">
                    Contestant Wallets
                  </Label>
                </div>
              </RadioGroup>
              {creditSource === "contestants" && (
                <div className="mt-4 space-y-2">
                  <div className="text-sm text-white mb-2">Select Contestants to Debit:</div>
                  <div className="max-h-40 overflow-y-auto space-y-2 border border-[#ff00ff]/20 rounded-lg p-3">
                    {contestantsData?.data
                      ?.filter(
                        (contestant: any) =>
                          contestant.id !==
                            debitWalletData?.data?.answers.find((item: any) => item.is_winner)?.contestant_id &&
                          !contestant.is_eliminated,
                      )
                      .map((contestant: any) => (
                        <div key={contestant.id} className="flex items-center space-x-2">
                          <Checkbox
                            id={`contestant-${contestant.id}`}
                            checked={selectedContestantIds.includes(contestant.id)}
                            onCheckedChange={(checked) => handleContestantSelection(contestant.id, checked as boolean)}
                            className="border-[#ff00ff]/30 data-[state=checked]:bg-[#ff00ff] data-[state=checked]:border-[#ff00ff]"
                          />
                          <Label htmlFor={`contestant-${contestant.id}`} className="text-white text-sm cursor-pointer">
                            {convertKebabAndSnakeToTitleCase(contestant.name || contestant.constestant_attr)}
                            <span className="text-gray-400 ml-1">(Pot: {contestant.final_pot || 0})</span>
                          </Label>
                        </div>
                      ))}
                  </div>
                  {selectedContestantIds.length > 0 && (
                    <div className="text-xs text-gray-400 mt-2">
                      Selected: {selectedContestantIds.length} contestant(s)
                    </div>
                  )}
                </div>
              )}
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <Button
                type="button"
                variant="outlined"
                onClick={() => {
                  closeCreditDebitModal()
                  setSelectedContestantIds([])
                  setCreditSource(undefined)
                }}
                className="border-[#ff00ff]/30 text-white hover: hover:text-white"
              >
                Cancel
              </Button>
              <Button
                type="button"
                disabled={
                  isCreditDebitLoading ||
                  !creditSource ||
                  (creditSource === "contestants" && selectedContestantIds.length === 0)
                }
                onClick={handleDebitWallet}
                className="bg-gradient-to-r from-primary to-[#ff00ff] hover:opacity-90 transition-opacity"
              >
                {isCreditDebitLoading ? "Processing..." : "Debit Wallet"}
              </Button>
            </div>
          </DialogBody>
        </DialogContent>
      </Dialog>
    </div>
  )
}
