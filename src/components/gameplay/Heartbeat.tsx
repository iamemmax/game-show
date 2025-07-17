"use client"

import { type SetStateAction, useEffect, useRef } from "react"
import { useMQTT } from "@/hooks/useMqttService"
import { UNIVERSAL_GAME_STEPS, type UniversalGameStep } from "@/constants"

interface GameSynchroniserProps {
  participantId: string
  participantType: "contestant" | "host" | "audience"
  participantName: string
  currentScreen: string
  currentStep: UniversalGameStep
  gameStage: string
  contestantId?: number
  setCurrentUniversalStep: (value: SetStateAction<UniversalGameStep>) => void
  updateGameStateFromUniversalStep: (step: UniversalGameStep) => void
}

/**
 * component that handles universal step synchronization
 * and bidirectional communication with the super admin dashboard
 */
export function GameSynchroniser({
  participantId,
  participantType,
  participantName,
  currentScreen,
  currentStep,
  gameStage,
  contestantId,
  setCurrentUniversalStep,
  updateGameStateFromUniversalStep,
}: GameSynchroniserProps) {
  const { isConnected, sendMessage, addMessageListener, removeMessageListener } = useMQTT()
  const lastScreenRef = useRef(currentScreen)
  const lastStepRef = useRef(currentStep)
  const heartbeatIntervalRef = useRef<NodeJS.Timeout>()

  // Send connection status when connection state changes
  useEffect(() => {
    const sendConnectionStatus = () => {
      if (isConnected) {
        sendMessage({
          event: "participant_connection_status",
          payload: {
            participant_id: participantId,
            participant_type: participantType,
            participant_name: participantName,
            is_connected: isConnected,
            current_screen: currentScreen,
            current_step: currentStep,
            game_stage: gameStage,
            contestant_id: contestantId,
            timestamp: new Date().toISOString(),
          },
        }).catch(console.error)
      }
    }
    sendConnectionStatus()
    // Set up periodic heartbeat
    if (isConnected) {
      heartbeatIntervalRef.current = setInterval(sendConnectionStatus, 10000) // Every 10 seconds as requested
    }
    return () => {
      if (heartbeatIntervalRef.current) {
        clearInterval(heartbeatIntervalRef.current)
      }
    }
  }, [
    isConnected,
    participantId,
    participantType,
    participantName,
    currentScreen,
    currentStep,
    gameStage,
    contestantId,
    sendMessage,
  ])

  // Send screen change notification when screen changes
  useEffect(() => {
    if (lastScreenRef.current !== currentScreen && isConnected) {
      sendMessage({
        event: "participant_screen_change",
        payload: {
          participant_id: participantId,
          participant_type: participantType,
          previous_screen: lastScreenRef.current,
          current_screen: currentScreen,
          timestamp: new Date().toISOString(),
        },
      }).catch(console.error)
      lastScreenRef.current = currentScreen
    }
  }, [currentScreen, isConnected, participantId, participantType, sendMessage])

  // Send step change notification when universal step changes
  useEffect(() => {
    if (lastStepRef.current !== currentStep && isConnected) {
      sendMessage({
        event: "participant_step_change",
        payload: {
          participant_id: participantId,
          participant_type: participantType,
          previous_step: lastStepRef.current,
          current_step: currentStep,
          timestamp: new Date().toISOString(),
        },
      }).catch(console.error)
      lastStepRef.current = currentStep
    }
  }, [currentStep, isConnected, participantId, participantType, sendMessage])

  // Listen for commands from super admin
  useEffect(() => {
    const handleMQTTMessage = (message: any) => {
      console.log(message, "GameSynchroniser received message")
      switch (message.event) {
        case "game_start":
          setCurrentUniversalStep(UNIVERSAL_GAME_STEPS.STAGE1_INIT)
          updateGameStateFromUniversalStep(UNIVERSAL_GAME_STEPS.STAGE1_INIT)
          break
        case "game_s1_init":
          setCurrentUniversalStep(UNIVERSAL_GAME_STEPS.STAGE1_HUSTLE_PICK)
          updateGameStateFromUniversalStep(UNIVERSAL_GAME_STEPS.STAGE1_HUSTLE_PICK)
          break
        case "game_s1_hustle_pick_time_elapse":
          setCurrentUniversalStep(UNIVERSAL_GAME_STEPS.STAGE1_HUSTLE_REVEAL)
          updateGameStateFromUniversalStep(UNIVERSAL_GAME_STEPS.STAGE1_HUSTLE_REVEAL)
          break
        case "game_s1_hustle_reveal":
          setCurrentUniversalStep(UNIVERSAL_GAME_STEPS.STAGE1_QUESTIONS_PREP)
          updateGameStateFromUniversalStep(UNIVERSAL_GAME_STEPS.STAGE1_QUESTIONS_PREP)
          break
        case "game_s1_questions_prep":
          setCurrentUniversalStep(UNIVERSAL_GAME_STEPS.STAGE1_QUESTIONS)
          updateGameStateFromUniversalStep(UNIVERSAL_GAME_STEPS.STAGE1_QUESTIONS)
          break
        case "game_s1_question_reveal":
          setCurrentUniversalStep(UNIVERSAL_GAME_STEPS.STAGE1_QUESTION_REVEAL)
          updateGameStateFromUniversalStep(UNIVERSAL_GAME_STEPS.STAGE1_QUESTION_REVEAL)
          break
        case "game_s1_timer_start":
          setCurrentUniversalStep(UNIVERSAL_GAME_STEPS.STAGE1_TIMER_RUNNING)
          updateGameStateFromUniversalStep(UNIVERSAL_GAME_STEPS.STAGE1_TIMER_RUNNING)
          break
        case "game_s1_question_bids_reveal":
          setCurrentUniversalStep(UNIVERSAL_GAME_STEPS.STAGE1_BIDS_REVEAL)
          updateGameStateFromUniversalStep(UNIVERSAL_GAME_STEPS.STAGE1_BIDS_REVEAL)
          break
        case "game_s1_results_reveal":
          setCurrentUniversalStep(UNIVERSAL_GAME_STEPS.STAGE1_RESULTS)
          updateGameStateFromUniversalStep(UNIVERSAL_GAME_STEPS.STAGE1_RESULTS)
          break
        case "game_s2_init":
          setCurrentUniversalStep(UNIVERSAL_GAME_STEPS.STAGE2_INIT)
          updateGameStateFromUniversalStep(UNIVERSAL_GAME_STEPS.STAGE2_INIT)
          break
        case "game_s2_prep":
          setCurrentUniversalStep(UNIVERSAL_GAME_STEPS.STAGE2_PREP)
          updateGameStateFromUniversalStep(UNIVERSAL_GAME_STEPS.STAGE2_PREP)
          break
        case "game_s2_question_reveal":
          setCurrentUniversalStep(UNIVERSAL_GAME_STEPS.STAGE2_QUESTION_REVEAL)
          updateGameStateFromUniversalStep(UNIVERSAL_GAME_STEPS.STAGE2_QUESTION_REVEAL)
          break
        case "game_s2_timer_start":
          setCurrentUniversalStep(UNIVERSAL_GAME_STEPS.STAGE2_TIMER_RUNNING)
          updateGameStateFromUniversalStep(UNIVERSAL_GAME_STEPS.STAGE2_TIMER_RUNNING)
          break
        case "game_s2_results_reveal":
          setCurrentUniversalStep(UNIVERSAL_GAME_STEPS.STAGE2_RESULTS)
          updateGameStateFromUniversalStep(UNIVERSAL_GAME_STEPS.STAGE2_RESULTS)
          break
        case "game_s3_init":
          setCurrentUniversalStep(UNIVERSAL_GAME_STEPS.STAGE3_INIT)
          updateGameStateFromUniversalStep(UNIVERSAL_GAME_STEPS.STAGE3_INIT)
          break
        case "game_s3_prep":
          setCurrentUniversalStep(UNIVERSAL_GAME_STEPS.STAGE3_PREP)
          updateGameStateFromUniversalStep(UNIVERSAL_GAME_STEPS.STAGE3_PREP)
          break
        case "game_s3_start":
          setCurrentUniversalStep(UNIVERSAL_GAME_STEPS.STAGE3_PICKS_START)
          updateGameStateFromUniversalStep(UNIVERSAL_GAME_STEPS.STAGE3_PICKS_START)
          break
        case "game_s3_end":
          setCurrentUniversalStep(UNIVERSAL_GAME_STEPS.STAGE3_END)
          updateGameStateFromUniversalStep(UNIVERSAL_GAME_STEPS.STAGE3_END)
          break
        case "game_s4_init":
          setCurrentUniversalStep(UNIVERSAL_GAME_STEPS.STAGE4_INIT)
          updateGameStateFromUniversalStep(UNIVERSAL_GAME_STEPS.STAGE4_INIT)
          break
        case "game_s4_prep":
          setCurrentUniversalStep(UNIVERSAL_GAME_STEPS.STAGE4_PREP)
          updateGameStateFromUniversalStep(UNIVERSAL_GAME_STEPS.STAGE4_PREP)
          break
        case "game_s4_raffle":
          setCurrentUniversalStep(UNIVERSAL_GAME_STEPS.STAGE4_RAFFLE)
          updateGameStateFromUniversalStep(UNIVERSAL_GAME_STEPS.STAGE4_RAFFLE)
          break
        case "game_end":
          setCurrentUniversalStep(UNIVERSAL_GAME_STEPS.GAME_END)
          updateGameStateFromUniversalStep(UNIVERSAL_GAME_STEPS.GAME_END)
          break
        case "system_heartbeat_request": // Renamed from participant_heartbeat for clarity
          sendMessage({
            event: "participant_sync", // Send participant_sync as response
            payload: {
              participant_id: participantId,
              participant_type: participantType,
              participant_name: participantName,
              current_screen: currentScreen,
              current_step: currentStep,
              game_stage: gameStage,
              contestant_id: contestantId,
              timestamp: new Date().toISOString(),
              request_id: message.payload.request_id,
            },
          }).catch(console.error)
          break
        case "system_refresh":
          const { target_participants } = message.payload
          if (!target_participants || target_participants.length === 0 || target_participants.includes(participantId)) {
            window.location.reload()
          }
          break
        case "system_reconnect":
          const { target_participants: reconnectTargets } = message.payload
          if (!reconnectTargets || reconnectTargets.length === 0 || reconnectTargets.includes(participantId)) {
            window.location.reload()
          }
          break
        case "universal_step_change":
          console.log("Universal step change received:", message.payload)
          const { new_universal_step } = message.payload
          setCurrentUniversalStep(new_universal_step)
          updateGameStateFromUniversalStep(new_universal_step)
          break
        default:
          break
      }
    }
    if (isConnected) {
      addMessageListener(handleMQTTMessage)
    }
    return () => {
      if (isConnected) {
        removeMessageListener(handleMQTTMessage)
      }
    }
  }, [
    isConnected,
    addMessageListener,
    removeMessageListener,
    participantId,
    participantType,
    participantName,
    currentScreen,
    currentStep,
    gameStage,
    contestantId,
    sendMessage,
    setCurrentUniversalStep,
    updateGameStateFromUniversalStep,
  ])

  return null // This component doesn't render anything
}
