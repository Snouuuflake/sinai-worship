import { GlobalContext } from "../../GlobalContext";
import { useState, useEffect, useContext } from "react";
import FormInput from "./FormInput";
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

  //return (<div>
  //        {!Object.is(displayConfig.value, null) ? [
  //          TMP_drawEntries(displayConfig.value!.globalDisplay.global),
  //          TMP_drawEntries(displayConfig.value!.globalDisplay.text),
  //        ] : ""}
  //        </div>)
  return (
    <div className="display-controls">
      {displayConfig.value
        ? displayConfig.value.globalDisplay.text.map((entry) => (
            <FormInput configEntry={entry} configArray={displayConfig.value!.globalDisplay.text}/>
          ))
        : ""}
    </div>
  );
}

export default DisplayControls;
