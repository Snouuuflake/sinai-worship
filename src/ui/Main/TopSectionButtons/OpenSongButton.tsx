import { useContext } from "react";
import { GlobalContext } from "../GlobalContext";

function OpenSongButton() {
  const { MAX_LIVE_ELEMENTS } = useContext(GlobalContext) as GlobalContextType;
  const { openElement } = useContext(GlobalContext) as GlobalContextType;
  return (
    <button className="top-section-button"
      onClick={() => {
        window.electron.invokeReadSong((song) => {
          console.log(song);
          openElement.set({ type: "song", song: song });
        });
      }}
    >Open Song</button>
  );
}

export default OpenSongButton;
