"use client"

import type React from "react"

import { Card, CardContent, CardHeader, CardTitle, Badge, Button, Separator } from "@/components/core"
import { Checkbox } from "@/components/core"
import { Label } from "@/components/core/Label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/core"
import { Send } from "lucide-react"
import { Tabs, TabsContent } from "@/components/core" // Import Tabs and TabsContent
import { ParticipantStatus } from "../misc/types"

interface EventsTabContentProps {
  participants: ParticipantStatus[]
  selectedParticipants: string[]
  setSelectedParticipants: React.Dispatch<React.SetStateAction<string[]>>
  selectedEvent: string
  setSelectedEvent: React.Dispatch<React.SetStateAction<string>>
  customPayload: string
  setCustomPayload: React.Dispatch<React.SetStateAction<string>>
  handleSendEvent: () => void
  isLoading: boolean
  ENHANCED_GAME_EVENTS: any // Define a more specific type if possible
}

export function EventsTabContent({
  participants,
  selectedParticipants,
  setSelectedParticipants,
  selectedEvent,
  setSelectedEvent,
  customPayload,
  setCustomPayload,
  handleSendEvent,
  isLoading,
  ENHANCED_GAME_EVENTS,
}: EventsTabContentProps) {
  return (
    <Tabs defaultValue="events" className="space-y-6">
      {" "}
      {/* Wrap TabsContent in Tabs */}
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
                  onClick={() => setSelectedParticipants(participants.filter((p) => p.isConnected).map((p) => p.id))}
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
                  {Object.entries(ENHANCED_GAME_EVENTS).map(([category, events], index) => (
                    <div key={category + index}>
                      <div className="px-2 py-1 text-xs font-semibold text-[#ff00ff] uppercase">
                        {category.replace("_", " ")}
                      </div>
                      {(Array.isArray(events) ? events : []).map(
                        (
                          event: any, 
                          index
                        ) => (
                          <SelectItem key={event.code +  index} value={event.code} className="text-white">
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
                        ),
                      )}
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
    </Tabs>
  )
}
