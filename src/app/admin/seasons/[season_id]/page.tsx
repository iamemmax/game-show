"use client"

import { useState, useMemo } from "react"
import type { ColumnDef } from "@tanstack/react-table"
import { Button, DataTable, Input } from "@/components/core"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/core"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/core"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/core"
import { Label } from "@/components/core/Label"
import { Search, Filter, MoreHorizontal, Edit, Eye, Trash2, AlertCircle, Loader2 } from "lucide-react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { useCreateEpisode, useGetAllSeasonEpisodes } from "../../misc/api"
import { convertKebabAndSnakeToTitleCase } from "@/utils/strings"
import { GAME_STATUSES_ENUMS } from "@/utils/enums"


interface IEpisode {
    id: number
    game_episode: number
    game_nick: string
    status: string
    stage: string
    created_at: string
    updated_at: string
    hustle_season: number
}

// Mock data for demonstration
const mockEpisodes: IEpisode[] = [
    {
        id: 1,
        game_episode: 1,
        game_nick: "Episode Alpha",
        status: "In Progress",
        stage: "Recording",
        created_at: "2024-01-15T10:00:00Z",
        updated_at: "2024-01-15T10:00:00Z",
        hustle_season: 1,
    },
    {
        id: 2,
        game_episode: 2,
        game_nick: "Episode Beta",
        status: "Ended",
        stage: "Post-production",
        created_at: "2024-01-10T10:00:00Z",
        updated_at: "2024-01-10T10:00:00Z",
        hustle_season: 1,
    },
    {
        id: 3,
        game_episode: 3,
        game_nick: "Episode Gamma",
        status: "Not Started",
        stage: "Planning",
        created_at: "2024-01-05T10:00:00Z",
        updated_at: "2024-01-05T10:00:00Z",
        hustle_season: 1,
    },
]

