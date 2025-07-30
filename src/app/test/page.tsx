"use client"
import { GameHeader } from '@/components/core/GameHeader'
import React from 'react'
import Stage3CardSelection from '../components/stages/components/stage3/Stage3CardSelection'
import RafflePickPathChoices from '../hustle-board/components/stage4/RafflePickPathChoices'
import { useGetGoldenMatchWinAmount } from '../admin/misc/api'

const page = () => {
  const {data}= useGetGoldenMatchWinAmount(16)
  return (
        <RafflePickPathChoices/>

  )
}

export default page