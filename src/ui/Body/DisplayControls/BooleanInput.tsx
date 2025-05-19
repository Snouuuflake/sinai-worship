import { useState } from "react";
import "./FormInput.css";

function BooleanInput({
  configEntry,
  updateConfig,
}: {
  configEntry: DisplayConfigEntryType;
  updateConfig: (configEntry: DisplayConfigEntryType, newValue: any) => void;
}) {
  const [active, setActive] = useState<boolean>(
    (configEntry.value === null
      ? configEntry.default
      : configEntry.value) as boolean,
  );
  return (
    <button
      className={`form-input-component boolean-input-button darken-hover ${active ? "boolean-input-active" : "boolean-input-inactive"}`}
      onClick={()=>{
        const newValue = !active;
        updateConfig(configEntry, newValue);
        setActive(newValue);
        updateConfig(configEntry, newValue);
      }}
    >
      {configEntry.key}
    </button>
  );
}

export default BooleanInput;
