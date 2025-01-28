import "./Body.css";
import ControlSection from "./ControlSection";
import OpenElementMenu from "./OpenElementMenu";
import TopSection from "./TopSection";

function Body() {
  return (
    <div className="body">
      <TopSection />
      <div className="main-container">
        <OpenElementMenu />
        <ControlSection />
      </div>
    </div>
  );
}

export default Body;
