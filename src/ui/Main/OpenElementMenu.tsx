import "./OpenElementMenu.css";
import { useContext, useEffect } from "react";
import { GlobalContext } from "./GlobalContext";
import OpenElementIcon from "./OpenElementIcon";
function OpenElementMenu() {
  const { openElements, viewElement } = useContext(
    GlobalContext,
  ) as GlobalContextType;
  useEffect(() => {}, [openElements, viewElement]);
  return (
    <div className="open-element-menu">
      {openElements.value.map((oe, oeIndex) => {
        return (
          <div className="open-element-item-container">
            <button
              key={`${oeIndex}`}
              className="open-element-item"
              onClick={() => {
                viewElement.set(oe);
              }}
            >
              <OpenElementIcon openElement={oe}></OpenElementIcon>
              <div
                className="open-element-item-name"
                style={{
                  color:
                    oe.type !== "none" &&
                    oe.type === viewElement.value.type &&
                    oe[oe.type] === viewElement.value[oe.type]
                      ? "var(--hi1)"
                      : "",
                }}
              >
                {oe.type === "song" ? oe.song!.properties.title : "not a song"}{" "}
              </div>
            </button>
            <div className="open-element-action-button-container">
              <button
                className="open-element-action-button open-element-delete"
                onClick={() => {
                  if (
                    oe.type !== "none" &&
                    oe.type === viewElement.value.type &&
                    oe[oe.type] === viewElement.value[oe.type]
                  ) {
                    viewElement.set({ type: "none", song: null });
                  }
                  openElements.set(
                    openElements.value.toSpliced(
                      openElements.value.indexOf(oe), 1
                    ),
                  );
                }}
              >
                <div className="open-element-action-button-content">X</div>
              </button>
              <button
                className="open-element-action-button open-element-up"
                onClick={() => {
                  const oeIndex = openElements.value.indexOf(oe);
                  if (oeIndex > 0) {
                    const openElementsCopy = [...openElements.value];
                    [openElementsCopy[oeIndex], openElementsCopy[oeIndex - 1]] =
                      [
                        openElementsCopy[oeIndex - 1],
                        openElementsCopy[oeIndex],
                      ];
                    openElements.set(openElementsCopy);
                  }
                }}
              >
                <div className="open-element-action-button-content">U</div>
              </button>
              <button
                className="open-element-action-button open-element-down"
                onClick={() => {
                  const oeIndex = openElements.value.indexOf(oe);
                  if (oeIndex < openElements.value.length - 1) {
                    const openElementsCopy = [...openElements.value];
                    [openElementsCopy[oeIndex], openElementsCopy[oeIndex + 1]] =
                      [
                        openElementsCopy[oeIndex + 1],
                        openElementsCopy[oeIndex],
                      ];
                    openElements.set(openElementsCopy);
                  }
                }}
              >
                <div className="open-element-action-button-content">D</div>
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default OpenElementMenu;
