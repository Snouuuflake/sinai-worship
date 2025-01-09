import { GlobalContext } from "./GlobalContext";
import { useContext, useEffect, useState } from "react";
import VerseButton from "./VerseButton";
import "./MainSection.css";
import "./VerseButton.css";

function makeSongControls(song: Song) {
  let buttonIDCounter: number = 0;
  try {
    return song.sectionOrder.flatMap((sname, snameIndex): React.ReactNode[] => {
      const currentS = song.sections.find((s) => s.name === sname)!;
      return [
        <h3 key={`s${snameIndex}`} className="section-title">
          {currentS.name}
        </h3>,
        currentS.verses.map((v, vIndex) => {
          buttonIDCounter += 1;
          return (
            <VerseButton
              key={`v${vIndex}`}
              lines={v.lines}
              buttonID={buttonIDCounter}
            ></VerseButton>
          );
        }),
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
  const { openElement } = useContext(GlobalContext) as GlobalContextType;
  return (
    <div className="main-section">
      <div className="blink blink-master" style={{ display: "none" }}></div>
      {openElement.value.type === "song" && openElement.value.song
        ? makeSongControls(openElement.value.song)
        : ""}
    </div>
  );
}

export default MainSection;
