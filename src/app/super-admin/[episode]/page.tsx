"use client"

import { useState, useEffect, useCallback } from "react"
import {
  Monitor,
  Wifi,
  WifiOff,
  RefreshCw,
  Users,
  Mic,
  Eye,
  Send,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Settings,
  Zap,
  Activity,
  Phone,
  Award,
  DollarSign,
  SkipForward,
  RotateCcw,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, Badge, Button, Separator } from "@/components/core"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/core"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/core"
import { Checkbox, Dialog, DialogContent, DialogHeader, DialogTitle, DialogBody } from "@/components/core"
import { Label } from "@/components/core/Label"
import { ScrollArea } from "@/components/core/ScrollArea"
import { RadioGroup, RadioGroupItem } from "@/components/core"
import { useMQTT } from "@/hooks/useMqttService"
import {
  useGetGameContestants,
  useCreditDebitContestant,
  type CreditDebitContestantRequest,
} from "@/app/admin/misc/api"
import toast from "react-hot-toast"
import { useParams } from "next/navigation"
import { format } from "date-fns"
import { convertKebabAndSnakeToTitleCase } from "@/utils/strings"
import { useBooleanStateControl } from "@/hooks"
import { STEP_PROGRESSION, UNIVERSAL_GAME_STEPS, UniversalGameStep } from "@/constants"
import { DebitWalletData, GameInfo, MultiCreditDebitContestantRequest, ParticipantStatus, SuperAdminSystemEvent } from "../misc/types"






