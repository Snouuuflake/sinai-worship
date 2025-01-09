import { createContext, useState } from "react";

export const GlobalContext = createContext<GlobalContextType | null>(null);

const GlobalContextProvider: React.FC<{ children: React.ReactNode }> = ({ children, }) => {
  // --- live element ---------------------------------------------------------
  const makeLiveElementsState = (): LiveElementsState => {
    const [v, s] = useState<LiveElementType[]>([]);

    /** wrapper for other stuff to be done when updating live element */
    const setLiveElementsState = (
      newLiveElements: IndexedLiveElementsObject[],
    ) => {
      const newV: LiveElementType[] = [...v];
      newLiveElements.forEach((item) => {
        newV[item.index] = item.liveElement;
        window.electron.sendSetLiveElement(item.index, item.liveElement);
      });
      s(newV);
      console.log(newV);
    };

    return { value: v, set: setLiveElementsState };
  };

  const [openV, openS] = useState<OpenElementType>({
    type: "none",
    song: null,
  });

  // --- open element ---------------------------------------------------------
  const openElement = { value: openV, set: openS };

  return (
    <GlobalContext.Provider
      value={{
        MAX_LIVE_ELEMENTS: 3000,
        liveElementsState: makeLiveElementsState(),
        openElement,
      }}
    >
      {children}
    </GlobalContext.Provider>
  );
};

export default GlobalContextProvider;
