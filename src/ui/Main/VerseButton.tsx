import { useContext, useRef, useEffect } from "react";
import { GlobalContext } from "./GlobalContext";

function VerseButton({
  lines,
  buttonID,
  object,
  selected,
  setSelected,
}: {
  lines: Array<string>;
  buttonID: number;
  object: any;
  selected: boolean;
  setSelected: (value: React.SetStateAction<number>) => void;
}) {
  const { MAX_LIVE_ELEMENTS, liveElementsState } = useContext(
    GlobalContext,
  ) as GlobalContextType;

  const matchingLiveIndexes = liveElementsState.value.flatMap((le, i) =>
    le.buttonID == buttonID && le.object == object ? [i] : [],
  );

  /** [1,2,...,MAX_LIVE_ELEMENTS-1] */
  const liveIndexesRange = Array.from(
    { length: MAX_LIVE_ELEMENTS },
    (_, i) => i,
  );

  const someMatching = !!matchingLiveIndexes.length;
  const allMatching = matchingLiveIndexes.length == MAX_LIVE_ELEMENTS;

  const thisRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (selected && thisRef.current) {
      thisRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [selected]);

  return (
    <div className="verse-button-container-row" ref={thisRef}>
      <div className="icons-container">
        <div className="icon-container">
          <div
            className={`dot ${someMatching && !allMatching ? "blink" : ""}`}
            style={{
              backgroundColor: someMatching ? "var(--hi1)" : "white",
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
              tabIndex={-1}
              key={`di${i}`}
              className="display-index"
              style={{
                color:
                  typeof matchingLiveIndexes.find((j) => j == i) != "undefined"
                    ? "var(--hi1)"
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
                      object: object,
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
          tabIndex={-1}
          className="verse-button"
          key={`b${buttonID}`}
          id={`verse-button-${buttonID}`}
          onClick={() => {
            console.log(someMatching, allMatching);
            setSelected(buttonID);
            liveElementsState.set(
              Array.from({ length: MAX_LIVE_ELEMENTS }).map((_, i) => {
                return {
                  index: i,
                  liveElement: {
                    type: "text",
                    value: lines.reduce((p, c) => p + "\n" + c, "").trim(),
                    buttonID: buttonID,
                    object: object,
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
            backgroundColor: someMatching ? "var(--hi1)" : "var(--gray-3)",
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
