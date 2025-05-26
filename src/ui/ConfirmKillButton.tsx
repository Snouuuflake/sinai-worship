import Icon from "./Icon";
import { useState, useRef, useEffect } from "react";

function ConfirmKillButton({ callback }: { callback: () => void }) {
  const [gonnaKill, setGonnaKill] = useState<boolean>(false);
  const thisRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    const callback = (event: MouseEvent) => {
      if (thisRef.current && !thisRef.current.contains(event.target as Node)) {
      //  console.log(event.target, thisRef.current)
      //console.log("condition")
        setGonnaKill(false);
      }
      //console.log("happened")
    };

    document.body.addEventListener("click", callback);

    return () => {
      document.body.removeEventListener("click", callback);
    };
  },[gonnaKill]);
  return (
    <button
      ref={thisRef}
      style={{ color: gonnaKill ? "red" : "" }}
      className="general-icon-button"
      onClick={(event) => {
        if (!gonnaKill) {
          setGonnaKill(true);
        } else {
          callback();
          setGonnaKill(false);
        }
      }}
    >
      <Icon code="X" />
    </button>
  );
}

export default ConfirmKillButton;
