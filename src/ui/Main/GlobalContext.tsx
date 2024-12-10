import { createContext, useState } from "react";

export type GlobalContextType = {
  liveSong: LiveSongType,
  setLiveSong: React.Dispatch<React.SetStateAction<LiveSongType>>,
}

export const GlobalContext = createContext<GlobalContextType | null>(null);

const GlobalContextProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [liveSong, setLiveSong] = useState<LiveSongType>(null);
  return (
    <GlobalContext.Provider value={{ liveSong, setLiveSong }}>
      {children}
    </GlobalContext.Provider>
  );
};

export default GlobalContextProvider;
