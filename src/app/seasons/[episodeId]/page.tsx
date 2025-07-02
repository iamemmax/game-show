"use client"
import { useGetAllSeasonEpisodes } from '@/app/admin/misc/api'
import { LinkButton } from '@/components/core'
import { useParams } from 'next/navigation'
import React from 'react'

const Episodeid = () => {
    const params = useParams()
    const { data } = useGetAllSeasonEpisodes({ season_id: Number(params?.episodeId),game_status:"IN_ACTIVE" })

    if (!data || data.length === 0) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                        <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2h4a1 1 0 110 2h-1v12a2 2 0 01-2 2H6a2 2 0 01-2-2V6H3a1 1 0 110-2h4z" />
                        </svg>
                    </div>
                    <h3 className="text-lg font-medium text-white mb-2">No Episodes Found</h3>
                    <p className="text-gray-500">There are no episodes available for this season.</p>
                </div>
            </div>
        )
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 xl:px-8 py-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-white mb-2">Season Episodes</h1>
                <p className="text-white">Explore all episodes from this season</p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {data?.map((episode, idx) => (
                    <div 
                        key={episode?.id || idx}
                        className="group bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-lg hover:border-gray-300 transition-all duration-300 overflow-hidden"
                    >
                        {/* Card Header */}
                        <div className="bg-gradient-to-r from-blue-500 to-purple-600 h-32 relative">
                            <div className="absolute inset-0 bg-black bg-opacity-20"></div>
                            <div className="absolute top-4 right-4">
                                <span className="bg-white bg-opacity-90 text-gray-800 px-2 py-1 rounded-full text-xs font-medium">
                                    Episode {idx + 1}
                                </span>
                            </div>
                            <div className="absolute bottom-4 left-4 right-4">
                                <div className="w-12 h-12 bg-white bg-opacity-20 rounded-lg flex items-center justify-center backdrop-blur-sm">
                                    <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M8 5v14l11-7z"/>
                                    </svg>
                                </div>
                            </div>
                        </div>

                        {/* Card Content */}
                        <div className="p-6">
                            <div className="space-y-3">
                                <div>
                                    <h3 className="font-semibold text-gray-900 text-lg leading-tight group-hover:text-blue-600 transition-colors">
                                        {episode?.game_nick || 'Untitled Episode'}
                                    </h3>
                                </div>
                                
                                <div className="flex items-center text-sm text-gray-500">
                                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                    </svg>
                                    <span>{episode?.game_episode || 'Episode Info'}</span>
                                </div>
                            </div>

                            {/* Action Button */}
                            <div className="mt-6">
                                <LinkButton href={`/seasons/contestants/${episode?.game_episode}`} className="w-full bg-gray-50 hover:bg-gray-100 text-gray-700 font-medium py-2 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center">
                                    <span>View Episode</span>
                                    <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                </LinkButton>
                            </div>
                        </div>

                        {/* Hover Effect Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-transparent to-transparent group-hover:from-blue-50 group-hover:to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                    </div>
                ))}
            </div>

            {/* Stats Footer */}
            <div className="mt-12 bg-gray-50 rounded-xl p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900">Season Summary</h3>
                        <p className="text-gray-600 mt-1">Total episodes in this season</p>
                    </div>
                    <div className="text-right">
                        <div className="text-3xl font-bold text-blue-600">{data?.length || 0}</div>
                        <div className="text-sm text-gray-500">Episodes</div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Episodeid