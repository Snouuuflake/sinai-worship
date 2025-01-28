import VerseButton from "./VerseButton";
import AddButtons from "./AddButtons";
import Icon from "../Icon";
import "./general-icon-button.css";
import { GlobalContext } from "../GlobalContext";
import "./SongControls.css";
import "./VerseButton.css";

import { useContext, useEffect, useState, useRef } from "react";

function makeNoteTitle(text: string) {
  return (
    <>
      <b>Note: </b>
      {text.length > 30 ? text.slice(0, 30) + "..." : text}
    </>
  );
}

function SongControls({ song }: { song: Song }) {
  const [selected, setSelected] = useState<number>(0);
  const newSectionName = useRef<string>("");
  const maxSelected = song.sectionOrder.flatMap((sei) =>
    sei.type === "section" || sei.type === "repeat"
      ? song.sections.find((s) => s.name === sei.name)!.verses
      : [],
  ).length;
  const { openElements } = useContext(GlobalContext) as GlobalContextType;

  useEffect(() => {
    function keyHandler(event: KeyboardEvent) {
      const target = event.target as HTMLElement;
      if (!target.classList.contains("text-input")) {
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
  console.log(song);
  const updateState = () => {
    openElements.set([...openElements.value]);
  };
  return [
    <div className="section-controls" key="sectioncontrols">
      {song.sectionOrder.map((sei, seiIndex) => {
        return (
          <div key={`sc${seiIndex}`} style={{ display: "flex", gap: "5px" }}>
            <div style={{ flexGrow: 1 }}>
              {sei.type === "section" || sei.type === "repeat"
                ? sei.name
                : makeNoteTitle(
                    song.notes.find((n) => n.name === sei.name)!.text,
                  )}
            </div>
            <button
              className="general-icon-button"
              onClick={() => {
                song.sectionOrder.splice(seiIndex + 1, 0, {
                  type: "repeat",
                  name: sei.name,
                });
                // !! for deleting, we need to check if we're deleting the definition, if so, take the nearest repetition and make it definition, or, if none, ask the user if theyre sure
                updateState();
              }}
            >
              <Icon code="C" />
            </button>
            <button
              className="general-icon-button"
              onClick={() => {
                if (sei.type === "repeat") {
                  song.sectionOrder.splice(seiIndex, 1);
                  updateState();
                } else if (sei.type === "section") {
                  if (
                    song.sectionOrder.filter(
                      (sei2) =>
                        sei2.name === sei.name && sei2.type === "repeat",
                    ).length != 0
                  ) {
                    song.sectionOrder.find(
                      (sei2) =>
                        sei2.name === sei.name && sei2.type === "repeat",
                    )!.type = "section";
                    song.sectionOrder.splice(seiIndex, 1);
                  } else {
                    song.sectionOrder.splice(seiIndex, 1);
                    song.sections.splice(
                      song.sections.indexOf(
                        song.sections.find((s) => s.name === sei.name)!,
                      ),
                      1,
                    );
                  }

                  updateState();
                }
              }}
            >
              <Icon code="X" />
            </button>
            <button
              className="general-icon-button"
              onClick={() => {
                if (seiIndex > 0) {
                  [
                    song.sectionOrder[seiIndex - 1],
                    song.sectionOrder[seiIndex],
                  ] = [
                    song.sectionOrder[seiIndex],
                    song.sectionOrder[seiIndex - 1],
                  ];
                  updateState();
                }
              }}
            >
              <Icon code="U" />
            </button>
            <button
              className="general-icon-button"
              onClick={() => {
                if (seiIndex < song.sectionOrder.length - 1) {
                  [
                    song.sectionOrder[seiIndex + 1],
                    song.sectionOrder[seiIndex],
                  ] = [
                    song.sectionOrder[seiIndex],
                    song.sectionOrder[seiIndex + 1],
                  ];
                  updateState();
                }
              }}
            >
              <Icon code="D" />
            </button>
          </div>
        );
      })}
      <div className="new-element-container">
        <input
          className="new-element-input"
          type="text"
          onChange={(event) => {
            newSectionName.current = event.target.value.trim();
          }}
        ></input>
        <button className="new-element-button" onClick={() => {}}>
          <div className="new-element-button-content">+N</div>
        </button>
        <button
          className="new-element-button"
          onClick={() => {
            if (
              !song.sections.find((s) => s.name === newSectionName.current) &&
              newSectionName.current
            ) {
              song.sections.push({ name: newSectionName.current, verses: [] });
              song.sectionOrder.push({
                name: newSectionName.current,
                type: "section",
              });
              updateState();
            }
          }}
        >
          <div className="new-element-button-content">+S</div>
        </button>
      </div>
    </div>,
    ...song.sectionOrder.flatMap((sei, seiIndex) => {
      if (sei.type === "section" || sei.type === "repeat") {
        const currentSection = song.sections.find((s) => s.name == sei.name)!;
        return [
          <h3 key={`s${seiIndex}`} className="section-title">
            {sei.name}
          </h3>,

          currentSection.verses.map((_v, vIndex) => {
            buttonIDCounter += 1;
            return (
              <VerseButton
                key={`s${seiIndex}v${vIndex}`}
                section={currentSection}
                verseIndex={vIndex}
                buttonID={buttonIDCounter}
                object={song}
                selected={selected == buttonIDCounter}
                setSelected={setSelected}
                updateState={updateState}
              ></VerseButton>
            );
          }),

          <AddButtons
            song={song}
            key={`ab${seiIndex}`}
            section={currentSection}
            sectionOrderIndex={seiIndex}
          />,
        ];
      } else if (sei.type === "note") {
        return (
          <h4 key={sei.name} className="note">
            {song.notes.find((n) => n.name === sei.name)!.text}{" "}
          </h4>
        );
      }
    }),
  ];
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
