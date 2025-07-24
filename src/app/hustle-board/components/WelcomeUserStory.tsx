"use client"

import { useGetGameContestants } from "@/app/admin/misc/api"
import { useParams } from "next/navigation"
import { Instagram } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage, Card, CardContent } from "@/components/core"

const WelcomeUserStory = () => {
    const gameEpisode = useParams().episodeId
    const gameId = Number(gameEpisode)
    const { data, isLoading } = useGetGameContestants(gameId)

    const contestants = data?.data?.slice(0, 6) || []

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-pink-900 flex items-center justify-center">
                <div className="text-white text-xl">Loading contestants...</div>
            </div>
        )
    }

    return (
        <div className="h-screen relative overflow-hidden flex items-center justify-center">
            {/* Background Effects */}
           



            {/* Main Content */}
            <div className="relative z-10 container mx-auto flex flex-col px-16 py-12 bg-[#18002C] h-[90vh] max-w-max rounded-3xl shadow-lg">
                {/* Title */}
                <div className="text-center mb-12">
                    <h1 className="text-5xl font-bold font-lucky  text-transparent bg-clip-text bg-gradient-to-r from-[#7E3CE0] to-[#D91FFF] tracking-wider">
                        CONTESTANTS HUSTLE
                    </h1>
                </div>

                {/* Contestants Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto grow">
                    {contestants.map((contestant, index) => (
                        <Card
                            key={contestant.id}
                            className="bg-black/40 backdrop-blur-sm border border-purple-500/30 hover:border-purple-400/50 transition-all duration-300 hover:shadow-[0_0_30px_rgba(168,85,247,0.3)]"
                        >
                            <CardContent className="p-6 flex flex-col">
                                {/* Profile Section */}
                                <div className="flex items-center gap-4 mb-4">
                                    <Avatar className="relative size-20 border-2 border-purple-400">
                                        <AvatarImage
                                            src={
                                                contestant.contestant_photo_url ||
                                                `/placeholder.svg?height=48&width=48&query=contestant-${index + 1}`
                                            }                                            
                                            className="object-cover"
                                            alt={contestant.name || "Contestant"}
                                        />
                                        <AvatarFallback className="bg-purple-600 text-white">
                                            {contestant.name
                                                ?.split(" ")
                                                .map((n) => n[0])
                                                .join("") || "C"}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <h3 className="text-white font-semibold text-lg leading-tight">
                                            {contestant.name || "Contestant"}
                                        </h3>
                                    </div>
                                </div>

                                {/* Hustle Category */}
                                <div className="mb-4">
                                    <span className="text-purple-300 font-medium text-sm">
                                        {contestant.contestant_hustle || "Digital Marketing"}
                                    </span>
                                </div>

                                {/* Bio */}
                                <div className="flex-1 mb-4">
                                    <p className="text-gray-300 text-sm leading-relaxed">
                                        {contestant.bio ||
                                            "I help small businesses grow online by crafting campaigns that convert and tell powerful brand stories"}
                                    </p>
                                </div>

                                {/* Social Link */}
                                <div className="mt-auto">
                                    {contestant.instagram && (
                                        <div className="flex items-center gap-2 text-orange-400 text-sm">
                                            <Instagram className="w-4 h-4" />
                                            <span>{contestant.instagram}</span>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Empty state */}
                {contestants.length === 0 && (
                    <div className="text-center text-white/70 mt-12">
                        <p className="text-xl">No contestants found for this game episode.</p>
                    </div>
                )}
            </div>
        </div>
    )
}

export default WelcomeUserStory
