import Logo from '@/app/icons/Logo'
import StartUpIcon from '@/app/icons/StartupIcon'
import Trophy from '@/app/icons/Trophy'
import HeaderTitleContainer from '@/app/shared/HeaderContainer'
import Image from 'next/image'
import React from 'react'
import { CustomTabs, TabItem } from '../HustleTab'
import KeepCapitalTab from './components/KeepCapitalTab'
import RedristibuteCapital from './components/RedristibuteCapital'

const Hustle = () => {
  const tabs: TabItem[] = [
    {
      value: "Keep",
      label: "Keep capital overlay",
      content: <KeepCapitalTab />,
    },
    {
      value: "Redistribute",
      label: "Redistribute capital",
      content: <RedristibuteCapital />,
    }
  ];

  return (
    <div className='grid grid-cols-[1fr_5fr_1fr] h-full'>
        <div className="  flex flex-col justify-between border pt-[1.4375rem]">
          <div className="flex justify-center items-center h-3.5 w-full pt-[1.4375rem]">
            <Logo/>
          </div>
          <div className=""></div>
          <div className="w-full p-[1.4375rem] gap-y-1.5 flex-col rounded-t-[1.75rem] flex justify-center items-center bg-[linear-gradient(to_right,_#2D0304,_#EE24B8,_#1E0227)] text-white">
<Trophy/>
<div className="flex flex-col  justify-center items-center">
  <p className='uppercase font-bold text-xs font-verdana text-white'>Stage 1 of 6</p>
  <p className=' max-w-[100px] text-center mt-2 font-display  font-bold text-xs text-white'>Hustle: Fashion Designer</p>
</div>
</div>

        </div>
        <div className="flex justify-start flex-col items-center">
        <div className="w-full h-[100px]  flex items-center justify-center">
        <HeaderTitleContainer
          backgroundColor="#791192"
          color="#ed99ff"
          text="Pick-Pad"
          textGradientEnd="#8E17AA"
          textGradientStart="#8E17AA"
          borderGradientStart="#f712fc"
          borderGradientEnd="#e151fe"
          fontSize={45}
          fontFamily="Verdana"
          textStrokeColor="#a219c1"
          textStrokeWidth={4.4}
        />
      </div>

       <div className="flex justify-center w-full">
       <div className="border-[9px] border-[#d91fff] w-full py-[1rem]   2xl:py-[3rem] max-2xl:max-w-[35rem] rounded-[.875rem] max-xl:px-[2rem] 2xl:px-[3rem] bg-[#13051E] -mt-3">
          <div className="flex  justify-center flex-col items-center">
            <div>
              <h2 className="text-[2.125rem] text-center font-extrabold outline-text text-black">
                Stage 1: Hustle Kick-off
              </h2>
              <p className='text-sm font-normal text-[#D5B9FF]'>Tap each hustle card below to determine how you want to invest</p>
            </div>
            <div className="flex mt-4 items-center gap-[1.375rem]">
              <div className="flex bg-black rounded-10 gap-4 px-[1.125rem] pr-[5rem] items-center py-4">
                 <div className="relative h-[2.8rem] w-[2.8rem] bg-[#bf7222] border-[5px] border-[#dba531] rounded-full overflow-hidden">
                              <Image
                                alt="User avatar"
                                src="/images/userImage.png"
                                fill
                                className="object-cover"
                              />
                            </div>
                            <div className="">
                              <p className='text-white font-normal text-sm font-display'>Demola</p>
                              <h2 className='text-base font-medium text-white outline-text-white-2'>Player 1</h2>
                            </div>
              </div>
              <div className="flex bg-black rounded-10 gap-4 px-[1.125rem] pr-[4rem] items-center py-4">
                 <div className="relative h-[2.8rem] w-[2.8rem] flex justify-center items-center bg-[#3C127299] bg-opacity-60 rounded-full overflow-hidden">
                              <StartUpIcon/>
                            </div>
                            <div className="">
                              <p className='text-white font-normal text-sm font-display'>Startup capital</p>
                              <h2 className='text-base font-medium text-white outline-text-white-2'>₦120,000</h2>
                            </div>
              </div>
            
             
            </div>
            

            <div className="mt-3">
          <CustomTabs 
            tabs={tabs}
            defaultValue="Keep"
            tabsListClassName=""
          />
        </div>
          </div>

       
        </div>
       </div>

        </div>
        <div className="border border-white">Lorem ipsum dolor sit, amet consectetur adipisicing elit. Ducimus suscipit quia sed quas quos vel sequi ab? Molestiae odio blanditiis perspiciatis earum debitis sunt neque, labore reiciendis aperiam placeat eaque, ratione inventore accusantium ipsam, recusandae corrupti amet facere soluta ipsa illo nam autem. Quibusdam molestias provident commodi enim, atque aliquid ratione ad impedit culpa esse odit aperiam quos in consequatur asperiores fugit recusandae minima. Officia quas nam iusto nobis perferendis molestias dolore, velit dolorum temporibus unde quibusdam sapiente ratione corrupti! Repudiandae illum inventore aliquid beatae, accusantium error doloremque quod perferendis. Iusto nihil, laboriosam quaerat sapiente corporis excepturi iste sit voluptas, totam odio dignissimos. In qui quidem labore expedita ratione facere, consequuntur illum suscipit fugit harum veritatis incidunt cumque quis officia quas corporis aperiam ab dignissimos recusandae molestias nobis debitis tenetur. Nulla error dolorem quis, sapiente veritatis repellat alias voluptas dolores asperiores quidem, quasi eveniet similique sit et adipisci ut eos magni. Voluptatum nemo ea labore nisi, optio aliquam eligendi esse consectetur enim odio officia eaque quaerat corrupti soluta, ratione impedit cum quae ducimus. Tenetur asperiores fugit ipsa officiis quisquam nemo necessitatibus at autem unde cumque exercitationem aliquid harum nam eos aliquam est possimus quod facilis incidunt praesentium nisi, qui pariatur.</div>
    </div>
  )
}

export default Hustle