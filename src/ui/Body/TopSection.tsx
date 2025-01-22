import "./TopSection.css"
import DisplayButton from "./TopSectionButtons/DisplayButton"
import OpenSongButton from "./TopSectionButtons/OpenSongButton"

function TopSection() {
  // NOTE: it should request window types from body eventually
  return (
    <div className="top-section">
    <DisplayButton/>
    <OpenSongButton/>
    </div>
  )
}

export default TopSection;
