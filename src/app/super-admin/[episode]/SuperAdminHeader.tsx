"use client"

import { Activity } from "lucide-react"
import { Button } from "@/components/core"
import type { UniversalGameStep } from "@/constants" // Assuming UniversalGameStep is exported from constants
import { GameInfo } from "../misc/types"

interface SuperAdminHeaderProps {
  gameInfo: GameInfo | null
  currentUniversalStep: UniversalGameStep
  isConnected: boolean
  requestHeartbeat: () => void
}

export function SuperAdminHeader({
  gameInfo,
  currentUniversalStep,
  isConnected,
  requestHeartbeat,
}: SuperAdminHeaderProps) {
  return (
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
  )
}
