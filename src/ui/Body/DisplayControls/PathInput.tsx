import Icon from "../../Icon";
import "./FormInput.css";

function PathInput({
  configEntry,
  updateConfig,
}: {
  configEntry: DisplayConfigEntryType;
  updateConfig: (configEntry: DisplayConfigEntryType, newValue: any) => void;
}) {
  const initValue = configEntry.value === null ? "" : configEntry.value;

  return (
    <div className="text-input-v-container">
      <div className="text-input-title">{configEntry.key}</div>
      <div className="text-input-h-container">
        <button
          className="form-input-component text-input-input dark-material-input path-input-button"
          onClick={(_event) => {
            console.log("click");
            window.electron.invokeImagePath().then(
              (path) => {
                updateConfig(configEntry, path);
                console.log(path);
              },
              () => {},
            );
          }}
        >{initValue}</button>
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

export default PathInput;
