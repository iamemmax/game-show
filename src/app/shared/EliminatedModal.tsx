"use client";
import React from "react";
import { Dialog } from "@/components/core";
import Image from "next/image";

interface Prop {
  showEliminationModal: boolean;
  setShowEliminationModal: React.Dispatch<React.SetStateAction<boolean>>;
  image_url: string;
  balance: number;
}

const EliminatedModal = ({
  setShowEliminationModal,
  showEliminationModal,
  balance,
  image_url,
}: Prop) => {
  return (
    <Dialog open={showEliminationModal} onOpenChange={setShowEliminationModal}>
      <div className="flex flex-col items-center justify-center space-y-4 p-6">
        <div className="rounded-xl overflow-hidden shadow-lg">
          <Image
            src={image_url??"/images/userImage.png"}
            alt="Eliminated contestant"
            width={190}
            height={190}
            className="rounded-xl"
          />
        </div>

      <h2 className="text-[5.625rem] font-extrabold text-white px-6 py-2 rounded-lg border border-[#80000F] bg-gradient-to-b from-[#EB001B] to-[#760F1B]">
  Eliminated
</h2>


     <div className="bg-[#001B10] px-6 py-2 rounded-[1.25rem]">
  <p className="text-[22px] font-semibold text-[#00FF84] drop-shadow-[0_0_5px_#00FF84]">
    Earnings: <span className="font-bold">₦{balance.toLocaleString()}</span>
  </p>
</div>



        
      </div>
    </Dialog>
  );
};

export default EliminatedModal;
