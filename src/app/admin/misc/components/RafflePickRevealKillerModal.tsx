import KillerIcon from "@/app/icons/KillerIcon"
import { GlowyStrokeText } from "@/components/core"

interface KillerModalProps {
  isOpen: boolean
  data: {
    name: {
      contestant_id: number
      number_pick: number
      is_match: boolean
      is_extra_ball: boolean
      extra_ball_details: {
        name: string
        type: string
        effect_action: string | null
        effect_desc: string | null
      }
      balance_details: {
        is_gain: boolean
        previous_balance: number
        amount_gained: number
        amount_lost: number
        current_balance: number
      }
    }
    number_revealed: number[]
  }
}

const KillerHustlePulledModal = ({ isOpen, data }: KillerModalProps) => {
  return (
    <>
      {isOpen && (
        <div className="flex flex-col items-center text-center text-white space-y-4">
          {/* Icon */}
          <KillerIcon />

          {/* Title */}
          <h2 className="text-5xl font-outfit text-[#EB001B] mt-5 font-black">Killer Hustle Pulled</h2>

          {/* Description */}
          <p className="text-lg text-white max-w-xl font-montserrat">
            {data.name.extra_ball_details.effect_desc ||
              "The hustle turned deadly! You've hit a killer ball that reduces your balance. Sometimes the risk doesn't pay off."}
          </p>

          {/* Amount Box */}
          <div className="px-6 text-[20px] font-bold text-white">
            <GlowyStrokeText
              strokeWidth={2}
              strokeColor="#EB001B"
              glowColor="#EB001B"
              glowIntensity="medium"
              textclassName="text-[2.9rem] font-black font-gilroyHeavy [@media(min-width:2000px)]:text-[5rem]"
              fillColor="#fff"
              lineThroughColor="#EB001B"
            >
              -₦{data.name.balance_details.amount_lost.toLocaleString()}
            </GlowyStrokeText>
          </div>

          {/* Balance Update */}
          <div className="text-sm text-white/70">
            New Balance: ₦{data.name.balance_details.current_balance.toLocaleString()}
          </div>
        </div>
      )}
    </>
  )
}

export default KillerHustlePulledModal
