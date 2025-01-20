import { useContext } from "react";
import { GlobalContext } from "./GlobalContext";

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

  /** [1,2,...,MAX_LIVE_ELEMENTS-1] */
  const liveIndexesRange = Array.from(
    { length: MAX_LIVE_ELEMENTS },
    (_, i) => i,
  );

  const someMatching = !!matchingLiveIndexes.length;
  const allMatching = matchingLiveIndexes.length == MAX_LIVE_ELEMENTS;

  const selected = false;

  return (
    <div className="verse-button-container-row">
      <div className="icons-container">
        <div className="icon-container">
          <div
            className={`dot ${someMatching && !allMatching ? "blink" : ""}`}
            style={{
              backgroundColor: someMatching ? "red" : "white",
            }}
          ></div>
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
      <div className="verse-button-container-col">
        <div className="display-indexes-container">
          {liveIndexesRange.map((i) => (
            <button
              key={`di${i}`}
              className="display-index"
              style={{
                color:
                  typeof matchingLiveIndexes.find((j) => j == i) != "undefined"
                    ? "red"
                    : "gray",
              }}
              onClick={(e) => {
                e.preventDefault();
                liveElementsState.set([
                  {
                    index: i,
                    liveElement: {
                      type: "text",
                      value: lines.reduce((p, c) => p + "\n" + c, "").trim(),
                      buttonID: buttonID,
                    },
                  },
                ]);
              }}
            >
              {i + 1}
            </button>
          ))}
        </div>
        <button
          className="verse-button"
          key={`b${buttonID}`}
          onClick={() => {
            console.log(someMatching, allMatching);
            liveElementsState.set(
              Array.from({ length: MAX_LIVE_ELEMENTS }).map((_, i) => {
                return {
                  index: i,
                  liveElement: {
                    type: "text",
                    value: lines.reduce((p, c) => p + "\n" + c, "").trim(),
                    buttonID: buttonID,
                  },
                };
              }),
            );
          }}
        >
          <div className="verse-button-content">
            {lines
              .flatMap((l, lIndex) => [
                <hr className="verse-button-hr" key={`hr${lIndex}`} />,
                <div key={`l${lIndex}`} className="line">
                  {l}
                </div>,
              ])
              .slice(1)}
          </div>
        </button>
      </div>
      <div className="lights-container">
        <div
          className={`icon-container dot-light ${someMatching && !allMatching ? "blink" : ""} blinkcable`}
          style={{
            backgroundColor: someMatching ? "red" : "var(--gray-3)",
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
