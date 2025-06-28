import { useState } from "react";
import Bible from "./Bible";

const BibleButton: React.FC<{
  onSubmit: (value: string[], shiftKey: boolean) => void
}> = (props) => {
  const [open, setOpen] = useState(false);
  return (
    <>
      {open ? (
        <Bible
          onSubmit={(value, event) => {
            props.onSubmit(value, event.shiftKey);
            setOpen(false);
          }}
          onExit={(event) => {
            setOpen(false);
          }}
        />
      ) : (
        ""
      )}
      <button onClick={()=>{setOpen(true)}}>+ Bible</button>
    </>
  );
};

export default BibleButton;
