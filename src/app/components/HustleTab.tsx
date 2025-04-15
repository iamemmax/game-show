import React from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/core";
import { cn } from "@/utils/classNames";

export interface TabItem {
  value: string;
  label: string;
  content: React.ReactNode;
  disabled?: boolean;
}

interface CustomTabsProps {
  tabs: TabItem[];
  defaultValue?: string;
  className?: string;
  tabsListClassName?: string;
  tabsTriggerClassName?: string;
  tabsContentClassName?: string;
  onChange?: (value: string) => void;
}

export const CustomTabs = ({
  tabs,
  defaultValue,
  className,
  tabsListClassName,
  tabsTriggerClassName,
  tabsContentClassName,
  onChange,
}: CustomTabsProps) => {
  return (
    <Tabs
      defaultValue={defaultValue || tabs[0]?.value}
      className={cn("w-full", className)}
      onValueChange={onChange}
    >
      <TabsList className={cn("w-full border-[4px] border-[#7E3CE0] flex justify-center items-center py-1 px-[.375rem] rounded-[6.25rem]", tabsListClassName)}>
        {tabs.map((tab) => (
          <TabsTrigger
            key={tab.value}
            value={tab.value}
            disabled={tab.disabled}
            className={cn(
              "rounded-full px-6 py-2 font-medium transition-all",
              "data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#D91FFF] data-[state=active]:to-[#D91FFF]",
              "data-[state=active]:text-white data-[state=active]:shadow-md data-[state=active]:bg-[#D91FFF] data-[state=active]:border-[3px] data-[state=active]:border-[#35073E] text-xs font-normal font-verdana", 
              tabsTriggerClassName
            )}
          >
            {tab.label}
          </TabsTrigger>
        ))}
      </TabsList>
      {tabs.map((tab) => (
        <TabsContent
          key={tab.value}
          value={tab.value}
          className={cn("", tabsContentClassName)}
        >
          {tab.content}
        </TabsContent>
      ))}
    </Tabs>
  );
};