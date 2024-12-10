import { useState } from "react";
import "./VerseButton.css";

function VerseButton({ lines }: { lines: Array<string> }) {
  const [live, setLive] = useState<boolean>(false);
  const [selected, setSelected] = useState<boolean>(false);
  return (
    <div className="verse-button-container">
      <div className="icons-container">
        <div className="icon-container">
          <div
            className="dot"
            style={{ backgroundColor: live ? "red" : "white" }}
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
      <button
        className="verse-button"
        onClick={() => {
          if (live) {
            setSelected(true);
            setLive(false);
          } else {
            setSelected(false);
            setLive(true);
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
          style={{ backgroundColor: live ? "red" : "var(--gray-3)" }}
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
