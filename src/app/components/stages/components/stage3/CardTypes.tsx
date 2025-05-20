import React from 'react';
import PickCardContainer from "@/app/shared/PickCardContainer";

export const DudCard = ({ revealed = false, onClick }) => (
  <div onClick={onClick} className={`cursor-pointer transition-transform ${revealed ? "" : "hover:scale-105"}`}>
    <PickCardContainer 
      width={100} 
      height={98}
      text={revealed ? "DUD" : "?"}
      textColor={revealed ? "#FF5555" : "#FFFFFF"}
      backgroundColor={revealed ? "#222222" : "#3C1272"}
      borderColor="#FFFFFF"
      borderWidth={2}
      fontSize={revealed ? 24 : 36}
    />
  </div>
);

export const PassCard = ({ revealed = false, onClick }) => (
  <div onClick={onClick} className={`cursor-pointer transition-transform ${revealed ? "" : "hover:scale-105"}`}>
    <PickCardContainer 
      width={100} 
      height={98}
      text={revealed ? "PASS" : "?"}
      textColor={revealed ? "#FFD700" : "#FFFFFF"}
      backgroundColor="#3C1272"
      borderColor={revealed ? "#FFD700" : "#FFFFFF"}
      borderWidth={revealed ? 3 : 2}
      fontSize={revealed ? 24 : 36}
      textStrokeColor={revealed ? "#000000" : "none"}
      textStrokeWidth={revealed ? 1 : 0}
      secondaryText={revealed ? "Congratulations!" : ""}
      secondaryTextColor="#FFD700"
      secondaryFontSize={12}
      textY={45}
      secondaryTextY={70}
    />
  </div>
);

export const BonusCard = ({ revealed = false, onClick, bonusAmount = "2X" }) => (
  <div onClick={onClick} className={`cursor-pointer transition-transform ${revealed ? "" : "hover:scale-105"}`}>
    <PickCardContainer 
      width={100} 
      height={98}
      text={revealed ? bonusAmount : "?"}
      textColor={revealed ? "#00FF00" : "#FFFFFF"}
      backgroundColor={revealed ? "#004400" : "#3C1272"}
      borderColor={revealed ? "#00FF00" : "#FFFFFF"}
      borderWidth={2}
      fontSize={revealed ? 28 : 36}
      secondaryText={revealed ? "BONUS" : ""}
      secondaryTextColor="#00FF00"
      secondaryFontSize={14}
      textY={40}
      secondaryTextY={65}
    />
  </div>
);

export const PenaltyCard = ({ revealed = false, onClick, penalty = "-1" }) => (
  <div onClick={onClick} className={`cursor-pointer transition-transform ${revealed ? "" : "hover:scale-105"}`}>
    <PickCardContainer 
      width={100} 
      height={98}
      text={revealed ? penalty : "?"}
      textColor={revealed ? "#FF0000" : "#FFFFFF"}
      backgroundColor={revealed ? "#330000" : "#3C1272"}
      borderColor={revealed ? "#FF0000" : "#FFFFFF"}
      borderWidth={2}
      fontSize={revealed ? 28 : 36}
      secondaryText={revealed ? "PENALTY" : ""}
      secondaryTextColor="#FF0000"
      secondaryFontSize={14}
      textY={40}
      secondaryTextY={65}
    />
  </div>
);

export const CustomTextCard = ({ 
  revealed = false, 
  onClick, 
  frontText = "?", 
  backText = "CUSTOM", 
  backSecondaryText = "",
  colors = {
    front: { text: "#FFFFFF", bg: "#3C1272", border: "#FFFFFF" },
    back: { text: "#FFFFFF", bg: "#3C1272", border: "#FFFFFF" }
  }
}) => (
  <div onClick={onClick} className={`cursor-pointer transition-transform ${revealed ? "" : "hover:scale-105"}`}>
    <PickCardContainer 
      width={100} 
      height={98}
      text={revealed ? backText : frontText}
      textColor={revealed ? colors.back.text : colors.front.text}
      backgroundColor={revealed ? colors.back.bg : colors.front.bg}
      borderColor={revealed ? colors.back.border : colors.front.border}
      borderWidth={2}
      fontSize={revealed ? 20 : 36}
      secondaryText={revealed ? backSecondaryText : ""}
      secondaryTextColor={colors.back.text}
      secondaryFontSize={14}
      textY={backSecondaryText ? 40 : 50}
      secondaryTextY={65}
    />
  </div>
);