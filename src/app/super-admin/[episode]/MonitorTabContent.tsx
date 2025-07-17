"use client"

import { Card, CardContent, CardHeader, CardTitle, Badge, Button, Tabs, TabsContent } from "@/components/core"
import { Wifi, WifiOff, Users, Mic, Eye, RefreshCw, DollarSign, Phone, Award } from "lucide-react"
import { format } from "date-fns"
import { DebitWalletData, ParticipantStatus } from "../misc/types"

interface MonitorTabContentProps {
  participants: ParticipantStatus[]
  isConnected: boolean
  isLoading: boolean
  handleRefresh: (type: "contestant" | "host" | "audience" | "all" | "all_contestants", participant_id?: string) => void
  handleReconnect: (
    type: "contestant" | "host" | "audience" | "all" | "all_contestants",
    participant_id?: string,
  ) => void
  debitWalletData: DebitWalletData | null
  openCreditDebitModal: () => void
  getStatusColor: (isConnected: boolean) => string
  formatCurrency: (amount: string) => string
}

export function MonitorTabContent({
  participants,
  isConnected,
  isLoading,
  handleRefresh,
  handleReconnect,
  debitWalletData,
  openCreditDebitModal,
  getStatusColor,
  formatCurrency,
}: MonitorTabContentProps) {
  return (
    <Tabs defaultValue="monitor" className="space-y-6">
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
                      className="text-xs border-[#ff00ff]/30 bg-transparent"
                      size="sm"
                      variant="outlined"
                      onClick={() => handleRefresh(participant.type, participant.id)}
                    >
                      Refresh
                    </Button>
                    <Button
                      className="text-xs border-[#ff00ff]/30 bg-transparent"
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
    </Tabs>
  )
}
