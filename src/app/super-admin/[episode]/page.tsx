"use client"
import { useState, useEffect, useCallback, useMemo } from "react"
import { Monitor, Settings, Zap, Activity } from "lucide-react"
import { useMQTT, useMQTTTopic, useMQTTTopicPattern } from "@/hooks/useMqttService"
import { useGetGameContestants, useCreditDebitContestant } from "@/app/admin/misc/api"
import toast from "react-hot-toast"
import { useParams } from "next/navigation"
import { STEP_PROGRESSION, UNIVERSAL_GAME_STEPS, type UniversalGameStep } from "@/constants"
import type { DebitWalletData, GameInfo, ParticipantStatus, SuperAdminSystemEvent } from "../misc/types"
import type { MQTTMessage } from "@/contexts/MQTTProvider"
import { useBooleanStateControl } from "@/hooks"
import { SuperAdminHeader } from "./SuperAdminHeader"
import { UniversalStepControl } from "./UniversalStepControl"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/core"
import { MonitorTabContent } from "./MonitorTabContent"
import { ControlTabContent } from "./ControlTabContent"
import { EventsTabContent } from "./EventsTabContent"
import { SystemTabContent } from "./SystemTabContent"
import { DebitCreditModal } from "./DebitCreditModal"

export default function SuperAdminDashboard() {
  const { isConnected, sendMessage } = useMQTT()
  const [participants, setParticipants] = useState<ParticipantStatus[]>([])
  const [systemEvents, setSystemEvents] = useState<SuperAdminSystemEvent[]>([]) // For game-sync and internal events
  const [mqttOtherEvents, setMqttOtherEvents] = useState<SuperAdminSystemEvent[]>([]) // For other MQTT topics
  const [selectedParticipants, setSelectedParticipants] = useState<string[]>([])
  const [selectedEvent, setSelectedEvent] = useState("")
  const [customPayload, setCustomPayload] = useState("")
  const gameId = (useParams().episode as string) || "1"
  const [isLoading, setIsLoading] = useState(false)
  const [gameInfo, setGameInfo] = useState<GameInfo | null>(null)
  const [currentUniversalStep, setCurrentUniversalStep] = useState<UniversalGameStep>(UNIVERSAL_GAME_STEPS.GAME_SETUP)

  // Debit wallet functionality
  const [debitWalletData, setDebitWalletData] = useState<DebitWalletData | null>(null)
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
        lastSeen: null, // Will be updated by heartbeats
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

  const addMqttOtherEvent = (type: SuperAdminSystemEvent["type"], message: string, source: string) => {
    const event: SuperAdminSystemEvent = {
      id: Date.now().toString(),
      timestamp: new Date(),
      type,
      message,
      source,
    }
    setMqttOtherEvents((prev) => [event, ...prev.slice(0, 99)])
  }

  const handleConnectionStatusUpdate = (message: any) => {
    const { payload } = message
    setParticipants((prev) =>
      prev.map((p) =>
        p.id === payload.participant_id
          ? {
            ...p,
            isConnected: payload.is_connected,
            lastSeen: new Date(payload.timestamp), // Store as Date object
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
            lastSeen: new Date(), // Update last seen to current time as Date object
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
        return false
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
        await sendMessage(message, `/game-sync/${gameId}`) // Explicitly send to game-sync topic
        addSystemEvent(
          "success",
          `Sent ${eventCode} to ${targetParticipants.length ? targetParticipants.join(", ") : "all participants"}`,
          "Super Admin",
        )
        toast.success(`Event sent: ${eventCode}`)
        return true
      } catch (error) {
        console.error("Failed to send message:", error)
        addSystemEvent("error", `Failed to send ${eventCode}: ${error}`, "Super Admin")
        toast.error("Failed to send message")
        return false
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
    const nextStep = STEP_PROGRESSION[currentUniversalStep]
    if (nextStep) {
      changeUniversalStep(nextStep)
    }
  }

  const handleRefresh = (
    type: "contestant" | "host" | "audience" | "all" | "all_contestants",
    participant_id?: string,
  ) => {
    const targets =
      type === "all"
        ? participants.map((p) => p.id)
        : type === "all_contestants"
          ? participants.filter((p) => p.type === "contestant").map((p) => p.id)
          : participant_id
            ? participants
              .filter((p) => p.type === type)
              .filter((p) => p.id == participant_id)
              .map((p) => p.id)
            : []
    sendGameMessage("system_refresh", targets)
  }

  const handleReconnect = (
    type: "contestant" | "host" | "audience" | "all" | "all_contestants",
    participant_id?: string,
  ) => {
    const targets =
      type === "all"
        ? participants.map((p) => p.id)
        : type === "all_contestants"
          ? participants.filter((p) => p.type === "contestant").map((p) => p.id)
          : participant_id
            ? participants
              .filter((p) => p.type === type)
              .filter((p) => p.id == participant_id)
              .map((p) => p.id)
            : []
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

  // Listen for messages on the game-sync topic
  const gameSyncTopic = useMemo(() => `/game-sync/${gameId}`, [gameId])
  const handleGameSyncMessages = useCallback(
    (message: MQTTMessage) => {
      // Handle participant_sync (heartbeat response) separately
      if (message.event === "participant_sync") {
        handleHeartbeatResponse(message)
        return
      }
      // Handle participant_connection_status separately
      if (message.event === "participant_connection_status") {
        handleConnectionStatusUpdate(message)
        return
      }
      // Log other game-sync events
      addSystemEvent("info", `Received: ${message.event || "Unknown Event"}`, `MQTT (${message.topic})`)

      if (message.payload?.new_universal_step) {
        setCurrentUniversalStep(message.payload.new_universal_step)
      }
      if (message.event === "participant_screen_change") {
        handleScreenChangeUpdate(message)
      }
      if (message.event === "participant_step_change") {
        handleStepChangeUpdate(message)
      }
      if (message.event === "game_s2_question_answer") {
        setDebitWalletData(message.payload)
        openCreditDebitModal() // Open modal when debit wallet data is received
      }
      if (message.event === "game_general_update") {
        if (message.payload?.currentStage) {
          updateAllParticipantsGameStage(message.payload.currentStage)
        }
        if (message.payload?.currentStep) {
          setCurrentUniversalStep(message.payload.currentStep)
        }
      }

    },

    [gameId, isConnected], // isConnected is not strictly needed here but kept for consistency
  )
  useMQTTTopic(gameSyncTopic, handleGameSyncMessages, [gameSyncTopic])

  // Listen for messages on other topics (excluding game-sync)
  useMQTTTopicPattern(
    /^((?!\/game-sync\/).)*$/, // Regex to match any topic NOT containing /game-sync/
    useCallback((message: MQTTMessage) => {
      addMqttOtherEvent("info", `Received: ${message.event || "Unknown Event"}`, `MQTT (${message.topic})`)
      if (message.payload.source == "host") {
        addSystemEvent("info", `Host action: ${message.event}`, "Host")
        if (message.payload.new_universal_step) {
          setCurrentUniversalStep(message.payload.new_universal_step)
        }
      }
    }, []),
    [],
  )

  // Periodically check for disconnected participants (last seen > 5 seconds)
  useEffect(() => {
    const disconnectThreshold = 5000 // 5 seconds
    const interval = setInterval(() => {
      setParticipants((prevParticipants) =>
        prevParticipants.map((p) => {
          if (
            p.isConnected &&
            p.lastSeen instanceof Date &&
            Date.now() - p.lastSeen.getTime() > disconnectThreshold
          ) {
            return { ...p, isConnected: false }
          }
          return p
        }),
      )
    }, 1000) // Check every second

    return () => clearInterval(interval)
  }, [])

  const getStatusColor = (isConnected: boolean) => {
    return isConnected ? "bg-green-500" : "bg-red-500"
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
        <SuperAdminHeader
          gameInfo={gameInfo}
          currentUniversalStep={currentUniversalStep}
          isConnected={isConnected}
          requestHeartbeat={requestHeartbeat}
        />

        <UniversalStepControl
          currentUniversalStep={currentUniversalStep}
          changeUniversalStep={changeUniversalStep}
          progressToNextStep={progressToNextStep}
        />

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


          <TabsContent value="monitor">
            <MonitorTabContent
              participants={participants}
              isConnected={isConnected}
              isLoading={isLoading}
              handleRefresh={handleRefresh}
              handleReconnect={handleReconnect}
              debitWalletData={debitWalletData}
              openCreditDebitModal={openCreditDebitModal}
              getStatusColor={getStatusColor}
              formatCurrency={formatCurrency}
            />
          </TabsContent>
          <TabsContent value="control">
            <ControlTabContent
              participants={participants}
              isLoading={isLoading}
              handleRefresh={handleRefresh}
              handleReconnect={handleReconnect}
              getStatusColor={getStatusColor}
            />
          </TabsContent>
          <TabsContent value="events">

            <EventsTabContent
              participants={participants}
              selectedParticipants={selectedParticipants}
              setSelectedParticipants={setSelectedParticipants}
              selectedEvent={selectedEvent}
              setSelectedEvent={setSelectedEvent}
              customPayload={customPayload}
              setCustomPayload={setCustomPayload}
              handleSendEvent={handleSendEvent}
              isLoading={isLoading}
              ENHANCED_GAME_EVENTS={ENHANCED_GAME_EVENTS}
            />
          </TabsContent>
          <TabsContent value="system">
            <SystemTabContent systemEvents={systemEvents} mqttOtherEvents={mqttOtherEvents} />
          </TabsContent>
        </Tabs>
      </div>

      {/* Debit/Credit Modal */}
      <DebitCreditModal
        isOpen={isCreditDebitModalOpen}
        onClose={closeCreditDebitModal}
        debitWalletData={debitWalletData}
        contestantsData={contestantsData}
        creditDebit={creditDebit}
        isCreditDebitLoading={isCreditDebitLoading}
        sendGameMessage={sendGameMessage}
        refetchContestants={refetchContestants}
        selectedContestantIds={selectedContestantIds}
        setSelectedContestantIds={setSelectedContestantIds}
        creditSource={creditSource}
        setCreditSource={setCreditSource}
      />
    </div>
  )
}

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