const ENHANCED_GAME_EVENTS = {
  GAME_CONTROL: [
    {
      code: "game_start",
      label: "Start Game",
      description: "Initialize the game session",
      requiresAPI: true,
      apiEndpoint: "startGame",
      universalStep: UNIVERSAL_GAME_STEPS.GAME_START,
    },
    {
      code: "game_end",
      label: "End Game",
      description: "Terminate the game session",
      requiresAPI: false,
      universalStep: UNIVERSAL_GAME_STEPS.GAME_END,
    },
  ],
  STAGE_1: [
    {
      code: "game_s1_init",
      label: "Initialize Stage 1",
      description: "Start Stage 1 - Startup Capital",
      requiresAPI: false,
      universalStep: UNIVERSAL_GAME_STEPS.STAGE1_INIT,
    },
    {
      code: "game_s1_hustle_pick_time_elapse",
      label: "End Hustle Pick Timer",
      description: "Stop hustle selection timer",
      requiresAPI: true,
      apiEndpoint: "handleHustlePickTimeElapse",
      universalStep: UNIVERSAL_GAME_STEPS.STAGE1_HUSTLE_REVEAL,
    },
    {
      code: "game_s1_hustle_reveal",
      label: "Reveal Hustles",
      description: "Show selected hustles",
      requiresAPI: false,
      universalStep: UNIVERSAL_GAME_STEPS.STAGE1_HUSTLE_REVEAL,
    },
    {
      code: "game_s1_questions_prep",
      label: "Prep Questions",
      description: "Prepare Stage 1 questions",
      requiresAPI: false,
      universalStep: UNIVERSAL_GAME_STEPS.STAGE1_QUESTIONS_PREP,
    },
    {
      code: "game_s1_question_reveal",
      label: "Reveal Question",
      description: "Show current question",
      requiresAPI: false,
      universalStep: UNIVERSAL_GAME_STEPS.STAGE1_QUESTION_REVEAL,
    },
    {
      code: "game_s1_timer_start",
      label: "Start Question Timer",
      description: "Begin question countdown",
      requiresAPI: false,
      universalStep: UNIVERSAL_GAME_STEPS.STAGE1_TIMER_RUNNING,
    },
    {
      code: "game_s1_question_bids_reveal",
      label: "Reveal Bids",
      description: "Show contestant answers",
      requiresAPI: false,
      universalStep: UNIVERSAL_GAME_STEPS.STAGE1_BIDS_REVEAL,
    },
    {
      code: "game_s1_results_reveal",
      label: "Reveal Results",
      description: "Show Stage 1 results",
      requiresAPI: true,
      apiEndpoint: "endStageOne",
      universalStep: UNIVERSAL_GAME_STEPS.STAGE1_RESULTS,
    },
  ],
  STAGE_2: [
    {
      code: "game_s2_init",
      label: "Initialize Stage 2",
      description: "Start Stage 2 - Opportunity",
      requiresAPI: true,
      apiEndpoint: "initStage2",
      universalStep: UNIVERSAL_GAME_STEPS.STAGE2_INIT,
    },
    {
      code: "game_s2_prep",
      label: "Prep Stage 2",
      description: "Prepare Stage 2 questions",
      requiresAPI: false,
      universalStep: UNIVERSAL_GAME_STEPS.STAGE2_PREP,
    },
    {
      code: "game_s2_question_reveal",
      label: "Reveal Question",
      description: "Show current question",
      requiresAPI: false,
      universalStep: UNIVERSAL_GAME_STEPS.STAGE2_QUESTION_REVEAL,
    },
    {
      code: "game_s2_timer_start",
      label: "Start Timer",
      description: "Begin question countdown",
      requiresAPI: false,
      universalStep: UNIVERSAL_GAME_STEPS.STAGE2_TIMER_RUNNING,
    },
    {
      code: "game_s2_question_options_select_reveal",
      label: "Reveal Options",
      description: "Show answer options",
      requiresAPI: false,
      universalStep: UNIVERSAL_GAME_STEPS.STAGE2_OPTIONS_REVEAL,
    },
    {
      code: "game_s2_results_reveal",
      label: "Reveal Results",
      description: "Show Stage 2 results",
      requiresAPI: true,
      apiEndpoint: "endStageTwo",
      universalStep: UNIVERSAL_GAME_STEPS.STAGE2_RESULTS,
    },
  ],
  STAGE_3: [
    {
      code: "game_s3_init",
      label: "Initialize Stage 3",
      description: "Start Stage 3 - Dud or Opportunity",
      requiresAPI: false,
      universalStep: UNIVERSAL_GAME_STEPS.STAGE3_INIT,
    },
    {
      code: "game_s3_prep",
      label: "Prep Stage 3",
      description: "Prepare dud/opportunity picks",
      requiresAPI: false,
      universalStep: UNIVERSAL_GAME_STEPS.STAGE3_PREP,
    },
    {
      code: "game_s3_start",
      label: "Start Picks",
      description: "Begin dud/opportunity selection",
      requiresAPI: false,
      universalStep: UNIVERSAL_GAME_STEPS.STAGE3_PICKS_START,
    },
    {
      code: "game_s3_end",
      label: "End Stage 3",
      description: "Complete Stage 3",
      requiresAPI: true,
      apiEndpoint: "endStageThree",
      universalStep: UNIVERSAL_GAME_STEPS.STAGE3_END,
    },
  ],
  SYSTEM: [
    { code: "system_refresh", label: "Refresh Screen", description: "Force screen refresh" },
    { code: "system_reconnect", label: "Reconnect MQTT", description: "Force MQTT reconnection" },
    { code: "system_status_check", label: "Status Check", description: "Request status update" },
    {
      code: "system_heartbeat_request",
      label: "Request Heartbeat",
      description: "Request all participants to send status",
    },
    {
      code: "universal_step_change",
      label: "Change Universal Step",
      description: "Force all participants to specific step",
    },
  ],
}



