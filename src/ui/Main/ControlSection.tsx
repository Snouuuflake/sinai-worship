import { GlobalContext } from "./GlobalContext";
import { useContext, useEffect, useState } from "react";
import SongControls from "./SongControls"
import "./ControlSection.css";


function ControlsSection() {
  const { viewElement } = useContext(GlobalContext) as GlobalContextType;

  return (
    <div className="control-section">
      <div className="blink blink-master" style={{ display: "none" }}></div>
      {viewElement.value.type === "song" && viewElement.value.song
        ?<SongControls song={viewElement.value.song}></SongControls>
        : ""}
    </div>
  );
}

export default ControlsSection;
