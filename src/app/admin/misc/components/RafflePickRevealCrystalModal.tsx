import CrystalIcon from "@/app/icons/CrystalIcon"
import { GlowyStrokeText } from "@/components/core"

interface CrystalModalProps {
  isOpen: boolean
  data?: {
    name: {
      balance_details: {
        amount_gained: number
        current_balance: number
      }
    }
  }
}

const CrystalModal = ({ isOpen, data }: CrystalModalProps) => {
  const amount = data?.name?.balance_details?.amount_gained || 3500000
  const balance = data?.name?.balance_details?.current_balance || 3500000

  return (
    <>
      {isOpen && (
        <div className="flex flex-col items-center text-center text-white space-y-4">
          {/* Icon */}
          <CrystalIcon />

          {/* Title */}
          <h2 className="text-5xl font-outfit text-[#04DA6A] mt-5 font-black">Crystal Hustle Found</h2>

          {/* Description */}
          <p className="text-lg text-white max-w-xl font-montserrat">
            You just earned a ₦{amount.toLocaleString()} bonus on top of your winnings! Sometimes the hustle brings
            unexpected gold. Well played!
          </p>

          {/* Amount Box */}
          <div className="px-6 text-[20px] font-bold text-white">
            <GlowyStrokeText
              strokeWidth={2}
              strokeColor="#04DA6A"
              glowColor="#04DA6A"
              glowIntensity="medium"
              textclassName="text-[2.9rem] font-black font-gilroyHeavy [@media(min-width:2000px)]:text-[5rem]"
              fillColor="#fff"
              lineThroughColor="#04DA6A"
            >
              +₦{amount.toLocaleString()}
            </GlowyStrokeText>
          </div>

          {/* Balance Update */}
          <div className="text-sm text-white/70">New Balance: ₦{balance.toLocaleString()}</div>
        </div>
      )}
    </>
  )
}

export default CrystalModal
