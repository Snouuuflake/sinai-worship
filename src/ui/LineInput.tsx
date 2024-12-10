import { useContext } from "react";
import { LinesContextType, LinesContext } from "./contextTest.tsx";

export default function LineInput() {
  const { setInput } = useContext(LinesContext) as LinesContextType;

  return (
    <input
      type="text"
      onInput={function (e: React.ChangeEvent<HTMLInputElement>) {
        setInput(e.target.value);
        return;
      }}
    ></input>
  );
}
