import { useContext } from "react";
import { GlobalContext } from "./GlobalContext";
import MainSection from "./MainSection";
import TopSection from "./TopSection";

function Body() {
  return (
    <div>
      <TopSection />
      <MainSection></MainSection>
    </div>
  );
}

export default Body;
