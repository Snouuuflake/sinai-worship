import { useContext } from "react";
import { GlobalContext } from "../../GlobalContext";
import "./FormInput.css";

// https://www.npmjs.com/package/get-system-fonts

import BooleanInput from "./BooleanInput";
import CssColorInput from "./CssColorInput";
import TextInput from "./TextInput";
import IntInput from "./IntInput";

function FormInput({
  configEntry,
  configArray,
}: {
  configEntry: DisplayConfigEntryType;
  configArray: DisplayConfigEntryType[];
}) {
  let a: DisplayConfigEntryValueType;

  const { MAX_LIVE_ELEMENTS, displayConfig } = useContext(
    GlobalContext,
  ) as GlobalContextType;

  const updateConfig = (configEntry: DisplayConfigEntryType, newValue: any) => {
    configArray.find((x) => x.key === configEntry.key)!.value = newValue;
    displayConfig.set({ ...(displayConfig.value as FullDisplayConfigType) });
  };

  return configEntry.type === "boolean" ? (
    <BooleanInput configEntry={configEntry} updateConfig={updateConfig} />
  ) : configEntry.type === "csscolor" ? (
    <CssColorInput configEntry={configEntry} updateConfig={updateConfig} />
  ) : configEntry.type === "font" ? (
    <TextInput configEntry={configEntry} updateConfig={updateConfig} />
  ) : configEntry.type === "pnumber" ? (
    <IntInput configEntry={configEntry} updateConfig={updateConfig} />
  ) : "";
}

export default FormInput;
