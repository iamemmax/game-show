"use client"
import { type SetStateAction, useEffect, useRef } from "react"
import { useCallback } from "react"

import { useMQTT, useMQTTTopic } from "@/hooks/useMqttService"
import { UNIVERSAL_GAME_STEPS, type UniversalGameStep } from "@/constants"
import type { MQTTMessage } from "@/contexts/MQTTProvider"

interface GameSynchroniserProps {
  participantId: string
  gameId: string
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
  gameId,
  participantType,
  participantName,
  currentScreen,
  currentStep,
  gameStage,
  contestantId,
  setCurrentUniversalStep,
  updateGameStateFromUniversalStep,
}: GameSynchroniserProps) {
  const { isConnected, sendMessage } = useMQTT()
  const lastScreenRef = useRef(currentScreen)
  const lastStepRef = useRef(currentStep)
  const heartbeatIntervalRef = useRef<NodeJS.Timeout>()

  // Refs to hold the latest prop values for the heartbeat interval and message handler
  const currentScreenPropRef = useRef(currentScreen)
  const currentStepPropRef = useRef(currentStep)
  const gameStagePropRef = useRef(gameStage)

  // Update refs whenever props change
  useEffect(() => {
    currentScreenPropRef.current = currentScreen
  }, [currentScreen])

  useEffect(() => {
    currentStepPropRef.current = currentStep
  }, [currentStep])

  useEffect(() => {
    gameStagePropRef.current = gameStage
  }, [gameStage])

  // Send connection status when connection state changes or periodically
  useEffect(() => {
    const sendConnectionStatus = () => {
      if (isConnected) {
        sendMessage(
          {
            event: "participant_connection_status",
            payload: {
              participant_id: participantId,
              participant_type: participantType,
              participant_name: participantName,
              is_connected: isConnected,
              current_screen: currentScreenPropRef.current, // Use ref
              current_step: currentStepPropRef.current, // Use ref
              game_stage: gameStagePropRef.current, // Use ref
              contestant_id: contestantId,
              timestamp: new Date().toISOString(),
            },
          },
          `/game-sync/${gameId}`,
        ).catch(console.error)
      }
    }

    // Send immediately on connection status change
    sendConnectionStatus()

    // Set up periodic heartbeat
    if (isConnected) {
      heartbeatIntervalRef.current = setInterval(sendConnectionStatus, 3000)
    } else {
      // Clear interval if disconnected
      if (heartbeatIntervalRef.current) {
        clearInterval(heartbeatIntervalRef.current)
      }
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
    contestantId,
    sendMessage,
    gameId,
    // Removed currentScreen, currentStep, gameStage from dependencies
    // as their latest values are accessed via refs inside sendConnectionStatus
  ])

  // Send screen change notification when screen changes
  useEffect(() => {
    if (lastScreenRef.current !== currentScreen && isConnected) {
      sendMessage(
        {
          event: "participant_screen_change",
          payload: {
            participant_id: participantId,
            participant_type: participantType,
            previous_screen: lastScreenRef.current,
            current_screen: currentScreen,
            timestamp: new Date().toISOString(),
          },
        },
        `/game-sync/${gameId}`,
      ).catch(console.error)
      lastScreenRef.current = currentScreen
    }
  }, [currentScreen, isConnected, participantId, participantType, sendMessage, gameId])

  // Send step change notification when universal step changes
  useEffect(() => {
    if (lastStepRef.current !== currentStep && isConnected) {
      sendMessage(
        {
          event: "participant_step_change",
          payload: {
            participant_id: participantId,
            participant_type: participantType,
            previous_step: lastStepRef.current,
            current_step: currentStep,
            timestamp: new Date().toISOString(),
          },
        },
        `/game-sync/${gameId}`,
      ).catch(console.error)
      lastStepRef.current = currentStep
    }
  }, [currentStep, isConnected, participantId, participantType, sendMessage, gameId])

  // Listen for commands from super admin using useMQTTTopic
  useMQTTTopic(
    `/game-sync/${gameId}`, // Subscribe to the specific game-sync topic
    useCallback(
      (message: MQTTMessage) => {
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
          case "system_heartbeat_request":
            sendMessage(
              {
                event: "participant_sync",
                payload: {
                  participant_id: participantId,
                  participant_type: participantType,
                  participant_name: participantName,
                  current_screen: currentScreenPropRef.current, // Use ref
                  current_step: currentStepPropRef.current, // Use ref
                  game_stage: gameStagePropRef.current, // Use ref
                  contestant_id: contestantId,
                  timestamp: new Date().toISOString(),
                  request_id: message.payload.request_id,
                },
              },
              `/game-sync/${gameId}`,
            ).catch(console.error)
            break
          case "system_refresh":
            const { target_participants } = message.payload
            if (
              !target_participants ||
              target_participants.length === 0 ||
              target_participants.includes(participantId)
            ) {
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
      },
      [
        participantId,
        participantType,
        participantName,
        contestantId,
        sendMessage,
        setCurrentUniversalStep,
        updateGameStateFromUniversalStep,
        gameId,
      ],
    ),
    [gameId],
  )

  return null
}
