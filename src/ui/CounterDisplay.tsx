import { useContext } from "react";
import { LinesContext, LinesContextType } from "./contextTest";

export default function CounterDisplay() {
  const {lines} = useContext(LinesContext) as LinesContextType;
  return (
    <h1>{lines.reduce((p,c) => {return p + "\n" + c}, "")}</h1>
  )
}
