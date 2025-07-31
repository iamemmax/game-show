"use client"
import { useLogin } from '@/app/(auth)/api/login'
import { useGetGameContestants } from '@/app/admin/misc/api'
import { useClipboard, useErrorModalState } from '@/hooks'
import { SmallSpinner } from '@/icons/core'
import { formatAxiosErrorMessage } from '@/utils'
import { AxiosError } from 'axios'
import Image from 'next/image'
import { useParams, useRouter } from 'next/navigation'
import React, { useState } from 'react'

const AllContestants = () => {
  const {
    isErrorModalOpen,
    setErrorModalState,
    openErrorModalWithMessage,
    errorModalMessage,
  } = useErrorModalState()

  const params = useParams()
  const { data, isLoading } = useGetGameContestants(Number(params?.gameId))
  const { mutate: handleLoginContestant, isLoading: isLoggingIn } = useLogin()
  const [activeLoginCode, setActiveLoginCode] = useState<string | null>(null)

  const router = useRouter()
  const { copy } = useClipboard()

  const handleLoginUser = (code: string) => {
    const transformedData = {
      login_code: code,
      game_episode: String(data?.game?.game_episode),
    }

    setActiveLoginCode(code)

    handleLoginContestant(transformedData, {
      onSuccess: ({ status }) => {
        if (status) {
          router.replace(`/`)
        }
      },
      onError: (error) => {
        const errorMessage = formatAxiosErrorMessage(error as AxiosError)
        openErrorModalWithMessage(String(errorMessage))
      },
      onSettled: () => {
        setActiveLoginCode(null)
      },
    })
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-6xl mx-auto px-6 py-12">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-1/4 mb-12"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white rounded-lg border border-gray-200 p-6">
                  <div className="flex items-center space-x-4 mb-4">
                    <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                    <div className="flex-1">
                      <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="h-3 bg-gray-200 rounded w-full"></div>
                    <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                    <div className="h-8 bg-gray-200 rounded w-full"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="mb-12">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900 mb-2">Game Contestants</h1>
              <p className="text-gray-600">Manage participant access and authentication</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {data?.data?.map((user, idx) => (
            <div
              key={user?.id || idx}
              className="bg-white rounded-lg border border-gray-200 hover:border-gray-300 transition-all duration-200 hover:shadow-sm"
            >
              <div className="px-6 py-5 border-b border-gray-100">
                <div className="flex items-center space-x-4">
                  <div className="relative">
                  <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center overflow-hidden">
  {!user?.contestant_photo_url ? (
    <svg
      className="w-6 h-6 text-gray-400"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
      />
    </svg>
  ) : (
    <img
      alt="profile"
      src={String(user?.contestant_photo_url)}
      className="w-full h-full object-cover rounded-full"
    />
  )}
</div>

                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-gray-900 truncate">{user?.name || 'Unnamed Contestant'}</h3>
                    <p className="text-sm text-gray-500 mt-0.5">{user?.phone_number}</p>
                  </div>
                </div>
              </div>

              <div className="px-6 py-4 space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-500">Login Code</span>
                    <button
                      className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                      onClick={() => copy(String(user?.login_code))}
                    >
                      Copy
                    </button>
                  </div>
                  <div className="bg-gray-50 px-3 py-2 rounded-md font-mono text-sm text-gray-900 border">
                    {user?.login_code || 'Not assigned'}
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm text-gray-600">Active</span>
                  </div>
                  <span className="text-xs text-gray-400 bg-gray-50 px-2 py-1 rounded">ID: {user?.id}</span>
                </div>
              </div>

              <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 rounded-b-lg">
                <div className="flex items-center justify-between">
                  <button
                    disabled={!!isLoggingIn && activeLoginCode === user?.login_code}
                    className="px-4 py-2 text-sm font-medium flex items-center gap-x-2 text-white bg-gray-900 rounded-md hover:bg-gray-800 transition-colors"
                    onClick={() => handleLoginUser(String(user?.login_code))}
                  >
                    Login as {user?.name?.split(" ")[0]}
                    {isLoggingIn && activeLoginCode === user?.login_code && <SmallSpinner color="#fff" />}
                  </button>
                  <div className="flex items-center space-x-2">
                    <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.5}
                          d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                        />
                      </svg>
                    </button>
                    <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 5v.01M12 12v.01M12 19v.01" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default AllContestants
