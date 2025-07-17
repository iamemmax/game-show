"use client"

import { type SetStateAction, useCallback, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/core"
import { RadioGroup, RadioGroupItem } from "@/components/core/RadioGroup"
import { Label } from "@/components/core/Label"
import { Checkbox } from "@/components/core"
import { Button } from "@/components/core"
import { convertKebabAndSnakeToTitleCase } from "@/utils/strings"

import toast from "react-hot-toast"
import { CreditDebitContestantRequest } from "@/app/admin/misc/api"
import { DebitWalletData, MultiCreditDebitContestantRequest } from "../misc/types"

interface DebitCreditModalProps {
  isOpen: boolean
  onClose: () => void
  debitWalletData: DebitWalletData | null
  contestantsData: any // Replace 'any' with actual type if available
  creditDebit: (payload: CreditDebitContestantRequest | MultiCreditDebitContestantRequest, options: any) => void // Replace 'any' with actual type if available
  isCreditDebitLoading: boolean
  sendGameMessage: (eventCode: string, targetParticipants?: string[], customData?: any) => Promise<boolean>
  refetchContestants: () => void
  selectedContestantIds: number[]
  setSelectedContestantIds: SetStateAction<any>
  creditSource: "gameshow_float" | "contestants" | undefined
  setCreditSource: SetStateAction<any>
}

export function DebitCreditModal({
  isOpen,
  onClose,
  debitWalletData,
  contestantsData,
  creditDebit,
  isCreditDebitLoading,
  sendGameMessage,
  refetchContestants,
  selectedContestantIds,
  setSelectedContestantIds,
  creditSource,
  setCreditSource,
}: DebitCreditModalProps) {
  const handleContestantSelection = (contestantId: number, checked: boolean) => {
    setSelectedContestantIds((prev: number[]) => {
      if (checked) {
        return [...prev, contestantId]
      } else {
        return prev.filter((id) => id !== contestantId)
      }
    })
  }

  const handleDebitWallet = useCallback(() => {
    if (!creditSource) {
      toast.error("Please select a credit source")
      return
    }
    if (creditSource === "contestants" && selectedContestantIds.length === 0) {
      toast.error("Please select at least one contestant")
      return
    }

    const payload: MultiCreditDebitContestantRequest = {
      question_id: Number(debitWalletData?.question_id),
      giver_contestant_ids: creditSource === "contestants" ? selectedContestantIds : [],
      credit_source: creditSource === "gameshow_float" ? "gameshow_float" : "",
    }

    creditDebit(payload, {
      onSuccess: (data: any) => {
        toast.success(`Wallet debited successfully!`)
        sendGameMessage(`game_s2_question_answer`, [], {
          question_id: Number(debitWalletData?.question_id),
          data: data?.data,
          question_index: Number(debitWalletData?.question_index),
          show_modal: true,
        })
        onClose()
        setSelectedContestantIds([])
        setCreditSource(undefined)
        refetchContestants()
      },
      onError: (error: any) => {
        console.error(`Failed to debit wallet:`, error)
        toast.error(`Failed to debit wallet`)
      },
    })
  }, [
    creditSource,
    selectedContestantIds,
    debitWalletData,
    creditDebit,
    sendGameMessage,
    onClose,
    setSelectedContestantIds,
    setCreditSource,
    refetchContestants,
  ])

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setSelectedContestantIds([])
      setCreditSource(undefined)
    }
  }, [isOpen, setSelectedContestantIds, setCreditSource])

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-[#2a1a35] border-[#ff00ff]/20 text-white max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl text-primary">
            Winning Contestant:{" "}
            {convertKebabAndSnakeToTitleCase(
              debitWalletData?.data?.answers.find((item: any) => item.is_winner)?.contestant_name || "Unknown",
            )}
          </DialogTitle>
        </DialogHeader>
        <DialogDescription>
          <div className="grid gap-2 mt-2">
            <div className="text-sm text-gray-300">
              Contestant ID:
              {debitWalletData?.data?.answers.find((item: any) => item.is_winner)?.contestant_id || "Unknown"}
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
              value={creditSource}
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
                onClose()
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
        </DialogDescription>
      </DialogContent>
    </Dialog>
  )
}
