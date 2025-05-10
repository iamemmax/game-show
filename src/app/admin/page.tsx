"use client"

import { Button, Input } from "@/components/core"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/core/Card"
import { useRouter } from "next/navigation"
import Link from "next/link"
// import { Trophy } from "lucide-react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/core/Form"
import { useGetAllGames, useStartGame } from "./misc/api"

// Define the form schema with Zod
const startGameSchema = z.object({
  game_nick: z.string().min(3, "Game nickname must be at least 3 characters"),
})

type StartGameFormValues = z.infer<typeof startGameSchema>

export default function AdminDashboard() {
  const router = useRouter()
  const { data: games, isLoading, refetch } = useGetAllGames()
  const startGameMutation = useStartGame()

  // Initialize React Hook Form
  const form = useForm<StartGameFormValues>({
    resolver: zodResolver(startGameSchema),
    defaultValues: {
      game_nick: "",
    },
  })

  const onSubmit = async (values: StartGameFormValues) => {
    try {
      const result = await startGameMutation.mutateAsync({ game_nick: values.game_nick })
      if (result?.status === "success") {
        form.reset()
        refetch()
        router.push(`/admin/games/${result.episode}`)
      }
    } catch (error) {
      console.error("Failed to start game:", error)
    }
  }

  return (
    <div className="min-h-screen bg-[#1a0b25] text-white">
      <div className="container mx-auto py-8 px-4">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            {/* <Trophy className="h-8 w-8 text-[#ff9500]" /> */}
            <h1 className="text-3xl font-bold bg-gradient-to-r from-[#ff9500] to-[#ff00ff] bg-clip-text text-transparent">
              The Hustle Admin
            </h1>
          </div>
        </div>

        <Card className="mb-8 border-[#ff00ff]/20 bg-[#2a1a35]/80 backdrop-blur-sm">
          <CardHeader className="border-b border-[#ff00ff]/20 pb-4">
            <CardTitle className="text-xl text-[#ff9500]">Start New Game</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col sm:flex-row gap-4">
                <FormField
                  control={form.control}
                  name="game_nick"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="Game Nickname"
                          className="bg-[#3a2a45] border-[#ff00ff]/30 focus-visible:ring-[#ff00ff]/50 text-white"
                        />
                      </FormControl>
                      <FormMessage className="text-[#ff00ff]" />
                    </FormItem>
                  )}
                />
                <Button
                  type="submit"
                  disabled={startGameMutation.isLoading || form.formState.isSubmitting}
                  className="bg-gradient-to-r from-[#ff9500] to-[#ff00ff] hover:opacity-90 transition-opacity"
                >
                  {startGameMutation.isLoading ? "Starting..." : "Start New Game"}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        <Card className="border-[#ff00ff]/20 bg-[#2a1a35]/80 backdrop-blur-sm">
          <CardHeader className="border-b border-[#ff00ff]/20 pb-4">
            <CardTitle className="text-xl text-[#ff9500]">All Games</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            {isLoading ? (
              <div className="text-center py-8">Loading games...</div>
            ) : !games?.data || games.data.length === 0 ? (
              <div className="text-center py-8 text-gray-400">No games found. Start a new game above.</div>
            ) : (
              <div className="grid gap-4">
                {games.data.map((game) => (
                  <Link key={game.id} href={`/admin/games/${game.game_episode}`} className="block">
                    <div className="p-4 rounded-lg bg-[#3a2a45] hover:bg-[#4a3a55] transition-colors border border-[#ff00ff]/20 flex justify-between items-center">
                      <div>
                        <h3 className="font-medium text-[#ff9500]">{game.game_nick}</h3>
                        <div className="flex gap-4 mt-1 text-sm text-gray-300">
                          <span>Episode: {game.game_episode}</span>
                          <span>Status: {game.status}</span>
                          <span>Stage: {game.stage}</span>
                        </div>
                      </div>
                      <div className="text-[#ff00ff]">View Details →</div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