export default function EpisodesPage() {
    const { season_id } = useParams()
    const [searchTerm, setSearchTerm] = useState("")
    const [filterStatus, setFilterStatus] = useState("all")
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
    const [newEpisodeName, setNewEpisodeName] = useState("")
    const [pagination, setPagination] = useState({
        pageIndex: 0,
        pageSize: 10,
    })

    // Fetch episodes data
    const {
        data: episodesResponse,
        isLoading,
        isError,
    } = useGetAllSeasonEpisodes(season_id ? { season_id: season_id as string | number } : {})

    // Create episode mutation
    const createEpisodeMutation = useCreateEpisode()

    const handleCreateEpisode = async () => {
        if (!newEpisodeName.trim() || !season_id) return

        try {
            await createEpisodeMutation.mutateAsync({
                game_nick: newEpisodeName,
                season_id: Array.isArray(season_id) ? season_id[0] : season_id,
            })
            setIsCreateModalOpen(false)
            setNewEpisodeName("")
        } catch (error) {
            console.error("Failed to create episode:", error)
        }
    }

    const getStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
            case "IN_PROGESS":
                return "bg-yellow-500"
            case "ended":
                return "bg-red-500"
            case "IN_ACTIVE":
                return "bg-purple-500"
            default:
                return "bg-gray-500"
        }
    }


    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString("en-US", {
            year: "numeric",
            month: "numeric",
            day: "numeric",
        })
    }

    // Filter episodes based on search term and status filter
    const filteredEpisodes = useMemo(() => {
        return (
            episodesResponse?.filter((episode) => {
                const matchesSearch = episode.game_nick.toLowerCase().includes(searchTerm.toLowerCase())
                const matchesFilter = filterStatus === "all" || episode.status.toLowerCase() === filterStatus.toLowerCase()
                return matchesSearch && matchesFilter
            }) || []
        )
    }, [episodesResponse, searchTerm, filterStatus])

    // Define columns for the DataTable
    const columns: ColumnDef<IEpisode>[] = useMemo(
        () => [
            {
                accessorKey: "game_episode",
                header: "#",
                cell: ({ row }) => <div className="text-white">{row.getValue("game_episode")}</div>,
            },
            {
                accessorKey: "game_nick",
                header: "EPISODE NAME",
                cell: ({ row }) => <div className="text-white font-medium">{row.getValue("game_nick")}</div>,
            },
            {
                accessorKey: "status",
                header: "STATUS",
                cell: ({ row }) => {
                    const status = row.getValue("status") as string
                    return (
                        <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${getStatusColor(status)}`} />
                            <span className="text-white text-sm">{convertKebabAndSnakeToTitleCase(status)}</span>
                        </div>
                    )
                },
            },
            {
                accessorKey: "stage",
                header: "STAGE",
                cell: ({ row }) => <div className="text-white ">{GAME_STATUSES_ENUMS[row.getValue("stage") as string]}</div>,
            },
            {
                accessorKey: "created_at",
                header: "CREATED ON",
                cell: ({ row }) => <div className="text-white">{formatDate(row.getValue("created_at"))}</div>,
            },
            {
                id: "actions",
                header: "",
                cell: ({ row }) => {
                    const episode = row.original
                    return (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="unstyled" className="h-8 w-8 p-0 text-white hover:bg-[#ff00ff]/10">
                                    <MoreHorizontal className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="bg-[#2a1a35] border-[#ff00ff]/20 text-white">
                                <DropdownMenuItem className="hover:bg-[#ff00ff]/10">
                                    <Edit className="h-4 w-4 mr-2" />
                                    Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem className="hover:bg-[#ff00ff]/10">
                                    <Link href={`.${season_id}/episodes/${episode.game_episode}`} className="flex items-center">
                                        <Eye className="h-4 w-4 mr-2" />
                                        View Details
                                    </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem className="hover:bg-red-500/10 text-red-400">
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Delete
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    )
                },
            },
        ],
        [],
    )

    if (isError) {
        return (
            <div className="min-h-screen text-white">
                <div className="flex flex-col items-center justify-center p-12">
                    <AlertCircle className="h-12 w-12 text-[#ff00ff] mb-2" />
                    <p className="text-white">Failed to load episodes</p>
                    <Button className="mt-4 bg-[#6f2da8] hover:bg-[#8a3ad3] text-white" onClick={() => window.location.reload()}>
                        Retry
                    </Button>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen text-white bg-[#0a0a0a]">
            <div className="p-6">
                {/* Page Header */}
                <div className="mb-8">
                    <h1 className="text-2xl font-bold text-white mb-2">EPISODES</h1>
                    <div className="text-sm text-white/70">Dashboard / Episodes / Season {season_id}</div>
                </div>

                {/* Search and Actions Bar */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-white/50" />
                            <Input
                                placeholder="Search"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10 bg-[#1a0b25] border-[#ff00ff]/30 text-white w-64"
                            />
                        </div>
                        <Select value={filterStatus} onValueChange={setFilterStatus}>
                            <SelectTrigger className="bg-[#1a0b25] border-[#ff00ff]/30 text-white w-32">
                                <Filter className="h-4 w-4 mr-2" />
                                <SelectValue placeholder="Filter" />
                            </SelectTrigger>
                            <SelectContent className="bg-[#1a0b25] border-[#ff00ff]/30 text-white">
                                <SelectItem value="all">All</SelectItem>
                                <SelectItem value="in progress">In Progress</SelectItem>
                                <SelectItem value="ended">Ended</SelectItem>
                                <SelectItem value="not started">Not Started</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
                        <DialogTrigger asChild>
                            <Button className="bg-[#6f2da8] hover:bg-[#8a3ad3] text-white">Create New Episode</Button>
                        </DialogTrigger>
                        <DialogContent className="bg-[#2a1a35] border-[#ff00ff]/20 text-white">
                            <DialogHeader>
                                <DialogTitle className="text-xl text-[#ff9500]">Create New Episode</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4 mt-4">
                                <div>
                                    <Label className="text-sm text-white/70">Episode Name</Label>
                                    <Input
                                        value={newEpisodeName}
                                        onChange={(e) => setNewEpisodeName(e.target.value)}
                                        placeholder="Enter episode name"
                                        className="bg-[#1a0b25] border-[#ff00ff]/30 focus-visible:ring-[#ff00ff]/50 text-white"
                                    />
                                </div>
                                <div className="flex justify-end gap-2 pt-4">
                                    <Button
                                        variant="outlined"
                                        onClick={() => setIsCreateModalOpen(false)}
                                        className="border-[#ff00ff]/30 text-white hover:bg-[#ff00ff]/10"
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        className="bg-gradient-to-r from-[#6f2da8] to-[#ff00ff] hover:opacity-90"
                                        onClick={handleCreateEpisode}
                                        disabled={createEpisodeMutation.isLoading || !newEpisodeName.trim()}
                                    >
                                        {createEpisodeMutation.isLoading ? (
                                            <>
                                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                                Creating...
                                            </>
                                        ) : (
                                            "Create Episode"
                                        )}
                                    </Button>
                                </div>
                            </div>
                        </DialogContent>
                    </Dialog>
                </div>

                {/* Episodes DataTable */}
                <DataTable
                    columns={columns}
                    rows={filteredEpisodes}
                    pageCount={Math.ceil(filteredEpisodes.length / pagination.pageSize)}
                    pageIndex={pagination.pageIndex}
                    pageSize={pagination.pageSize}
                    setPagination={setPagination}
                    isLoading={isLoading}
                    isFetching={false} // Add real isFetching if available from your API
                    hasOuterPadding={false}
                    tableContainerClassName="bg-[#1a0b25] rounded-lg overflow-hidden"
                />
            </div>
        </div>
    )
}
