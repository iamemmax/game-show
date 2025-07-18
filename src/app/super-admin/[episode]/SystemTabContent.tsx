import { Card, CardContent, CardHeader, CardTitle, Tabs, TabsContent } from "@/components/core"
import { ScrollArea } from "@/components/core"
import { AlertTriangle, CheckCircle, XCircle, Activity } from "lucide-react"
import { SuperAdminSystemEvent } from "../misc/types"

interface SystemTabContentProps {
  systemEvents: SuperAdminSystemEvent[]
  mqttOtherEvents: SuperAdminSystemEvent[]
}

export function SystemTabContent({ systemEvents, mqttOtherEvents }: SystemTabContentProps) {
  const getEventTypeColor = (type: SuperAdminSystemEvent["type"]) => {
    switch (type) {
      case "success":
        return "text-green-400"
      case "error":
        return "text-red-400"
      case "warning":
        return "text-yellow-400"
      default:
        return "text-blue-400"
    }
  }

  return (
    <Tabs defaultValue="system" className="space-y-6">
      <TabsContent value="system" className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Game Sync & Internal System Events Log */}
          <Card className="bg-[#341D44] border-[#ff00ff]/20">
            <CardHeader>
              <CardTitle>Game Sync & Internal Events Log</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-96">
                <div className="space-y-2">
                  {systemEvents.map((event) => (
                    <div key={event.id} className="flex items-start gap-3 p-2 bg-[#462B58] rounded text-sm">
                      <div className="flex-shrink-0 mt-0.5">
                        {event.type === "success" && <CheckCircle className="w-4 h-4 text-green-500" />}
                        {event.type === "error" && <XCircle className="w-4 h-4 text-red-500" />}
                        {event.type === "warning" && <AlertTriangle className="w-4 h-4 text-yellow-500" />}
                        {event.type === "info" && <Activity className="w-4 h-4 text-blue-500" />}
                      </div>
                      <div className="flex-1">
                        <div className={`font-medium ${getEventTypeColor(event.type)}`}>{event.message}</div>
                        <div className="text-xs text-white/50 mt-1">
                          {event.timestamp.toLocaleTimeString()} • {event.source}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Other MQTT Events Log */}
          <Card className="bg-[#341D44] border-[#ff00ff]/20">
            <CardHeader>
              <CardTitle>Other MQTT Events Log</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-96">
                <div className="space-y-2">
                  {mqttOtherEvents.length === 0 ? (
                    <div className="text-white/50 text-center py-10">No other MQTT events received yet.</div>
                  ) : (
                    mqttOtherEvents.map((event) => (
                      <div key={event.id} className="flex items-start gap-3 p-2 bg-[#462B58] rounded text-sm">
                        <div className="flex-shrink-0 mt-0.5">
                          {event.type === "success" && <CheckCircle className="w-4 h-4 text-green-500" />}
                          {event.type === "error" && <XCircle className="w-4 h-4 text-red-500" />}
                          {event.type === "warning" && <AlertTriangle className="w-4 h-4 text-yellow-500" />}
                          {event.type === "info" && <Activity className="w-4 h-4 text-blue-500" />}
                        </div>
                        <div className="flex-1">
                          <div className={`font-medium ${getEventTypeColor(event.type)}`}>{event.message}</div>
                          <div className="text-xs text-white/50 mt-1">
                            {event.timestamp.toLocaleTimeString()} • {event.source}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      </TabsContent>
    </Tabs>
  )
}
