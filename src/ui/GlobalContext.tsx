import { createContext, useState, useLayoutEffect } from "react";

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
    };

    return { value: v, set: setLiveElementsState };
  };

  const [openV, openS] = useState<OpenElementType[]>([]);
  const [viewV, viewS] = useState<OpenElementType>({
    type: "none",
    song: null,
  }); 
  const [bcV, bcS] = useState<"main" | "display">("main");

  const openElements = { value: openV, set: openS };
  const viewElement = { value: viewV, set: viewS };
  const bodyContent = { value: bcV, set: bcS };

  const [configC, configS] = useState<FullDisplayConfigType | null>(null);
  const displayConfig = { value: configC, set: configS };

  useLayoutEffect(() => {
    //  Defaults for now
    //
    //  this.global = [{ key: "background", type: "csscolor", default: "black" }];
    //  this.text = [
    //    { key: "Margin Left", type: "pnumber", default: 0 },
    //    { key: "Margin Right", type: "pnumber", default: 0 },
    //    { key: "Margin Top", type: "pnumber", default: 0 },
    //    { key: "Margin Bottom", type: "pnumber", default: 0 },
    //    { key: "Font Size", type: "pnumber", default: 20 },
    //    { key: "Font Family", type: "string", default: "Helvetica" },
    //    { key: "Color", type: "csscolor", default: "white" },
    //    { key: "Bold", type: "boolean", default: false },
    //  ];
    //
    //  Default data gets loaded for universal display and the replaced with whatever main returns. Data for individual screens is originally blank, and only contains what is read.

    //const config = {
    //  globalDisplay: {
    //    global: [
    //      {
    //        key: "background",
    //        type: "csscolor",
    //        default: "black",
    //        value: null,
    //      },
    //    ],
    //    text: [
    //      { key: "Margin Left", type: "pnumber", default: 0, value: null },
    //      { key: "Margin Right", type: "pnumber", default: 0, value: null },
    //      { key: "Margin Top", type: "pnumber", default: 0, value: null },
    //      { key: "Margin Bottom", type: "pnumber", default: 0, value: null },
    //      { key: "Font Size", type: "pnumber", default: 20, value: null },
    //      // TODO: proper font selector
    //      {
    //        key: "Font Family",
    //        type: "font",
    //        default: "Helvetica",
    //        value: null,
    //      },
    //      { key: "Color", type: "csscolor", default: "white", value: null },
    //      { key: "Bold", type: "boolean", default: false, value: null },
    //    ],
    //  },
    //  specificDisplays: [],
    //} as FullDisplayConfigType;

    //window.electron
    //  .invokeReadDisplaySetting({})
    //  .then((data: FullDisplayConfigType) => {
    //    const updateDisplayField = (
    //      og: DisplayConfigEntryType[],
    //      updater: DisplayConfigEntryType[],
    //    ) => {
    //      console.log(updater);
    //      for (const entry of updater) {
    //        const found = og.find((x) => x.key === entry.key);
    //        if (found) {
    //          og[og.indexOf(found)] = entry;
    //        } else {
    //          og.push(entry);
    //        }
    //      }
    //    };
    //
    //    const updateDisplay = (
    //      og: DisplayConfigType,
    //      updater: DisplayConfigType,
    //    ) => {
    //      console.log(updater);
    //      updateDisplayField(og.global, updater.global);
    //      updateDisplayField(og.text, updater.text);
    //    };
    //
    //    updateDisplay(configC.globalDisplay, data.globalDisplay);
    //    console.log(configC);
    //    displayConfig.set(configC);
    //  });
 
    window.electron
      .invokeReadDisplaySetting({})
      .then((data: FullDisplayConfigType) => {
        console.log(data)
        displayConfig.set(data);
      });
  }, []);

  return (
    <GlobalContext.Provider
      value={{
        MAX_LIVE_ELEMENTS,
        liveElementsState: makeLiveElementsState(),
        openElements,
        viewElement,
        bodyContent,
        displayConfig,
      }}
    >
      {children}
    </GlobalContext.Provider>
  );
};

export default GlobalContextProvider;
