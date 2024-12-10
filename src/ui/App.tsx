import { useState, useContext } from "react";
import "./App.css";
import LinesProvider from "./contextTest.tsx";
import { LinesContext, LinesContextType } from "./contextTest.tsx";
import RedSquare from "./RedSquare.tsx";
import CounterDisplay from "./CounterDisplay.tsx";
import CounterButton from "./CounterButton.tsx";
import LineInput from "./LineInput.tsx";
//import Body from "./Body.tsx"

function App() {
  const [testState, setTestState] = useState(0);
  return (
    <LinesProvider>
      <RedSquare>
        <CounterDisplay></CounterDisplay>
        <CounterButton></CounterButton>
        <LineInput></LineInput>
      </RedSquare>
    </LinesProvider>
  );
}

export default App;
