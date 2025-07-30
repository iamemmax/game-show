import DudCards from "@/app/icons/cards/DudCard";
import PassCard from "./PassCard";
import MissCardFlip from "@/app/icons/cards/MissCardFlip";
import { CARD_TYPES, FlipContestant } from "./Stage3CardSelection";
import InstantCashout from "@/app/icons/cards/InstantCashout";
import { motion } from "framer-motion";
import { tokenStorage } from "@/utils/auth";
import { cn } from "@/utils/classNames";
import BonusFlip from "@/app/icons/cards/BonusFlip";

export const CardFlipRevealModal = ({
  cardType,
  onClose,
  contestant,
  isHustleBoard = false,
  otherContestantName
}: {
  cardType?: string;
  onClose: () => void;
  contestant: FlipContestant;
  isHustleBoard?: boolean;
  otherContestantName: string | null | undefined
}) => {
  const currentContestant = tokenStorage.getUser();
  const whoFlipped = contestant.id;

  // const otherContestantName =

  const getCardDisplay = () => {
    switch (cardType) {
      case CARD_TYPES.FIVE_K:
        return {
          title: "+₦5,000",
          Icon: <InstantCashout width={300} height={300} />,
          bgColor: "bg-gradient-to-br from-green-500 to-green-700",
          cardBg: "bg-green-600",
        };
      case CARD_TYPES.TEN_K:
        return {
          title: "+₦10,000",
          Icon: <InstantCashout width={300} height={300} />,
          bgColor: "bg-gradient-to-br from-green-500 to-green-700",
          cardBg: "bg-green-600",
        };
      case CARD_TYPES.TWENTY_K:
        return {
          title: "+₦20,000",
          Icon: <InstantCashout width={300} height={300} />,
          bgColor: "bg-gradient-to-br from-green-500 to-green-700",
          cardBg: "bg-green-600",
        };
      case CARD_TYPES.MISS_FLIP:
        return {
          title: `${
            isHustleBoard
              ? `${otherContestantName} gets`
              : currentContestant?.contestant_id == whoFlipped
              ? `${contestant.name} gets`
              : `You get`
          }  2 extra turns before next turn`,
          Icon: <MissCardFlip width={300} height={300} />,
          bgColor: "bg-gradient-to-br from-purple-600 to-purple-800",
          cardBg: "bg-purple-600",
        };
      case CARD_TYPES.PASS:
        return {
          title: "🏆 PASS CARD! 🏆",
          Icon: <PassCard width={300} height={300} />,
          bgColor: "bg-gradient-to-br from-yellow-400 to-yellow-600",
          cardBg: "bg-yellow-400",
        };
      case CARD_TYPES.BONUS_FLIP:
        return {
          title: "BONUS",
          Icon: <BonusFlip width={300} height={300} />,
          bgColor: "bg-gradient-to-br from-yellow-400 to-yellow-600",
          cardBg: "bg-yellow-400",
        };
      case CARD_TYPES.DUD:
      default:
        return {
          title: "DUD CARD",
          Icon: <DudCards width={300} height={300} />,
          bgColor: "bg-gradient-to-br from-gray-400 to-gray-600",
          cardBg: "bg-gray-500",
        };
    }
  };

  const cardDisplay = getCardDisplay();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50">
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.5, opacity: 0 }}
        className="text-center max-w-lg w-full mx-4"
      >
        {/* Top text for cash cards */}
        {(cardType?.includes("K") ||
          cardType === CARD_TYPES.FIVE_K ||
          cardType === CARD_TYPES.TEN_K ||
          cardType === CARD_TYPES.TWENTY_K) && (
          <div className="text-green-400 text-2xl font-bold mb-6 text-shadow-lg">
            {cardDisplay.title}
          </div>
        )}

        {/* Miss flip special text */}
        {cardType === CARD_TYPES.MISS_FLIP && (
          <div className="text-green-400 text-xl font-bold mb-6 text-shadow-lg">
            {cardDisplay.title}
          </div>
        )}

        {/* Card container */}
        <div className="relative mb-4">
          <div
            className={`bg-transparent rounded-3xl p-8 flex justify-center items-center mx-auto max-w-sm `}
          >
            <div className="text-white text-4xl font-bold mb-2">
              {cardDisplay.Icon}
            </div>
          </div>
        </div>

        {/* Player name at bottom */}
        {contestant && (
          <div
            className={cn(
              "px-6 py-2 rounded-lg inline-block font-medium font-sans  border-2",
              cardType == CARD_TYPES.FIVE_K ||
                cardType == CARD_TYPES.TEN_K ||
                cardType == CARD_TYPES.TWENTY_K
                ? "bg-[#053f20] text-green-500 bordr-[#04da6a]"
                : CARD_TYPES.DUD
                ? "bg-[#38040a] text-red-600 border-[#38040a]  "
                : CARD_TYPES.BONUS_FLIP
                ? "bg-purple-800 text-white border-purple-500"
                : CARD_TYPES.BONUS_FLIP ?
                 "bg-green-200 text-green-500 px-6 py-3"
                : "bg-green-200 text-green-500 px-6 py-3"
            )}
          >
            {isHustleBoard
              ? contestant.name
              : contestant.id.toString() === currentContestant?.toString()
              ? "You"
              : contestant.name}
          </div>
        )}
      </motion.div>
    </div>
  );
};
