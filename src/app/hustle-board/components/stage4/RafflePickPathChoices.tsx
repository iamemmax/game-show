import GoldenMatchButton from "@/components/core/ButtonGoldenMatch";
import { OrangeContainer, PurpleContainer } from "./Container";
import { GlowyStrokeText } from "@/components/core";

const RafflePickPathChoices = () => {
  return (
    <div className="h-screen flex items-center justify-center ">
      <section
        className="relative flex flex-col gap-12 items-center justify-center w-full items-center z-[999] max-h-[900px] max-w-[1500px] w-full h-full bg-[#13051E] bg-[url('/images/hustle path bg.png')] bg-no-repeat bg-contain bg-top rounded-[1.5rem]"
        style={{
          zIndex: 1,
          pointerEvents: "none",
          boxShadow: "0 0 30px 20px #D91FFF",
          borderRadius: "1.5rem",
        }}
      >
        <h4 className="text-balance text-6xl font-display text-[#FEBC00] font-extrabold max-w-[15ch] text-center">
          PICK YOUR HUSTLE PATH
        </h4>

        <div className="flex items-start gap-16 ">
          <div className="flex flex-col items-center gap-4">
            <OrangeContainer />
            <div className="bg-[#964200] px-6 py-4 rounded-xl">
              <GlowyStrokeText
                fillColor="white"
                glowColor="#ffc125"
                className="font-gilroyMedium text-base max-w-[20ch] text-center text-2xl"
                glowIntensity="low"
                strokeColor="#ffc125"
                strokeWidth={0.3}
              >
                OFFER: N??? ??? ???
              </GlowyStrokeText>
            </div>
            <GlowyStrokeText
              fillColor="white"
              glowColor="#ffc125"
              className="font-gilroyMedium text-base max-w-[20ch] text-center"
              glowIntensity="low"
              strokeColor="#ffc125"
              strokeWidth={0.3}
            >
              Potential offer Earn up to N400,000
            </GlowyStrokeText>
          </div>
          <div className="flex flex-col gap-4">
            <PurpleContainer />
            <div className="flex items-center justify-center bg-[#4B075F] px-6 py-4 rounded-xl">
              <GlowyStrokeText
                fillColor="white"
                glowColor="#CE64FF"
                className="font-gilroyMedium text-base max-w-[20ch] text-center text-2xl"
                glowIntensity="low"
                strokeColor="#CE64FF"
                strokeWidth={0.3}
              >
                PRICE: N100,000
              </GlowyStrokeText>
            </div>

            <section className="flex items-center justify-center flex-wrap gap-x-5 max-w-[30ch]">
              <GlowyStrokeText
                fillColor="white"
                glowColor="#CE64FF"
                className="font-gilroyMedium text-base max-w-[20ch] text-center"
                glowIntensity="low"
                strokeColor="#CE64FF"
                strokeWidth={0.3}
              >
                750,000 (2/5)
              </GlowyStrokeText>

              <GlowyStrokeText
                fillColor="white"
                glowColor="#CE64FF"
                className="font-gilroyMedium text-base max-w-[20ch] text-center"
                glowIntensity="low"
                strokeColor="#CE64FF"
                strokeWidth={0.3}
              >
                ₦3,500,000 (3/5)
              </GlowyStrokeText>
              <GlowyStrokeText
                fillColor="white"
                glowColor="#CE64FF"
                className="font-gilroyMedium text-base max-w-[20ch] text-center"
                glowIntensity="low"
                strokeColor="#CE64FF"
                strokeWidth={0.3}
              >
                ₦10,000,000 (4/5)
              </GlowyStrokeText>
            </section>
          </div>
        </div>
      </section>
    </div>
  );
};

export default RafflePickPathChoices;
