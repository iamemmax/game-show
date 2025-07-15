import WinnerBallIcon from "@/app/icons/WinnerBallIcon"
import { GlowyStrokeText } from "@/components/core"

interface WinnerModalProps {
  isOpen: boolean
  data?: {
    name: {
      balance_details: {
        current_balance: number
      }
    }
  }
}

const WinnerBallModal = ({ isOpen, data }: WinnerModalProps) => {
  const balance = data?.name?.balance_details?.current_balance || 3500000

  return (
    <>
      {isOpen && (
        <div className="flex flex-col items-center text-center text-white space-y-4">
          {/* Icon */}
          <WinnerBallIcon />

          {/* Title */}
          <h3 className="text-3xl font-bold text-[#EEF2F6] font-gilroyMedium mt-5">The Hustle Champion!</h3>

          {/* Description */}
          <p className="text-lg text-white max-w-xl font-montserrat">
            You played hard, outsmarted the competition, and now you're set for life! The grind was real, the journey
            was tough—but YOU made it! Welcome to financial freedom!
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
              ₦{balance.toLocaleString()}
            </GlowyStrokeText>
          </div>
        </div>
      )}
    </>
  )
}

export default WinnerBallModal
