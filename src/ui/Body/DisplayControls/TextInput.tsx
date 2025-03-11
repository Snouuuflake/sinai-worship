import Icon from "../../Icon";
import "./FormInput.css";

function TextInput({
  configEntry,
  updateConfig,
}: {
  configEntry: DisplayConfigEntryType;
  updateConfig: (configEntry: DisplayConfigEntryType, newValue: any) => void;
}) {
  const initValue =
    configEntry.value === null ? configEntry.default : configEntry.value;

  return (
    <div className="text-input-v-container">
      <div className="text-input-title">{configEntry.key}</div>
      <div className="text-input-h-container">
        <input
          className="form-input-component text-input-input dark-material-input"
          contentEditable="true"
          onChange={(event) => {
            const value = (event.target as HTMLInputElement).value;
            updateConfig(configEntry, value);
            console.log(value);
          }}
          value={initValue}
        ></input>
        <button
          className="text-input-reset-button darken-hover"
          onClick={() => {
            updateConfig(configEntry, null);
          }}
        >
          <Icon code="X" />
        </button>
      </div>
    </div>
  );
}

export default TextInput;
