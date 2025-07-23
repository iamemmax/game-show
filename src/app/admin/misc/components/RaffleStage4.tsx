"use client"
import type React from "react"
import { useState, useCallback } from "react"
import { Loader2 } from "lucide-react"
import { useMQTT } from "@/hooks/useMqttService"
import { Ball } from "./RaffleBall"
import { IBallPickData, useGetGameContestants, useHandleBallPick } from "../api"
import { useParams } from "next/navigation"
import { useInitStageFour } from "@/app/host/misc/api"
import { TrapeziumButton } from "@/components/core/ButtonTrapezium"
import { SmallSpinner } from "@/icons/core"
import toast from "react-hot-toast"

interface PickViewProps {
  onPickResult?: (result: any) => void
}

const PickView: React.FC<PickViewProps> = ({ onPickResult }) => {
  const [selectedBall, setSelectedBall] = useState<number | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [revealedBalls, setRevealedBalls] = useState<Map<number, "matched" | "mismatched">>(new Map())
  const { isConnected, sendMessage } = useMQTT()
  const [isLoading, setIsSending] = useState(false)



  const params = useParams()
  const gameEpisode = params.episode as string
  const {
    data: contestantsData,
    isLoading: isLoadingContestants,
    refetch: refetchContestants,
  } = useGetGameContestants(Number.parseInt(gameEpisode))
  const { mutate: pickBall } = useHandleBallPick()
  const { mutate: initStage, isLoading: isStartingStage } = useInitStageFour()

  const sendGameMessage = useCallback(
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
            game_episode: Number.parseInt(gameEpisode),
            ...data,
          },
        }
        console.log("Sending message in admin raffle:", message)


        sendMessage(message)

      } catch (error) {
        console.error("Failed to send message:", error)
        toast.error("Failed to send message")
      } finally {
        setIsSending(false)
      }
    },
    [isConnected, sendMessage, gameEpisode, refetchContestants],
  )
  const handleStartStageFour = useCallback(() => {
    if (!gameEpisode) return
    initStage({ episode: gameEpisode }, {
      onSuccess: (data) => {
        console.log("Stage Four initialized successfully:", data)
        sendGameMessage("game_s4_start", { episode: gameEpisode })
      },
      onError: (error) => {
        console.error("Failed to initialize Stage Four:", error)
        if ((error as any)?.response?.data.data.includes("Unable to create Stage progress for contestant") ||
          (error as any)?.response?.data.data.includes("Unable to create Stage progress")
        ) {
          sendGameMessage("game_s4_start", { episode: gameEpisode })
        }
      },
    })
  }, [gameEpisode, initStage, sendMessage])

  const handleBallClick = useCallback(
    async (ballNumber: number) => {
      if (isSubmitting || revealedBalls.has(ballNumber)) return
      setSelectedBall(ballNumber)
      setIsSubmitting(true)
      console.log(contestantsData?.data, "contestantsData")
      const lastContestant = contestantsData?.data.find(contestant => !contestant.is_eliminated) || { id: 0 }
      try {
        const pickData = {
          game_episode: gameEpisode,
          contestant_id: lastContestant.id,
          number_pick: ballNumber,
        }
        sendGameMessage("ball_picked", {
          "hustle_match": {
            "contestant_id": 1983,
            "number_pick": 31,
            "is_match": true,
            "is_extra_ball": false,
            "extra_ball_details": null,
            "balance_details": {
              "is_gain": false,
              "previous_balance": 1500000.0,
              "amount_gained": 0,
              "amount_lost": 0,
              "current_balance": 1500000.0
            }
          },
          "number_revealed": [
            9,
            31
          ]
        })
        return
        pickBall(pickData, {
          onSuccess: (data) => {
            sendGameMessage("ball_picked", data)
            const isPositiveResult = data.hustle_match.is_extra_ball
              ? data.hustle_match.balance_details?.is_gain
              : data.hustle_match.is_match

            setRevealedBalls((prev) => new Map([...prev, [pickData.number_pick, isPositiveResult ? "matched" : "mismatched"]]))

          },
          onError: (error) => {
            console.error("API call failed:", error)
            throw error
          },
        })
      } catch (error) {
        console.error("Error picking ball:", error)
      } finally {
        setIsSubmitting(false)
        setSelectedBall(null)
      }
    },
    [gameEpisode, isSubmitting, revealedBalls, sendGameMessage, onPickResult],
  )

  const handCloseRevealModal = () => {
    sendGameMessage("close_reveal_modal")
  }

  const getBallVariant = (ballNumber: number): "regular" | "matched" | "mismatched" | "selected" => {
    if (selectedBall === ballNumber && isSubmitting) {
      return "selected"
    }

    const result = revealedBalls.get(ballNumber)
    if (result) {
      return result
    }

    return "regular"
  }


  return (
    <div className="h-full flex flex-col w-full justify-center items-center p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">

          <TrapeziumButton
            onClick={handleStartStageFour}
          >
            INIT STAGE
            {
              isStartingStage && <SmallSpinner className="ml-2" />
            }
          </TrapeziumButton>
          <TrapeziumButton
            onClick={handCloseRevealModal}
            variant={"orange"}
          >
            CLOSE REVEAL MODAL
          </TrapeziumButton>
        </div>

        {/* Ball Grid */}
        <div className="grid grid-cols-10 gap-4 max-w-4xl mx-auto">
          {Array.from({ length: 60 }, (_, i) => i + 1).map((ballNumber) => (
            <div key={ballNumber} className="flex justify-center">
              <Ball
                number={ballNumber}
                variant={getBallVariant(ballNumber)}
                size="lg"
                onClick={() => handleBallClick(ballNumber)}
                className={`
                  ${revealedBalls.has(ballNumber) ? "cursor-not-allowed opacity-75" : "cursor-pointer"}
                  ${selectedBall === ballNumber && isSubmitting ? "animate-pulse" : ""}
                `}
                textClassName="text-lg font-black"
              />
              {selectedBall === ballNumber && isSubmitting && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <Loader2 className="w-6 h-6 text-white animate-spin" />
                </div>
              )}
            </div>
          ))}
        </div>


        {/* Recent Picks */}
        {revealedBalls.size > 0 && (
          <div className="mt-8 bg-white/10 backdrop-blur-sm rounded-lg p-6 max-w-2xl mx-auto">
            <h3 className="text-white font-semibold mb-4">Recent Picks</h3>
            <div className="flex flex-wrap gap-2">
              {Array.from(revealedBalls.entries()).map(([ballNumber, result]) => (
                <span
                  key={ballNumber}
                  className={`px-3 py-1 rounded-full text-sm font-medium ${result === "matched" ? "bg-green-600 text-green-100" : "bg-red-600 text-red-100"
                    }`}
                >
                  {ballNumber} {result === "matched" ? "✓" : "✗"}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Loading Overlay */}
      {isSubmitting && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-purple-900/90 backdrop-blur-sm p-8 rounded-lg flex flex-col items-center">
            <Loader2 className="w-12 h-12 text-yellow-400 animate-spin mb-4" />
            <div className="text-white text-lg">Processing your pick...</div>
            <div className="text-white/70 text-sm mt-2">Ball #{selectedBall}</div>
          </div>
        </div>
      )}
    </div>
  )
}

export default PickView
