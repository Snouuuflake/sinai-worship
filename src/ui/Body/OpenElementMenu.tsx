import "./OpenElementMenu.css";
import "./general-icon-button.css";
import Icon from "../Icon";
import { useContext, useEffect, useRef } from "react";
import { GlobalContext } from "../GlobalContext";
import OpenElementIcon from "./OpenElementIcon";
function OpenElementMenu() {
  const { openElements, viewElement } = useContext(
    GlobalContext,
  ) as GlobalContextType;
  useEffect(() => {}, [openElements, viewElement]);

  const newSongNameRef = useRef<string>("");

  return (
    <div className="open-element-menu">
      <div className="inverse-title-container">
        <div className="inverse-title">Setlist</div>
      </div>
      <div className="inverse-title-container">
        <input
          type="text"
          className="dark-material-input text-input"
          onChange={(event) => {
            newSongNameRef.current = event.target.value.trim();
          }}
        ></input>
        <button
          className="inverse-title-button"
          onClick={() => {
            if (newSongNameRef.current) {
              openElements.set([
                ...openElements.value,
                {
                  type: "song",
                  song: {
                    properties: { title: newSongNameRef.current, author: "" },
                    sections: [],
                    sectionOrder: [],
                    notes: [],
                  },
                },
              ]);
            }
          }}
        >
          New Song
        </button>
      </div>
      <div className="open-elements-container">
        {openElements.value.map((oe, oeIndex) => {
          return (
            <div className="open-element-item-container" key={`${oeIndex}`}>
              <button
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
                  {oe.type === "song"
                    ? oe.song!.properties.title
                    : oe.type === "image"
                      ? oe.image!.title
                      : ""}{" "}
                </div>
              </button>
              <div className="open-element-action-button-container">
                <button
                  className="open-element-delete general-icon-button"
                  onClick={() => {
                    if (
                      oe.type !== "none" &&
                      oe.type === viewElement.value.type &&
                      oe[oe.type] === viewElement.value[oe.type]
                    ) {
                      viewElement.set({ type: "none" });
                    }
                    openElements.set(
                      openElements.value.toSpliced(
                        openElements.value.indexOf(oe),
                        1,
                      ),
                    );
                  }}
                >
                  <Icon code="X" />
                </button>
                <button
                  className="open-element-up general-icon-button"
                  onClick={() => {
                    const oeIndex = openElements.value.indexOf(oe);
                    if (oeIndex > 0) {
                      const openElementsCopy = [...openElements.value];
                      [
                        openElementsCopy[oeIndex],
                        openElementsCopy[oeIndex - 1],
                      ] = [
                        openElementsCopy[oeIndex - 1],
                        openElementsCopy[oeIndex],
                      ];
                      openElements.set(openElementsCopy);
                    }
                  }}
                >
                  <Icon code="U" />
                </button>
                <button
                  className="general-icon-button open-element-down"
                  onClick={() => {
                    const oeIndex = openElements.value.indexOf(oe);
                    if (oeIndex < openElements.value.length - 1) {
                      const openElementsCopy = [...openElements.value];
                      [
                        openElementsCopy[oeIndex],
                        openElementsCopy[oeIndex + 1],
                      ] = [
                        openElementsCopy[oeIndex + 1],
                        openElementsCopy[oeIndex],
                      ];
                      openElements.set(openElementsCopy);
                    }
                  }}
                >
                  <Icon code="D" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default OpenElementMenu;
