"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Input,
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
  Button
} from "@/components/core"

const specialBallSchema = z.object({
  type: z.string().min(1, "Type is required"),
  value: z.string().optional(),
})

type SpecialBallFormData = z.infer<typeof specialBallSchema>

interface SpecialBallModalProps {
  onSubmit: (data: SpecialBallFormData) => void
}

export function SpecialBallModal({ onSubmit }: SpecialBallModalProps) {
  const [open, setOpen] = useState(false)

  const form = useForm<SpecialBallFormData>({
    resolver: zodResolver(specialBallSchema),
    defaultValues: {
      type: "",
      value: "",
    },
  })

  const handleSubmit = (data: SpecialBallFormData) => {
    onSubmit(data)
    setOpen(false)
    form.reset()
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outlined" className="bg-purple-600 text-white border-purple-500 hover:bg-purple-700">
          Special Ball
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] bg-gray-900 border-gray-700">
        <DialogHeader>
          <DialogTitle className="text-white">Add Special Ball</DialogTitle>
          <DialogDescription className="text-gray-400">Configure a special ball for the raffle draw.</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-white">Type</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                        <SelectValue placeholder="Select special ball type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="bg-gray-800 border-gray-600">
                      <SelectItem value="bonus" className="text-white">
                        Bonus Ball
                      </SelectItem>
                      <SelectItem value="multiplier" className="text-white">
                        Multiplier Ball
                      </SelectItem>
                      <SelectItem value="jackpot" className="text-white">
                        Jackpot Ball
                      </SelectItem>
                      <SelectItem value="wildcard" className="text-white">
                        Wildcard Ball
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="value"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-white">Value (Optional)</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter value if applicable"
                      className="bg-gray-800 border-gray-600 text-white placeholder:text-gray-400"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex justify-end space-x-2">
              <Button
                type="button"
                variant="outlined"
                onClick={() => setOpen(false)}
                className="bg-gray-700 text-white border-gray-600 hover:bg-gray-600"
              >
                Cancel
              </Button>
              <Button type="submit" className="bg-purple-600 hover:bg-purple-700">
                Add Special Ball
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
