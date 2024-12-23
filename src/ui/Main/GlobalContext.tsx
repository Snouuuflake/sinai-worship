import { createContext, useState } from "react";

export const GlobalContext = createContext<GlobalContextType | null>(null);

const GlobalContextProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  // --- live element ---------------------------------------------------------
  const makeLiveElementState = (): LiveElementState => {
    const [v, s] = useState<LiveElementType>({
      type: "none",
      value: "",
      buttonID: -1,
    });

    /** wrapper for other stuff to be done when updating live element */
    const setLiveElement = (newValue: LiveElementType) => {
      // TODO: send value IPC
      s(newValue);
    };

    return { value: v, set: setLiveElement };
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
        liveElement1: makeLiveElementState(),
        liveElement2: makeLiveElementState(),
        openElement,
      }}
    >
      {children}
    </GlobalContext.Provider>
  );
};

export default GlobalContextProvider;
