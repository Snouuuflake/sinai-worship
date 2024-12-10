import { GlobalContext, GlobalContextType } from "./GlobalContext";
import { useContext } from "react";
import VerseButton from "./VerseButton";
import "./MainSection.css";

function makeSongControls(song: Song) {
  try {
    return song.sectionOrder.flatMap((sname, snameIndex): React.ReactNode[] => {
      const currentS = song.sections.find((s) => s.name === sname)!;
      return [
        <h3 key={`s${snameIndex}`} className="section-title">{currentS.name}</h3>,
        currentS.verses.map((v, vIndex) => (
          <VerseButton key={`v${vIndex}`} lines={v.lines}>
          </VerseButton>
        )),
      ];
    });
  } catch (err) {
    // NOTE: this is here because of the song.sections.find type assertion. could be undefinied.
    //       if the song file was genereated remotely right, this should never happen.
    const e = err as Error;
    // TODO: handle this properly
    window.alert(
      `Error: ${e.message}.\nAn element of sectionOrder likely doesnt exist.`,
    );
  }
}

function MainSection() {
  const { liveSong } = useContext(GlobalContext) as GlobalContextType;
  return (
    <div className="main-section">
      {liveSong ? makeSongControls(liveSong) : ""}
    </div>
  );
}

export default MainSection;
