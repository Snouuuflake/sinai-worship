import { useContext } from "react";
import { GlobalContext } from "../../GlobalContext";

function OpenFileButton() {
  const { MAX_LIVE_ELEMENTS } = useContext(GlobalContext) as GlobalContextType;
  const { openElements } = useContext(GlobalContext) as GlobalContextType;
  return (
    <button className="top-section-button"
      onClick={() => {
        window.electron.invokeReadElement((newElement: OpenElementType) => {
          console.log(newElement.song);
          openElements.set([...openElements.value, newElement]);
        });
      }}
    >Open File</button>
  );
}

export default OpenFileButton;
