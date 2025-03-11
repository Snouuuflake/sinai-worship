import "./TopSection.css"
import DisplayButton from "./TopSectionButtons/DisplayButton"
import OpenSongButton from "./TopSectionButtons/OpenSongButton"
import DisplaySettingsButton from "./TopSectionButtons/DisplaySettingsButton"

function TopSection() {
  // NOTE: it should request window types from body eventually
  return (
    <div className="top-section">
    <DisplayButton/>
    <OpenSongButton/>
    <DisplaySettingsButton/>
    </div>
  )
}

export default TopSection;
