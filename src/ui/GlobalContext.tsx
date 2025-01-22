import { createContext, useState } from "react";

export const GlobalContext = createContext<GlobalContextType | null>(null);
const GlobalContextProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const MAX_LIVE_ELEMENTS = 4;
  // --- live element ---------------------------------------------------------
  const makeLiveElementsState = (): LiveElementsState => {
    const [v, s] = useState<LiveElementType[]>(
      Array.from({ length: MAX_LIVE_ELEMENTS }, (_) => ({
        type: "none",
        value: "",
        buttonID: -1,
        object: null,
      })),
    );

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

  const [openV, openS] = useState<OpenElementType[]>([]);
  const [viewV, viewS] = useState<OpenElementType>({
    type: "none",
    song: null,
  });

  const openElements = { value: openV, set: openS };
  const viewElement = { value: viewV, set: viewS };

  return (
    <GlobalContext.Provider
      value={{
        MAX_LIVE_ELEMENTS,
        liveElementsState: makeLiveElementsState(),
        openElements,
        viewElement,
      }}
    >
      {children}
    </GlobalContext.Provider>
  );
};

export default GlobalContextProvider;
