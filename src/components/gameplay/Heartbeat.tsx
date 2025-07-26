"use client"
import { Dispatch, type SetStateAction, useEffect, useRef } from "react"
import { useCallback } from "react"

import { useMQTT, useMQTTTopic } from "@/hooks/useMqttService"
import { getStageFromStep, UNIVERSAL_GAME_STEPS, type UniversalGameStep } from "@/constants"
import type { MQTTMessage } from "@/contexts/MQTTProvider"
import { TEpisodeInfo } from "@/app/admin/misc/api"

interface GameSynchroniserProps {
  gameId: string
  participantId: string
  participantType: "contestant" | "host" | "audience"
  participantName: string
  gameState: TEpisodeInfo
  setGameState: Dispatch<SetStateAction<TEpisodeInfo>>
  contestantId?: string
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
  gameState,
  setGameState,
  contestantId
}: GameSynchroniserProps) {
  const { isConnected, sendMessage } = useMQTT()
  const lastScreenRef = useRef(gameState.step)
  const lastStepRef = useRef(gameState.step)
  const heartbeatIntervalRef = useRef<NodeJS.Timeout>()

  // Refs to hold the latest prop values for the heartbeat interval and message handler
  const currentScreenPropRef = useRef(gameState.step)
  const currentStepPropRef = useRef(gameState.step)
  const gameStagePropRef = useRef(gameState.step)

  // Update refs whenever props change
  useEffect(() => {
    currentScreenPropRef.current = gameState.step
  }, [gameState.step])

  useEffect(() => {
    currentStepPropRef.current = gameState.step
  }, [gameState.step])

  useEffect(() => {
    gameStagePropRef.current = gameState.stage
  }, [gameState.stage])

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
    if (lastScreenRef.current !== gameState.step && isConnected) {
      sendMessage(
        {
          event: "participant_screen_change",
          payload: {
            participant_id: participantId,
            participant_type: participantType,
            previous_screen: lastScreenRef.current,
            current_screen: gameState.step,
            timestamp: new Date().toISOString(),
          },
        },
        `/game-sync/${gameId}`,
      ).catch(console.error)
      lastScreenRef.current = gameState.step
    }
  }, [gameState.step, isConnected, participantId, participantType, sendMessage, gameId])

  // Send step change notification when universal step changes
  useEffect(() => {
    if (lastStepRef.current !== gameState.step && isConnected) {
      sendMessage(
        {
          event: "participant_step_change",
          payload: {
            participant_id: participantId,
            participant_type: participantType,
            previous_step: lastStepRef.current,
            current_step: gameState.step,
            timestamp: new Date().toISOString(),
          },
        },
        `/game-sync/${gameId}`,
      ).catch(console.error)
      lastStepRef.current = gameState.step
    }
  }, [gameState.step, isConnected, participantId, participantType, sendMessage, gameId])

  // Listen for commands from super admin using useMQTTTopic
  useMQTTTopic(
    `/game-sync/${gameId}`, // Subscribe to the specific game-sync topic
    useCallback(
      (message: MQTTMessage) => {
        switch (message.event) {
          case "game_start":
            setGameState((prevState) => ({
              ...prevState,
              step: UNIVERSAL_GAME_STEPS.STAGE1_INIT,
              stage: "STAGE_ONE",
            }))
            break
          case "game_s1_init":
            setGameState((prevState) => ({
              ...prevState,
              step: UNIVERSAL_GAME_STEPS.STAGE1_HUSTLE_PICK,
              stage: "STAGE_ONE",
            }))
            break
          case "game_s1_hustle_pick_time_elapse":
            setGameState((prevState) => ({
              ...prevState,
              step: UNIVERSAL_GAME_STEPS.STAGE1_HUSTLE_REVEAL,
              stage: "STAGE_ONE",
            }))
            break
          case "game_s1_hustle_reveal":
            setGameState((prevState) => ({
              ...prevState,
              step: UNIVERSAL_GAME_STEPS.STAGE1_QUESTIONS_PREP,
              stage: "STAGE_ONE",
            }))
            break
          case "game_s1_questions_prep":
            setGameState((prevState) => ({
              ...prevState,
              step: UNIVERSAL_GAME_STEPS.STAGE1_QUESTIONS,
              stage: "STAGE_ONE",
            }))
            break
          case "game_s1_question_reveal":
            setGameState((prevState) => ({
              ...prevState,
              step: UNIVERSAL_GAME_STEPS.STAGE1_QUESTION_REVEAL,
              stage: "STAGE_ONE",
            }))
            break
          case "game_s1_timer_start":
            setGameState((prevState) => ({
              ...prevState,
              step: UNIVERSAL_GAME_STEPS.STAGE1_TIMER_RUNNING,
              stage: "STAGE_ONE",
            }))
            break
          case "game_s1_question_bids_reveal":
            setGameState((prevState) => ({
              ...prevState,
              step: UNIVERSAL_GAME_STEPS.STAGE1_BIDS_REVEAL,
              stage: "STAGE_ONE",
            }))
            break
          case "game_s1_results_reveal":
            setGameState((prevState) => ({
              ...prevState,
              step: UNIVERSAL_GAME_STEPS.STAGE1_RESULTS,
              stage: "STAGE_ONE",
            }))
            break
          case "game_s2_init":
            setGameState((prevState) => ({
              ...prevState,
              step: UNIVERSAL_GAME_STEPS.STAGE2_PREP,
              stage: "STAGE_TWO",
            }))
            break
          case "game_s2_prep":
            setGameState((prevState) => ({
              ...prevState,
              step: UNIVERSAL_GAME_STEPS.STAGE2_QUESTIONS,
              stage: "STAGE_TWO",
            }))
            break
          case "game_s2_question_reveal":
            setGameState((prevState) => ({
              ...prevState,
              step: UNIVERSAL_GAME_STEPS.STAGE2_QUESTION_REVEAL,
              stage: "STAGE_TWO",
            }))
            break
          case "game_s2_timer_start":
            setGameState((prevState) => ({
              ...prevState,
              step: UNIVERSAL_GAME_STEPS.STAGE2_TIMER_RUNNING,
              stage: "STAGE_TWO",
            }))
            break
          case "game_s2_results_reveal":
            setGameState((prevState) => ({
              ...prevState,
              step: UNIVERSAL_GAME_STEPS.STAGE2_RESULTS,
              stage: "STAGE_TWO",
            }))
            break
          case "game_s3_init":
            setGameState((prevState) => ({
              ...prevState,
              step: UNIVERSAL_GAME_STEPS.STAGE3_PREP,
              stage: "STAGE_THREE",
            }))
            break
          case "game_s3_prep":
            setGameState((prevState) => ({
              ...prevState,
              step: UNIVERSAL_GAME_STEPS.STAGE3_PICKS_START,
              stage: "STAGE_THREE",
            }))
            break
          case "game_s3_start":
            setGameState((prevState) => ({
              ...prevState,
              step: UNIVERSAL_GAME_STEPS.STAGE3_PICKS_START,
              stage: "STAGE_THREE",
            }))
            break
          case "game_s3_end":
            setGameState((prevState) => ({
              ...prevState,
              step: UNIVERSAL_GAME_STEPS.STAGE3_END,
              stage: "STAGE_THREE",
            }))
            break
          case "game_s4_init":
            setGameState((prevState) => ({
              ...prevState,
              step: UNIVERSAL_GAME_STEPS.STAGE4_INIT,
              stage: "STAGE_FOUR",
            }))
            break
          case "game_s4_prep":
            setGameState((prevState) => ({
              ...prevState,
              step: UNIVERSAL_GAME_STEPS.STAGE4_PREP,
              stage: "STAGE_FOUR",
            }))
            break
          case "game_s4_raffle":
            setGameState((prevState) => ({
              ...prevState,
              step: UNIVERSAL_GAME_STEPS.STAGE4_RAFFLE,
              stage: "STAGE_FOUR",
            }))
            break
          case "game_end":
            setGameState((prevState) => ({
              ...prevState,
              step: UNIVERSAL_GAME_STEPS.GAME_END,
              stage: "GAME_END",
            }))
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
            const { new_universal_step } = message.payload

            setGameState((prevState) => ({
              ...prevState,
              step: new_universal_step as UniversalGameStep,
              stage: getStageFromStep(new_universal_step),
            }))
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
        setGameState,
        getStageFromStep,
        gameId,
      ],
    ),
    [gameId],
  )

  return null
}
