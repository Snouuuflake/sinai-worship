import VerseButton from "./VerseButton";
import "./VerseButton.css";

import { useContext, useEffect, useState, useRef } from "react";

function SongControls({ song }: { song: Song }) {
  const [selected, setSelected] = useState<number>(0);
  const maxSelected = song.sectionOrder.flatMap((sei) =>
    sei.type === "section" || sei.type === "repeat"
      ? song.sections.find((s) => s.name === sei.name)!.verses
      : [],
  ).length;

  useEffect(() => {
    function keyHandler(event: KeyboardEvent) {
      const target = event.target as HTMLElement;
      if (target.tagName !== "TEXTAREA") {
        switch (event.key) {
          case "ArrowUp":
            event.preventDefault();
            if (selected > 0) {
              setSelected(selected - 1);
            }
            break;
          case "ArrowDown":
            event.preventDefault();
            if (selected < maxSelected - 1) {
              setSelected(selected + 1);
            }
            break;
          case " ":
          case "Enter":
            event.preventDefault();
            const buttonToPress = document.getElementById(
              `verse-button-${selected}`,
            );
            if (buttonToPress) {
              buttonToPress.click();
            }
          default:
            break;
        }
      }
    }

    window.addEventListener("keydown", keyHandler);
    return () => {
      window.removeEventListener("keydown", keyHandler);
    };
  }, [selected]);

  let buttonIDCounter: number = -1;
  return song.sectionOrder.flatMap((sei, seiIndex) => {
    if (sei.type === "section" || sei.type === "repeat") {
      return [
        <h3 key={`s${seiIndex}`} className="section-title">
          {sei.name}
        </h3>,

        (() => {
          // <- this is stupid
          const currentSection = song.sections.find((s) => s.name == sei.name)!;
          return currentSection.verses.map((v, vIndex) => {
            buttonIDCounter += 1;
            return (
              <VerseButton
                key={`s${seiIndex}v${vIndex}`}
                //lines={v.lines}
                section={currentSection}
                verseIndex={vIndex}
                buttonID={buttonIDCounter}
                object={song}
                selected={selected == buttonIDCounter}
                setSelected={setSelected}
              ></VerseButton>
            );
          });
        })(),
      ];
    } else if (sei.type === "note") {
      return (
        <h4 key={sei.name} className="note">
          {song.notes.find((n) => n.name === sei.name)!.text}{" "}
        </h4>
      );
    }
  });
  //} catch (err) {
  //  // NOTE: this is here because of the song.sections.find type assertion. could be undefined.
  //  //       if the song file was genereated remotely right, this should never happen.
  //  const e = err as Error;
  //  // TODO: handle this properly
  //  window.alert(
  //    `Error: ${e.message}.\nAn element of sectionOrder likely doesnt exist.`,
  //  );
  //}
}

export default SongControls;
