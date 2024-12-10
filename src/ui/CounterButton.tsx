import { useContext } from "react";
import { LinesContext, LinesContextType } from "./contextTest";

export default function CounterDisplay() {
  const { lines, updateLines, input } = useContext(LinesContext) as LinesContextType;
  return (
    <button
      onClick={() => {
        console.log("input", input)
        updateLines(input);
        console.log(lines);
      }}
    >
      Update!
    </button>
  );
}
