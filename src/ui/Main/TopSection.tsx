import { useContext } from "react";
import { GlobalContext } from "./GlobalContext";
import DisplayButton from "./TopSectionButtons/DisplayButton"

function TopSection() {
  // NOTE: it should request window types from body eventually
  const { openElement } = useContext(GlobalContext) as GlobalContextType;

  return (
    <div>
    <DisplayButton/>
    </div>
  )
}

export default TopSection;
