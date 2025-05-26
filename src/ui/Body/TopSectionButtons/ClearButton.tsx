import { useContext } from "react";
import { GlobalContext } from "../../GlobalContext";

function ClearButton() {
  const { MAX_LIVE_ELEMENTS, liveElementsState } = useContext(
    GlobalContext,
  ) as GlobalContextType;
  return (
    <button
      className="top-section-button"
      onClick={() => {
        liveElementsState.set(
          Array.from({ length: MAX_LIVE_ELEMENTS }, (_, i) => {
            return {
              index: i,
              liveElement: {
                type: "none",
                value: "",
                buttonID: -1,
                object: null,
              },
            };
          }),
          true,
        );
      }}
    >
      Clear Displays
    </button>
  );
}

export default ClearButton;