export default function SuperAdminDashboard() {
  const { isConnected, sendMessage, addMessageListener, removeMessageListener } = useMQTT()
  const [participants, setParticipants] = useState<ParticipantStatus[]>([])
  const [systemEvents, setSystemEvents] = useState<SuperAdminSystemEvent[]>([])
  const [selectedParticipants, setSelectedParticipants] = useState<string[]>([])
  const [selectedEvent, setSelectedEvent] = useState("")
  const [customPayload, setCustomPayload] = useState("")
  const gameId = (useParams().episode as string) || "1"
  const [isLoading, setIsLoading] = useState(false)
  const [gameInfo, setGameInfo] = useState<GameInfo | null>(null)
  const [currentUniversalStep, setCurrentUniversalStep] = useState<UniversalGameStep>(UNIVERSAL_GAME_STEPS.GAME_SETUP)

  // Debit wallet functionality
  const [debitWalletData, setDebitWalletData] = useState<DebitWalletData | null>(null)
  const [debitWalletPayload, setDebitWalletPayload] = useState<MultiCreditDebitContestantRequest | null>()
  const [selectedContestantIds, setSelectedContestantIds] = useState<number[]>([])
  const [creditSource, setCreditSource] = useState<"gameshow_float" | "contestants">()

  const {
    state: isCreditDebitModalOpen,
    setTrue: openCreditDebitModal,
    setFalse: closeCreditDebitModal,
  } = useBooleanStateControl()

  // Fetch contestants data
  const {
    data: contestantsData,
    isLoading: isLoadingContestants,
    refetch: refetchContestants,
  } = useGetGameContestants(Number.parseInt(gameId))

  const { mutate: creditDebit, isLoading: isCreditDebitLoading } = useCreditDebitContestant()

  // Initialize participants from contestants data
  useEffect(() => {
    if (contestantsData?.data && contestantsData?.game) {
      setGameInfo(contestantsData.game)

      const contestantParticipants: ParticipantStatus[] = contestantsData.data.map((contestant) => ({
        id: `contestant-${contestant.id}`,
        name: contestant.name || `Contestant ${contestant.constestant_attr}`,
        type: "contestant" as const,
        currentScreen: "waiting",
        currentStep: UNIVERSAL_GAME_STEPS.GAME_SETUP,
        isConnected: false,
        lastSeen: null,
        gameStage: contestantsData.game.stage,
        contestantId: contestant.id,
        contestantData: contestant,
      }))

      const systemParticipants: ParticipantStatus[] = [
        {
          id: `host-${gameId}`,
          name: "Game Host",
          type: "host",
          currentScreen: "host-dashboard",
          currentStep: UNIVERSAL_GAME_STEPS.GAME_SETUP,
          isConnected: false,
          lastSeen: null,
          gameStage: contestantsData.game.stage,
        },
        {
          id: `audience-${gameId}`,
          name: "Audience View",
          type: "audience",
          currentScreen: "audience-waiting",
          currentStep: UNIVERSAL_GAME_STEPS.GAME_SETUP,
          isConnected: false,
          lastSeen: null,
          gameStage: contestantsData.game.stage,
        },
      ]

      setParticipants([...contestantParticipants, ...systemParticipants])
    }
  }, [contestantsData, gameId])

  // Handle incoming MQTT messages
  useEffect(() => {
    const handleMQTTMessage = (message: any) => {
      console.log("Super Admin received:", message)
      addSystemEvent("info", `Received: ${message.event || "Unknown Event"}`, "MQTT")
      if (message.payload.new_universal_step) {
        setCurrentUniversalStep(message.payload.new_universal_step)

      }
      // Handle connection status updates
      if (message.event === "participant_connection_status") {
        handleConnectionStatusUpdate(message)
      }

      // Handle screen changes
      if (message.event === "participant_screen_change") {
        handleScreenChangeUpdate(message)
      }

      // Handle universal step changes
      if (message.event === "participant_step_change") {
        handleStepChangeUpdate(message)
      }

      // Handle heartbeat responses
      if (message.event === "participant_sync") {
        handleHeartbeatResponse(message)
      }

      // Handle debit wallet data
      if (message.event === "game_s2_question_answer") {
        console.log(message, "debitWalletData")
        setDebitWalletData(message.payload)
      }


      // Handle game state updates
      if (message.event === "game_general_update") {
        if (message.payload.currentStage) {
          updateAllParticipantsGameStage(message.payload.currentStage)
        }
        if (message.payload.currentStep) {
          setCurrentUniversalStep(message.payload.currentStep)
        }
      }
    }


    if (isConnected) {
      addMessageListener(handleMQTTMessage);
      addSystemEvent("success", "MQTT connection established", "System")
      requestHeartbeat()
    } else {
      addSystemEvent("error", "MQTT connection lost", "System")
      setParticipants((prev) => prev.map((p) => ({ ...p, isConnected: false })))
    }

    return () => {
      removeMessageListener(handleMQTTMessage);
    };


  }, [isConnected, addMessageListener, removeMessageListener])

  const addSystemEvent = (type: SuperAdminSystemEvent["type"], message: string, source: string) => {
    const event: SuperAdminSystemEvent = {
      id: Date.now().toString(),
      timestamp: new Date(),
      type,
      message,
      source,
    }
    setSystemEvents((prev) => [event, ...prev.slice(0, 99)])
  }

  const handleConnectionStatusUpdate = (message: any) => {
    const { payload } = message
    setParticipants((prev) =>
      prev.map((p) =>
        p.id === payload.participant_id
          ? {
            ...p,
            isConnected: payload.is_connected,
            lastSeen: new Date(payload.timestamp),
            currentScreen: payload.current_screen,
            currentStep: payload.current_step || p.currentStep,
            gameStage: payload.game_stage,
          }
          : p,
      ),
    )

    addSystemEvent(
      payload.is_connected ? "success" : "warning",
      `${payload.participant_name} ${payload.is_connected ? "connected" : "disconnected"}`,
      "Connection Monitor",
    )
  }

  const handleScreenChangeUpdate = (message: any) => {
    const { payload } = message
    setParticipants((prev) =>
      prev.map((p) =>
        p.id === payload.participant_id
          ? {
            ...p,
            currentScreen: payload.current_screen,
            lastSeen: new Date(payload.timestamp),
          }
          : p,
      ),
    )

    addSystemEvent(
      "info",
      `Screen changed: ${payload.previous_screen} → ${payload.current_screen}`,
      payload.participant_id,
    )
  }

  const handleStepChangeUpdate = (message: any) => {
    const { payload } = message
    setParticipants((prev) =>
      prev.map((p) =>
        p.id === payload.participant_id
          ? {
            ...p,
            currentStep: payload.current_step,
            lastSeen: new Date(payload.timestamp),
          }
          : p,
      ),
    )

    addSystemEvent("info", `Step changed: ${payload.previous_step} → ${payload.current_step}`, payload.participant_id)
  }

  const handleHeartbeatResponse = (message: any) => {
    const { payload } = message
    setParticipants((prev) =>
      prev.map((p) =>
        p.id === payload.participant_id
          ? {
            ...p,
            isConnected: true,
            lastSeen: new Date(),
            currentScreen: payload.current_screen || p.currentScreen,
            currentStep: payload.current_step || p.currentStep,
            gameStage: payload.game_stage || p.gameStage,
          }
          : p,
      ),
    )
  }

  const updateAllParticipantsGameStage = (newStage: string) => {
    setParticipants((prev) =>
      prev.map((p) => ({
        ...p,
        gameStage: newStage,
      })),
    )
  }

  const requestHeartbeat = () => {
    sendGameMessage("system_heartbeat_request", [], {
      request_id: Date.now().toString(),
      timestamp: new Date().toISOString(),
    })
  }

  const sendGameMessage = useCallback(
    async (eventCode: string, targetParticipants: string[] = [], customData: any = {}) => {
      if (!isConnected) {
        toast.error("Not connected to MQTT broker")
        return
      }

      setIsLoading(true)
      try {
        const message = {
          event: eventCode,
          payload: {
            game_episode: Number.parseInt(gameId),
            target_participants: targetParticipants,
            timestamp: new Date().toISOString(),
            source: "super_admin",
            current_universal_step: currentUniversalStep,
            ...customData,
          },
        }

        await sendMessage(message)
        addSystemEvent(
          "success",
          `Sent ${eventCode} to ${targetParticipants.length ? targetParticipants.join(", ") : "all participants"}`,
          "Super Admin",
        )
        toast.success(`Event sent: ${eventCode}`)
      } catch (error) {
        console.error("Failed to send message:", error)
        addSystemEvent("error", `Failed to send ${eventCode}: ${error}`, "Super Admin")
        toast.error("Failed to send message")
      } finally {
        setIsLoading(false)
      }
    },
    [isConnected, sendMessage, gameId, currentUniversalStep],
  )

  // Universal step management
  const changeUniversalStep = (newStep: UniversalGameStep, targetParticipants: string[] = []) => {
    setCurrentUniversalStep(newStep)
    sendGameMessage("universal_step_change", targetParticipants, {
      new_universal_step: newStep,
      force_sync: true,

    })
  }

  const progressToNextStep = () => {
    const currentStep = currentUniversalStep
    if (STEP_PROGRESSION[currentStep]) {
    }
    const nextStep = STEP_PROGRESSION[currentUniversalStep]
    if (nextStep) {
      changeUniversalStep(nextStep)
    }
  }

  const handleRefresh = (type: "contestant" | "host" | "audience" | "all" | "all_contestants", participant_id?: string) => {
    const targets =
      type === "all"
        ? participants.map((p) => p.id)
        : type === "all_contestants"
          ? participants.filter((p) => p.type === "contestant").map((p) => p.id)
          :
          participant_id ?
            participants
              .filter((p) => (p.type === type))
              .filter((p) => (p.id == participant_id))
              .map((p) => p.id)
            :
            []

    sendGameMessage("system_refresh", targets)
  }

  const handleReconnect = (type: "contestant" | "host" | "audience" | "all" | "all_contestants", participant_id?: string) => {
    const targets =
      type === "all"
        ? participants.map((p) => p.id)
        : type === "all_contestants"
          ? participants.filter((p) => p.type === "contestant").map((p) => p.id)
          :
          participant_id ?
            participants
              .filter((p) => (p.type === type))
              .filter((p) => (p.id == participant_id))
              .map((p) => p.id)
            :
            []
    sendGameMessage("system_reconnect", targets)
  }

  const handleSendEvent = () => {
    if (!selectedEvent) {
      toast.error("Please select an event")
      return
    }

    let payload = {}
    if (customPayload) {
      try {
        payload = JSON.parse(customPayload)
      } catch (error) {
        toast.error("Invalid JSON in custom payload")
        return
      }
    }

    // Find the event configuration
    const eventConfig = Object.values(ENHANCED_GAME_EVENTS)
      .flat()
      .find((event) => event.code === selectedEvent)

    if (eventConfig && "requiresAPI" in eventConfig && eventConfig?.requiresAPI) {
      addSystemEvent("warning", `Event ${selectedEvent} requires API call - implement API integration`, "Super Admin")
    }

    // Update universal step if event has one
    if (eventConfig && "universalStep" in eventConfig && eventConfig.universalStep) {
      setCurrentUniversalStep(eventConfig.universalStep)
      payload = { ...payload, new_universal_step: eventConfig.universalStep }
    }

    sendGameMessage(selectedEvent, selectedParticipants, payload)
  }

  // Debit wallet functionality
  const handleContestantSelection = (contestantId: number, checked: boolean) => {
    setSelectedContestantIds((prev) => {
      if (checked) {
        return [...prev, contestantId]
      } else {
        return prev.filter((id) => id !== contestantId)
      }
    })
  }

  useEffect(() => {
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
          sendGameMessage(`game_s2_question_answer`, [], {
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
          sendGameMessage(`game_s2_question_answer`, [], {
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

  const getStatusColor = (isConnected: boolean) => {
    return isConnected ? "bg-green-500" : "bg-red-500"
  }

  const getEventTypeColor = (type: SuperAdminSystemEvent["type"]) => {
    switch (type) {
      case "success":
        return "text-green-400"
      case "error":
        return "text-red-400"
      case "warning":
        return "text-yellow-400"
      default:
        return "text-blue-400"
    }
  }

  const formatCurrency = (amount: string) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(Number(amount))
  }

  if (isLoadingContestants) {
    return (
      <div className="min-h-screen bg-[#1a0b25] text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#ff00ff] mx-auto mb-4"></div>
          <p>Loading game data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#1a0b25] text-white p-6 font-montserrat">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Super Admin Dashboard</h1>
            {gameInfo && (
              <div className="flex items-center gap-4 mt-2 text-sm">
                <span>Game: {gameInfo.game_nick}</span>
                <span>Status: {gameInfo.status}</span>
                <span>Stage: {gameInfo.stage}</span>
                <span>Universal Step: {currentUniversalStep}</span>
              </div>
            )}
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${isConnected ? "bg-green-500" : "bg-red-500"} animate-pulse`} />
              <span className="text-sm">{isConnected ? "Connected" : "Disconnected"}</span>
            </div>
            <Button onClick={requestHeartbeat} size="sm" className="bg-[#ff00ff] hover:bg-[#ff00ff]/80">
              <Activity className="w-4 h-4 mr-2" />
              Ping All
            </Button>
          </div>
        </div>

        {/* Universal Step Control */}
        <Card className="bg-[#341D44] border-[#ff00ff]/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Universal Step Control
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <Select
                value={currentUniversalStep}
                onValueChange={(value) => changeUniversalStep(value as UniversalGameStep)}
              >
                <SelectTrigger className="bg-[#462B58] border-[#ff00ff]/30 min-w-[200px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#462B58] border-[#ff00ff]/30">
                  {Object.entries(UNIVERSAL_GAME_STEPS).map(([key, value]) => (
                    <SelectItem key={value} value={value} className="text-white">
                      {key.replace(/_/g, " ")}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                onClick={progressToNextStep}
                className="bg-green-600 hover:bg-green-700"
                disabled={!STEP_PROGRESSION[currentUniversalStep]}
              >
                <SkipForward className="w-4 h-4 mr-2" />
                Next Step
              </Button>
              <Button
                onClick={() => changeUniversalStep(UNIVERSAL_GAME_STEPS.GAME_SETUP)}
                variant="outlined"
                className="border-[#ff00ff]/30"
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Reset to Setup
              </Button>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="monitor" className="w-full">
          <TabsList className="grid w-full grid-cols-4 bg-[#341D44]">
            <TabsTrigger value="monitor" className="data-[state=active]:bg-[#ff00ff]">
              <Monitor className="w-4 h-4 mr-2" />
              Monitor
            </TabsTrigger>
            <TabsTrigger value="control" className="data-[state=active]:bg-[#ff00ff]">
              <Settings className="w-4 h-4 mr-2" />
              Control
            </TabsTrigger>
            <TabsTrigger value="events" className="data-[state=active]:bg-[#ff00ff]">
              <Zap className="w-4 h-4 mr-2" />
              Events
            </TabsTrigger>
            <TabsTrigger value="system" className="data-[state=active]:bg-[#ff00ff]">
              <Activity className="w-4 h-4 mr-2" />
              System
            </TabsTrigger>
          </TabsList>

          {/* Monitor Tab */}
          <TabsContent value="monitor" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Connection Status */}
              <Card className="bg-[#341D44] border-[#ff00ff]/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    {isConnected ? (
                      <Wifi className="w-5 h-5 text-green-500" />
                    ) : (
                      <WifiOff className="w-5 h-5 text-red-500" />
                    )}
                    MQTT Status
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Connection:</span>
                      <Badge variant={isConnected ? "default" : "destructive"}>
                        {isConnected ? "Connected" : "Disconnected"}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Active Participants:</span>
                      <span>
                        {participants.filter((p) => p.isConnected).length}/{participants.length}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Participants Summary */}
              <Card className="bg-[#341D44] border-[#ff00ff]/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    Participants
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Contestants:</span>
                      <span>
                        {participants.filter((p) => p.type === "contestant" && p.isConnected).length}/
                        {participants.filter((p) => p.type === "contestant").length}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Host:</span>
                      <span>{participants.filter((p) => p.type === "host" && p.isConnected).length}/1</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Audience:</span>
                      <span>{participants.filter((p) => p.type === "audience" && p.isConnected).length}/1</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card className="bg-[#341D44] border-[#ff00ff]/20">
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button
                    onClick={() => handleRefresh("all", "")}
                    className="w-full bg-[#ff00ff] hover:bg-[#ff00ff]/80"
                    disabled={isLoading}
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Refresh All
                  </Button>
                  <Button
                    onClick={() => handleReconnect("all")}
                    variant="outlined"
                    className="w-full border-[#ff00ff]/30"
                    disabled={isLoading}
                  >
                    <Wifi className="w-4 h-4 mr-2" />
                    Reconnect All
                  </Button>
                  {debitWalletData !== null && !!debitWalletData?.data && (
                    <Button onClick={openCreditDebitModal} className="w-full bg-yellow-600 hover:bg-yellow-700">
                      <DollarSign className="w-4 h-4 mr-2" />
                      Debit Wallet
                    </Button>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Participants Detail */}
            <Card className="bg-[#341D44] border-[#ff00ff]/20">
              <CardHeader>
                <CardTitle>Participant Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {participants.map((participant) => (
                    <div key={participant.id} className="bg-[#462B58] p-4 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          {participant.type === "contestant" && <Users className="w-4 h-4" />}
                          {participant.type === "host" && <Mic className="w-4 h-4" />}
                          {participant.type === "audience" && <Eye className="w-4 h-4" />}
                          <span className="font-medium">{participant.name}</span>
                        </div>
                        <div className={`w-3 h-3 rounded-full ${getStatusColor(participant.isConnected)}`} />
                      </div>

                      {/* Contestant specific info */}
                      {participant.type === "contestant" && participant.contestantData && (
                        <div className="text-sm text-white/70 space-y-1 mb-2">
                          {participant.contestantData.phone_number && (
                            <div className="flex items-center gap-1">
                              <Phone className="w-3 h-3" />
                              {participant.contestantData.phone_number}
                            </div>
                          )}
                          <div className="flex items-center gap-1">
                            <Award className="w-3 h-3" />
                            Pot: {formatCurrency(participant.contestantData.final_pot)}
                          </div>
                          {participant.contestantData.is_eliminated && (
                            <div className="text-red-400 text-xs">
                              Eliminated: {participant.contestantData.eliminated_stage}
                            </div>
                          )}
                        </div>
                      )}

                      <div className="text-sm text-white/70 space-y-1">
                        <div>Screen: {participant.currentScreen}</div>
                        <div>Step: {participant.currentStep}</div>
                        <div>Stage: {participant.gameStage}</div>
                        <div>
                          Last Seen:
                          {participant.lastSeen ? format(new Date(participant.lastSeen), "hh:mm:ss aa") : "N/A"}
                        </div>
                      </div>
                      <div className="flex gap-2 mt-3">
                        <Button
                          className="text-xs border-[#ff00ff]/30"
                          size="sm"
                          variant="outlined"
                          onClick={() => handleRefresh(participant.type, participant.id)}
                        >
                          Refresh
                        </Button>
                        <Button
                          className="text-xs border-[#ff00ff]/30"
                          size="sm"
                          variant="outlined"
                          onClick={() => handleReconnect(participant.type, participant.id)}
                        >
                          Reconnect
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Control Tab */}
          <TabsContent value="control" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Remote Control */}
              <Card className="bg-[#341D44] border-[#ff00ff]/20">
                <CardHeader>
                  <CardTitle>Remote Control</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm text-white/70 mb-2 block">Refresh Controls</Label>
                      <div className="space-y-2">
                        <Button
                          onClick={() => handleRefresh("all_contestants", "")}
                          className="w-full bg-blue-600 hover:bg-blue-700"
                          disabled={isLoading}
                        >
                          <Users className="w-4 h-4 mr-2" />
                          Contestants ({participants.filter((p) => p.type === "contestant").length})
                        </Button>
                        <Button
                          onClick={() => handleRefresh("host", "")}
                          className="w-full bg-green-600 hover:bg-green-700"
                          disabled={isLoading}
                        >
                          <Mic className="w-4 h-4 mr-2" />
                          Host
                        </Button>
                        <Button
                          onClick={() => handleRefresh("audience")}
                          className="w-full bg-purple-600 hover:bg-purple-700"
                          disabled={isLoading}
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          Audience
                        </Button>
                      </div>
                    </div>
                    <div>
                      <Label className="text-sm text-white/70 mb-2 block">Reconnect Controls</Label>
                      <div className="space-y-2">
                        <Button
                          onClick={() => handleReconnect("all_contestants")}
                          variant="outlined"
                          className="w-full border-blue-500 text-blue-400"
                          disabled={isLoading}
                        >
                          <Wifi className="w-4 h-4 mr-2" />
                          Contestants
                        </Button>
                        <Button
                          onClick={() => handleReconnect("host")}
                          variant="outlined"
                          className="w-full border-green-500 text-green-400"
                          disabled={isLoading}
                        >
                          <Wifi className="w-4 h-4 mr-2" />
                          Host
                        </Button>
                        <Button
                          onClick={() => handleReconnect("audience")}
                          variant="outlined"
                          className="w-full border-purple-500 text-purple-400"
                          disabled={isLoading}
                        >
                          <Wifi className="w-4 h-4 mr-2" />
                          Audience
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Connection Monitor */}
              <Card className="bg-[#341D44] border-[#ff00ff]/20">
                <CardHeader>
                  <CardTitle>Connection Monitor</CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-96">
                    <div className="space-y-3">
                      {participants.map((participant) => (
                        <div
                          key={participant.id}
                          className="flex items-center justify-between p-2 bg-[#462B58] rounded"
                        >
                          <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${getStatusColor(participant.isConnected)}`} />
                            <span className="text-sm">{participant.name}</span>
                            {participant.type === "contestant" && participant.contestantData?.is_eliminated && (
                              <Badge variant="destructive" className="text-xs">
                                Eliminated
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            {participant.isConnected ? (
                              <CheckCircle className="w-4 h-4 text-green-500" />
                            ) : (
                              <XCircle className="w-4 h-4 text-red-500" />
                            )}
                            <span className="text-xs text-white/70">
                              {participant.lastSeen ? format(new Date(participant.lastSeen), "hh:mm:ss aa") : "N/A"}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Events Tab */}
          <TabsContent value="events" className="space-y-6">
            <Card className="bg-[#341D44] border-[#ff00ff]/20">
              <CardHeader>
                <CardTitle>Event Broadcasting</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Target Selection */}
                <div>
                  <Label className="text-sm text-white/70 mb-2 block">Target Participants</Label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {participants.map((participant) => (
                      <div key={participant.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={participant.id}
                          checked={selectedParticipants.includes(participant.id)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSelectedParticipants((prev) => [...prev, participant.id])
                            } else {
                              setSelectedParticipants((prev) => prev.filter((id) => id !== participant.id))
                            }
                          }}
                          className="border-[#ff00ff]/30"
                        />
                        <Label htmlFor={participant.id} className="text-sm cursor-pointer">
                          {participant.name}
                          {!participant.isConnected && <span className="text-red-400 ml-1">(offline)</span>}
                        </Label>
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-2 mt-2">
                    <Button
                      size="sm"
                      variant="outlined"
                      onClick={() => setSelectedParticipants(participants.map((p) => p.id))}
                      className="border-[#ff00ff]/30"
                    >
                      Select All
                    </Button>
                    <Button
                      size="sm"
                      variant="outlined"
                      onClick={() =>
                        setSelectedParticipants(participants.filter((p) => p.isConnected).map((p) => p.id))
                      }
                      className="border-[#ff00ff]/30"
                    >
                      Select Online
                    </Button>
                    <Button
                      size="sm"
                      variant="outlined"
                      onClick={() => setSelectedParticipants([])}
                      className="border-[#ff00ff]/30"
                    >
                      Clear All
                    </Button>
                  </div>
                </div>

                <Separator className="bg-[#ff00ff]/20" />

                {/* Event Selection */}
                <div>
                  <Label className="text-sm text-white/70 mb-2 block">Select Event</Label>
                  <Select value={selectedEvent} onValueChange={setSelectedEvent}>
                    <SelectTrigger className="bg-[#462B58] border-[#ff00ff]/30">
                      <SelectValue placeholder="Choose an event to broadcast" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#462B58] border-[#ff00ff]/30">
                      {Object.entries(ENHANCED_GAME_EVENTS).map(([category, events]) => (
                        <div key={category}>
                          <div className="px-2 py-1 text-xs font-semibold text-[#ff00ff] uppercase">
                            {category.replace("_", " ")}
                          </div>
                          {events.map((event) => (
                            <SelectItem key={event.code} value={event.code} className="text-white">
                              <div>
                                <div className="font-medium flex items-center gap-2">
                                  {event.label}
                                  {"requiresAPI" in event && event.requiresAPI && (
                                    <Badge variant="secondary" className="text-xs">
                                      API
                                    </Badge>
                                  )}
                                </div>
                                <div className="text-xs text-white/70">{event.description}</div>
                              </div>
                            </SelectItem>
                          ))}
                        </div>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Custom Payload */}
                <div>
                  <Label className="text-sm text-white/70 mb-2 block">Custom Payload (JSON)</Label>
                  <textarea
                    value={customPayload}
                    onChange={(e) => setCustomPayload(e.target.value)}
                    placeholder='{"key": "value"}'
                    className="w-full h-20 p-2 bg-[#462B58] border border-[#ff00ff]/30 rounded text-white text-sm resize-none"
                  />
                </div>

                {/* Send Button */}
                <Button
                  onClick={handleSendEvent}
                  disabled={!selectedEvent || selectedParticipants.length === 0 || isLoading}
                  className="w-full bg-[#ff00ff] hover:bg-[#ff00ff]/80"
                >
                  <Send className="w-4 h-4 mr-2" />
                  {isLoading ? "Sending..." : "Send Event"}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* System Tab */}
          <TabsContent value="system" className="space-y-6">
            <Card className="bg-[#341D44] border-[#ff00ff]/20">
              <CardHeader>
                <CardTitle>System Events Log</CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-96">
                  <div className="space-y-2">
                    {systemEvents.map((event) => (
                      <div key={event.id} className="flex items-start gap-3 p-2 bg-[#462B58] rounded text-sm">
                        <div className="flex-shrink-0 mt-0.5">
                          {event.type === "success" && <CheckCircle className="w-4 h-4 text-green-500" />}
                          {event.type === "error" && <XCircle className="w-4 h-4 text-red-500" />}
                          {event.type === "warning" && <AlertTriangle className="w-4 h-4 text-yellow-500" />}
                          {event.type === "info" && <Activity className="w-4 h-4 text-blue-500" />}
                        </div>
                        <div className="flex-1">
                          <div className={`font-medium ${getEventTypeColor(event.type)}`}>{event.message}</div>
                          <div className="text-xs text-white/50 mt-1">
                            {event.timestamp.toLocaleTimeString()} • {event.source}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Debit/Credit Modal */}
      <Dialog open={isCreditDebitModalOpen} onOpenChange={closeCreditDebitModal}>
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
