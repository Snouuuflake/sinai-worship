import "./DisplayButton.css";

function makeIndexButtons(n: number) {
  return [...Array(n).keys()].map((element) => (
    <button
      className="index"
      onClick={() => {
        window.electron.sendNewDisplayWindow(element+1);
      }}
    >
    {element+1}
    </button>
  ));
}

function DisplayButton() {
  return (
    <div className="new-display drop-down">
      <button className="top-section-button drop-down-btn">New Window</button>
      <div className="drop-down-content">
        <div className="index-title">Window ID:</div>
        <div className="index-container">{makeIndexButtons(3)}</div>
      </div>
    </div>
  );
}

export default DisplayButton;
