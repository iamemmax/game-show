export const CashCard5k = ({ className }: { className?: string }) => (
  <div className={`${className} bg-green-500 border-2 border-green-300 rounded-lg flex items-center justify-center`}>
    <div className="text-center text-white font-bold">
      <div className="text-xs">CASH</div>
      <div className="text-lg">$5K</div>
    </div>
  </div>
)

export const CashCard10k = ({ className }: { className?: string }) => (
  <div className={`${className} bg-yellow-500 border-2 border-yellow-300 rounded-lg flex items-center justify-center`}>
    <div className="text-center text-black font-bold">
      <div className="text-xs">CASH</div>
      <div className="text-lg">$10K</div>
    </div>
  </div>
)

export const CashCard20k = ({ className }: { className?: string }) => (
  <div className={`${className} bg-orange-500 border-2 border-orange-300 rounded-lg flex items-center justify-center`}>
    <div className="text-center text-white font-bold">
      <div className="text-xs">CASH</div>
      <div className="text-lg">$20K</div>
    </div>
  </div>
)

export const BonusFlipCard = ({ className }: { className?: string }) => (
  <div className={`${className} bg-blue-500 border-2 border-blue-300 rounded-lg flex items-center justify-center`}>
    <div className="text-center text-white font-bold">
      <div className="text-xs">BONUS</div>
      <div className="text-lg">FLIP</div>
    </div>
  </div>
)

export const MissFlipCard = ({ className }: { className?: string }) => (
  <div className={`${className} bg-red-500 border-2 border-red-300 rounded-lg flex items-center justify-center`}>
    <div className="text-center text-white font-bold">
      <div className="text-xs">MISS</div>
      <div className="text-lg">FLIP</div>
    </div>
  </div>
)
