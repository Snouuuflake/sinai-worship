import { createContext, useState, useEffect, useLayoutEffect } from "react";

export const GlobalContext = createContext<GlobalContextType | null>(null);
const GlobalContextProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const MAX_LIVE_ELEMENTS = 4;
  // --- live element ---------------------------------------------------------
  //const makeLiveElementsState = (): LiveElementsState => {
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
  };

  const liveElementsState = { value: v, set: setLiveElementsState };
  //};

  const [openV, openS] = useState<OpenElementType[]>([]);
  const [viewV, viewS] = useState<OpenElementType>({
    type: "none",
  });
  const [bcV, bcS] = useState<"main" | "display">("main");

  const openElements = { value: openV, set: openS };
  const viewElement = { value: viewV, set: viewS };
  const bodyContent = { value: bcV, set: bcS };

  const [configC, configS] = useState<FullDisplayConfigType | null>(null);
  const displayConfig = { value: configC, set: configS };

  const [logo, setLogo] = useState<boolean>(false);
  function superSetLogo(v: boolean) {
    setLogo(v);
    window.electron.sendSetLogo(v);
  }
  const logoState = { value: logo, set: superSetLogo };

  useLayoutEffect(() => {
    window.electron
      .invokeReadDisplaySetting({})
      .then((data: FullDisplayConfigType) => {
        console.log(data);
        displayConfig.set(data);
      });
  }, []);

  return (
    <GlobalContext.Provider
      value={{
        MAX_LIVE_ELEMENTS,
        liveElementsState,
        openElements,
        viewElement,
        logoState,
        bodyContent,
        displayConfig,
      }}
    >
      {children}
    </GlobalContext.Provider>
  );
};

export default GlobalContextProvider;
