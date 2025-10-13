import { createContext, useContext, useState } from "react";

type SidebarContextType = {
  width: number | string;
  setWidth: (width: number | string) => void;
};

const SidebarContext = createContext<SidebarContextType | null>(null);

export const SidebarProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [width, setWidth] = useState<number | string>("20%");

  return (
    <SidebarContext.Provider value={{ width, setWidth }}>
      {children}
    </SidebarContext.Provider>
  );
};

export const useSidebarWidth = () => {
  const context = useContext(SidebarContext);

  if (!context) {
    throw new Error("useSidebarWitdh must be used within a SidebarProvider");
  }

  return context;
};
