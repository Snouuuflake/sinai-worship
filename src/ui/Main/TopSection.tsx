import "./TopSection.css"
import { useContext } from "react";
import { GlobalContext } from "./GlobalContext";
import DisplayButton from "./TopSectionButtons/DisplayButton"
import OpenSongButton from "./TopSectionButtons/OpenSongButton"

function TopSection() {
  // NOTE: it should request window types from body eventually
  const { openElement } = useContext(GlobalContext) as GlobalContextType;

  return (
    <div className="top-section">
    <DisplayButton/>
    <OpenSongButton/>
    </div>
  )
}

export default TopSection;
