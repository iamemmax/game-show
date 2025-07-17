"use client"

import { Card, CardContent, CardHeader, CardTitle, Button } from "@/components/core"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/core"
import { Settings, SkipForward, RotateCcw } from "lucide-react"
import { STEP_PROGRESSION, UNIVERSAL_GAME_STEPS, type UniversalGameStep } from "@/constants"

interface UniversalStepControlProps {
  currentUniversalStep: UniversalGameStep
  changeUniversalStep: (newStep: UniversalGameStep, targetParticipants?: string[]) => void
  progressToNextStep: () => void
}

export function UniversalStepControl({
  currentUniversalStep,
  changeUniversalStep,
  progressToNextStep,
}: UniversalStepControlProps) {
  return (
    <Card className="bg-[#341D44] border-[#ff00ff]/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="w-5 h-5" />
          Universal Step Control
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-4">
          <Select
            value={currentUniversalStep}
            onValueChange={(value) => changeUniversalStep(value as UniversalGameStep)}
          >
            <SelectTrigger className="bg-[#462B58] border-[#ff00ff]/30 min-w-[200px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-[#462B58] border-[#ff00ff]/30">
              {Object.entries(UNIVERSAL_GAME_STEPS).map(([key, value], index) => (
                <SelectItem key={value + index} value={value} className="text-white">
                  {key.replace(/_/g, " ")}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            onClick={progressToNextStep}
            className="bg-green-600 hover:bg-green-700"
            disabled={!STEP_PROGRESSION[currentUniversalStep]}
          >
            <SkipForward className="w-4 h-4 mr-2" />
            Next Step
          </Button>
          <Button
            onClick={() => changeUniversalStep(UNIVERSAL_GAME_STEPS.GAME_SETUP)}
            variant="outlined"
            className="border-[#ff00ff]/30"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Reset to Setup
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
