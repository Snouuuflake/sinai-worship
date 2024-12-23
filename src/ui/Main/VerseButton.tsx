import { useContext } from "react";
import { GlobalContext } from "./GlobalContext";
import "./VerseButton.css";

function VerseButton({
  lines,
  buttonID,
}: {
  lines: Array<string>;
  buttonID: number;
}) {
  const { liveElement1, liveElement2 } = useContext(
    GlobalContext,
  ) as GlobalContextType;

  const live1 = buttonID === liveElement1.value.buttonID;
  const live2 = buttonID === liveElement2.value.buttonID;

  const selected = false;

  return (
    <div className="verse-button-container">
      <div className="icons-container">
        <div className="icon-container">
          <div
            className={
              /* if both or none */ (live1 && live2) || !(live1 || live2)
                ? "dot"
                : "hidden"
            }
            style={{ backgroundColor: 
              live1 && live2 ? "red" : (live1 || live2) ? "transparent": "white" ,
            color: "red",
            fontWeight: "bold"
            }}
          >
            {live1 && live2 ? "" : live1 ? "1" : live2 ? "2" : ""}
          </div>
        </div>
        <div
          className="icon-container"
          style={{
            backgroundColor: selected ? "white" : "var(--icon-container-bg)",
          }}
        >
          <span
            className="text-icon s"
            style={{
              color: selected ? "var(--icon-container-bg)" : "white",
            }}
          >
            s
          </span>
        </div>
      </div>
      <button
        className="verse-button"
        onClick={() => {
          if (Math.floor(Math.random()*10) % 2) {
            liveElement1.set({
              type: "text",
              value: lines.reduce((p, c) => p + "\n" + c, ""),
              buttonID: buttonID,
            });
          } else {
            liveElement2.set({
              type: "text",
              value: lines.reduce((p, c) => p + "\n" + c, ""),
              buttonID: buttonID,
            });
          }
        }}
      >
        {lines
          .flatMap((l, lIndex) => [
            <br key={`br${lIndex}`} />,
            <span key={`l${lIndex}`} className="line">
              {l}
            </span>,
          ])
          .slice(1)}
      </button>
      <div className="lights-container">
        <div
          className="icon-container dot-light"
          style={{ backgroundColor: live1 || live2 ? "red" : "var(--gray-3)" }}
        ></div>
        <div
          className="icon-container s-light"
          style={{
            backgroundColor: selected ? "white" : "var(--icon-container-bg)",
          }}
        ></div>
      </div>
    </div>
  );
}

export default VerseButton;
