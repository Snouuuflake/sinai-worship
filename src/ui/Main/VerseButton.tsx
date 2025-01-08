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
  const { MAX_LIVE_ELEMENTS, liveElementsState } = useContext(
    GlobalContext,
  ) as GlobalContextType;

  const matchingLiveIndexes = liveElementsState.value.flatMap((le, i) =>
    le.buttonID == buttonID ? [i] : [],
  );

  const someMatching = !!matchingLiveIndexes.length;
  const allMatching = matchingLiveIndexes.length == MAX_LIVE_ELEMENTS;

  const selected = false;

  return (
    <div className="verse-button-container">
      <div className="icons-container">
        <div className="icon-container">
          <div
            className={
              /* if both or none */ allMatching || !someMatching
                ? "dot"
                : "hidden"
            }
            style={{
              backgroundColor: allMatching
                ? "red"
                : someMatching
                  ? "transparent"
                  : "white",
              color: "red",
              fontWeight: "bold",
            }}
          ></div>
          {allMatching ? "" : matchingLiveIndexes.map((i) => <span>{i}</span>)}
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
          //if (Math.floor(Math.random() * 10) % 2) {
          //  liveElement1.set({
          //    type: "text",
          //    value: lines.reduce((p, c) => p + "\n" + c, ""),
          //    buttonID: buttonID,
          //  });
          //} else {
          //  liveElement2.set({
          //    type: "text",
          //    value: lines.reduce((p, c) => p + "\n" + c, ""),
          //    buttonID: buttonID,
          //  });
          //}

          liveElementsState.set(
            Array.from({ length: MAX_LIVE_ELEMENTS }).map((_, i) => {
              return {
                index: i,
                liveElement: {
                  type: "text",
                  value: lines.reduce((p, c) => p + "\n" + c, ""),
                  buttonID: buttonID,
                },
              };
            })
          );
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
          style={{
            backgroundColor: allMatching
              ? "red"
              : someMatching
                ? "DarkRed"
                : "var(--gray-3)",
          }}
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
