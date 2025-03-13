import { GlobalContext } from "../../GlobalContext";
import { useState, useEffect, useContext } from "react";
import FormInput from "./FormInput";
import "./DisplayControls.css";
function DisplayControls() {
  //class Settings {
  //  window: BrowserWindow;
  //  global: ConfigEntryType[];
  //  text: ConfigEntryType[];
  //  constructor(mainWindow: BrowserWindow) {
  //    this.window = mainWindow;
  //    this.global = [{ key: "background", type: "csscolor", default: "black" }];
  //    this.text = [
  //      { key: "Margin Left", type: "pnumber", default: 0 },
  //      { key: "Margin Right", type: "pnumber", default: 0 },
  //      { key: "Margin Top", type: "pnumber", default: 0 },
  //      { key: "Margin Bottom", type: "pnumber", default: 0 },
  //      { key: "Font Size", type: "pnumber", default: 20 },
  //      { key: "Font Family", type: "string", default: "Helvetica" },
  //      { key: "Color", type: "csscolor", default: "White" },
  //      { key: "Bold", type: "boolean", default: false },
  //    ];
  //  }
  //}

  // any change, including "set default" goes through this same function that ends to main and main updates file
  // the initial default settings are never automatically written, only when manually reset, for my sanity's sake
  //
  // // when loading, globalDisplay is loaded for all displays in MAX_DISPLAY_? and then each index of specificDisplays gets loaded acoordingly
  // // there should exist some function (in main) like
  //
  // config.json file schema
  // {
  //  globalDisplay: DisplaySettingType; // default, global settings
  //  specificDisplays: DisplaySettingType[]; // index corresponds to settings for a display index
  // }

  // !! the below is good i think
  // ok what if we ignore all of the above, and make this settings page completely dynamic, such that it just recieves settings, not caring if theyre default or not from main (main sends *eveything*, all fields, types, names, id, all that) and just send all changes back and then main figures it out
  // this also means that this component is loaded from something stored in GlobalContext

  const { MAX_LIVE_ELEMENTS, displayConfig } = useContext(
    GlobalContext,
  ) as GlobalContextType;

  // INFO: -1 means *
  const [displayIndex, setDisplayIndex] = useState(-1);

  const TMP_drawEntries = (field: DisplayConfigEntryType[]) => {
    return field.map((entry) => {
      return (
        <div>
          {entry.key}: {entry.value ? entry.value : entry.default}
        </div>
      );
    });
  };

  const sendConfigUpdateToMain = (
    index: number,
    arrayName: DisplayConfigArrayName,
    key: string,
    newValue: any,
  ) => {
    console.log("'Sending'", index, arrayName, key, newValue);
  };

  // entry gets modified default such that null value works. this. should. work.
  const makeFormInput = (
    index: number,
    entry: DisplayConfigEntryType,
    configArray: DisplayConfigEntryType[],
    arrayName: DisplayConfigArrayName,
  ) => (
    <FormInput
      key={`${entry.key}${index}`}
      configEntry={entry}
      configArray={configArray}
      updateConfig={(newValue) => {
        sendConfigUpdateToMain(index, arrayName, entry.key, newValue);
      }}
    />
  );

  const getConfigArrayTitle = (key: DisplayConfigArrayName) => {
    switch (key) {
      case "global":
        return "Global Settings";
        break;

      case "text":
        return "Text Settings";
        break;
      default:
        return "how did this happen?";
        break;
    }
  };

  const drawDefaultDisplayConfig = (defaultConfig: DisplayConfigType) => {
    return (Object.keys(defaultConfig) as (keyof DisplayConfigType)[]).map(
      (key) => (
        <div className="display-controls-section" key={`si{-1}k${key}`}>
          {[
            <div className="display-config-header" key={`hi${-1}k${key}`}>
              {getConfigArrayTitle(key)}
            </div>,
            defaultConfig[key].map((entry) =>
              makeFormInput(-1, entry, defaultConfig[key], key),
            ),
          ]}
        </div>
      ),
    );
  };

  const drawSpecificDisplayConfig = (
    defaultConfig: DisplayConfigType,
    specificConfig: DisplayConfigType,
    index: number,
  ) => {
    return (Object.keys(specificConfig) as (keyof DisplayConfigType)[]).map(
      (key) => (
        <div className="display-controls-section" key={`si{-1}k${key}`}>
          {[
            <div className="display-config-header" key={`hi${index}k${key}`}>
              {getConfigArrayTitle(key) + index}
            </div>,
            specificConfig[key].map((entry) => {
              const defaultEntry = defaultConfig[key].find((x) => x.key === entry.key)!
              const newDefault = defaultEntry.value === null ? defaultEntry.default : defaultEntry.value;
              return makeFormInput(index, {...entry, default: newDefault}, specificConfig[key], key);
            }),
          ]}
        </div>
      ),
    );
  };

  //const drawSpecificDisplayConfig = (dc: DisplayConfigType) => {
  //  return [
  //    <div className="display-config-header">Global Options</div>,
  //    dc.global.map((entry) => (
  //      <FormInput configEntry={entry} configArray={dc.global} />
  //    )),
  //    <div className="display-config-header">Text Options</div>,
  //    dc.text.map((entry) => (
  //      <FormInput configEntry={entry} configArray={dc.text} />
  //    )),
  //  ];
  //};

  console.log(displayConfig.value )
  return (
    <div className="display-controls">
      <input type="number" value={displayIndex}
        onChange={(event) => {
          const newValue = parseInt((event.target as HTMLInputElement).value);
          setDisplayIndex(newValue);
        }}
      ></input>
      {
        //displayConfig.value
        //? displayConfig.value.globalDisplay.text.map((entry) => (
        //    <FormInput configEntry={entry} configArray={displayConfig.value!.globalDisplay.text}/>
        //  ))
        //: ""
        displayConfig.value === null
          ? ""
          : displayIndex == -1
            ? drawDefaultDisplayConfig(displayConfig.value.globalDisplay)
            : drawSpecificDisplayConfig(
              displayConfig.value.globalDisplay, displayConfig.value.specificDisplays[displayIndex], displayIndex,
            )
      }
    </div>
  );
}

export default DisplayControls;
