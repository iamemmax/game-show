"use client"

import { Card, CardContent, CardHeader, CardTitle, Button, ScrollArea, Badge, Tabs, TabsContent } from "@/components/core"
import { Label } from "@/components/core/Label"
import { Users, Mic, Eye, Wifi, CheckCircle, XCircle } from "lucide-react"
import { format } from "date-fns"
import { ParticipantStatus } from "../misc/types"

interface ControlTabContentProps {
  participants: ParticipantStatus[]
  isLoading: boolean
  handleRefresh: (type: "contestant" | "host" | "audience" | "all" | "all_contestants", participant_id?: string) => void
  handleReconnect: (
    type: "contestant" | "host" | "audience" | "all" | "all_contestants",
    participant_id?: string,
  ) => void
  getStatusColor: (isConnected: boolean) => string
}

export function ControlTabContent({
  participants,
  isLoading,
  handleRefresh,
  handleReconnect,
  getStatusColor,
}: ControlTabContentProps) {
  return (
    <Tabs defaultValue="control" className="space-y-6">
      {" "}
      {/* Wrap TabsContent in Tabs */}
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
                {participants.map((participant, index) => (
                  <div key={participant.id + index} className="flex items-center justify-between p-2 bg-[#462B58] rounded">
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
      <TabsContent value="control">
        {" "}
        {/* Wrap TabsContent in Tabs */}
        {/* Content remains the same */}
      </TabsContent>
    </Tabs>
  )
}
