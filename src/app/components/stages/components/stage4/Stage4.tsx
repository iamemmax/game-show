import { useGetGameContestants } from "@/app/admin/misc/api"
import { tokenStorage } from "@/utils/auth"
import Image from "next/image"

const ContestantStage4 = () => {
    const user = tokenStorage.getUser()
    const gameEpisode = user?.game_episode || 0
    const { data: contestantData, isLoading } = useGetGameContestants(gameEpisode ?? 0)
    const Contestant = contestantData?.data.find(contestant => contestant.id === user?.contestant_id)
    const isAcontestant = contestantData?.data.some(contestant => contestant.id === user?.contestant_id)
    const isEliminated = Contestant ? Contestant.is_eliminated : false
    const eliminatedStage = Contestant ? Contestant.eliminated_stage : 0


    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <p className="text-white">Loading...</p>
            </div>
        )
    }

    
    return (
        <>
            {
                isAcontestant && (
                    <div className="w-screen h-screen flex items-center justify-center">
                        {
                            isEliminated ?
                                <article className="!font-anton flex flex-col">
                                    <div className="relative w-[450px] aspect-square">
                                        <Image
                                            src={Contestant?.contestant_photo_url || "/images/userImage.png"}
                                            alt="Contestant Image"
                                            className="rounded-full border-4 border-red-500"
                                            fill
                                            objectFit="cover"
                                        />
                                    </div>
                                    <div className="text-center mt-4">
                                        <h2 className="text-2xl font-bold text-red-500">You have been eliminated!</h2>
                                        <p className="text-lg text-gray-300">Eliminated at Stage {eliminatedStage}</p>
                                    </div>

                                    <div className="bg-red-500 p-4 rounded-2xl text-white text-center px-6 py-4">
                                        Eliminated
                                    </div>

                                </article>
                                :
                                <article className="!font-anton flex flex-col">
                                    <div className="relative w-[450px] aspect-square">
                                        <Image
                                            src={Contestant?.contestant_photo_url || "/images/userImage.png"}
                                            alt="Contestant Image"
                                            className="rounded-full border-4 border-green-500"
                                            fill
                                            objectFit="cover"
                                        />
                                    </div>
                                    <div className="text-center mt-4">
                                        <h2 className="text-2xl font-bold text-green-500">You are still in the game!</h2>
                                        <p className="text-lg text-gray-300">Keep hustling!</p>
                                    </div>

                                    <div className="bg-green-500 p-4 rounded-2xl text-white text-center px-6 py-4">
                                        Finalist
                                    </div>

                                </article>
                        }
                    </div>
                )
            }
        </>
    )
}
export default ContestantStage4