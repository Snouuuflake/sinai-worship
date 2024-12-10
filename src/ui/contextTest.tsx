import { createContext, useState} from "react";

export type LinesContextType = {
  lines: Array<string>;
  updateLines: (value: string) => void;
  input: string;
  setInput: React.Dispatch<React.SetStateAction<string>>;
};

export const LinesContext = createContext<LinesContextType | null>(null);

const LinesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [lines, setLines] = useState<Array<string>>([]);
  const [input, setInput] = useState<string>("");

  const updateLines = (value: string) => {
    console.log(value);
    setLines([...lines, value]);
  };
  return (
    <LinesContext.Provider value={{ lines, updateLines, input, setInput }}>
      {children}
    </LinesContext.Provider>
  );
};

export default LinesProvider;
