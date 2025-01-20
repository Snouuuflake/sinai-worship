import "./OpenElementMenu.css";
import { useContext } from "react";
import { GlobalContext } from "./GlobalContext";
import OpenElementIcon from "./OpenElementIcon";
function OpenElementMenu() {
  const { openElements, viewElement } = useContext(
    GlobalContext,
  ) as GlobalContextType;
  return (
    <div className="open-element-menu">
      {openElements.value.map((oe, oeIndex) => {
        return (
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
                    oe[oe.type] ===
                    viewElement.value[oe.type]
                    ? "var(--hi1)"
                    : "",
              }}
            >
              {oe.type === "song" ? oe.song!.properties.title : "not a song"}{" "}
            </div>
          </button>
        );
      })}
    </div>
  );
}

export default OpenElementMenu;
