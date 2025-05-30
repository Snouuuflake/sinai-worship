import VerseButton from "./VerseButton";
import AddButtons from "./AddButtons";
import Icon from "../Icon";
import ConfirmKillButton from "../ConfirmKillButton";
import "./general-icon-button.css";
import { GlobalContext } from "../GlobalContext";
import "./SongControls.css";
import "./VerseButton.css";

import { useContext, useEffect, useState, useRef } from "react";

function makeNoteTitle(text: string) {
  return (
    <>
      <b>Note: </b> {text}
    </>
  );
}

function SongControls({ song }: { song: Song }) {
  const [selected, setSelected] = useState<LiveSongReference>({
    object: song,
    verseID: 0,
    sectionID: 0,
  });
  const newElementText = useRef<string>("");
  const { openElements, liveElements } = useContext(
    GlobalContext,
  ) as GlobalContextType;

  const lyricSectionOrder = song.sectionOrder.filter(
    (sei) => sei.type === "section" || sei.type === "repeat",
  );

  useEffect(() => {
    function keyHandler(event: KeyboardEvent) {
      const target = event.target as HTMLElement;
      if (!target.classList.contains("text-input")) {
        switch (event.key) {
          case "ArrowUp":
            event.preventDefault();
            if (selected.verseID > 0) {
              setSelected({ ...selected, verseID: selected.verseID - 1 });
            } else if (selected.sectionID > 0) {
              setSelected({
                ...selected,
                sectionID: selected.sectionID - 1,
                verseID:
                  song.sections.find(
                    (s) =>
                      s.name === lyricSectionOrder[selected.sectionID - 1].name,
                  )!.verses.length - 1,
              });
            }
            break;
          case "ArrowDown":
            event.preventDefault();

            if (
              selected.verseID <
              song.sections.find(
                (s) => s.name === lyricSectionOrder[selected.sectionID].name,
              )!.verses.length -
                1
            ) {
              setSelected({ ...selected, verseID: selected.verseID + 1 });
            } else if (selected.sectionID < lyricSectionOrder.length - 1) {
              setSelected({
                ...selected,
                sectionID: selected.sectionID + 1,
                verseID: 0,
              });
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
  let sIndex: number = -1;
  let sIndex2: number = -1; // same thing, used for song sections bit
  console.log(song);
  const updateState = () => {
    openElements.set([...openElements.value]);
  };
  return [
    <div className="section-controls" key="sectioncontrols">
      <div className="inverse-title-container margin-bottom-7">
        <div className="inverse-title">Song Sections</div>
        <button
          className="inverse-title-button"
          onClick={() => {
            window.electron.invokeSaveSong(song).then(
              () => {
                console.log("wrote song");
              },
              (e) => {
                console.log("error writing song: " + e.message);
                window.electron.sendAlert(e.message);
              },
            );
          }}
        >
          Save Song
        </button>
      </div>
      {song.sectionOrder.map((sei, seiIndex) => {
        return (
          <div key={`sc${seiIndex}`} className="section-controls-row">
            <div className="section-row-text">
              {sei.type === "section" || sei.type === "repeat"
                ? sei.name
                : (() => {
                    console.log(song.notes);
                    return makeNoteTitle(
                      song.notes.find((n) => n.name === sei.name)!.text,
                    );
                  })()}
            </div>
            {sei.type !== "note" ? (
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
            ) : (
              ""
            )}
            <ConfirmKillButton
              callback={() => {
                if (sei.type === "section" || sei.type === "repeat") {
                  const lyricSectionIndex = lyricSectionOrder.indexOf(sei);
                  if (selected.sectionID > lyricSectionIndex) {
                    setSelected({
                      ...selected,
                      sectionID: selected.sectionID - 1,
                    });
                  } else if (selected.sectionID == lyricSectionIndex) {
                    if (lyricSectionIndex == 0) {
                      setSelected({ ...selected, verseID: 0 });
                    } else {
                      setSelected({
                        ...selected,
                        sectionID: selected.sectionID - 1,
                        verseID: 0,
                      });
                    }
                  }
                  liveElements.map((le, i) => {
                    if (le.type !== "text") return le;
                    if (le.reference.sectionID > lyricSectionIndex) {
                      return {
                        ...le,
                        reference: {
                          ...le.reference,
                          sectionID: selected.sectionID - 1,
                        },
                      };
                    } else if (le.reference.sectionID == lyricSectionIndex) {
                      if (lyricSectionIndex == 0) {
                        return {
                          type: "none",
                          value: "",
                          reference: {
                            object: null,
                          },
                        };
                      } else {
                        return {
                          ...le,
                          reference: {
                            ...le.reference,
                            verseID: 0,
                            sectionID: le.reference.sectionID - 1,
                          },
                        };
                      }
                    } 
                    return le;
                  });
                }
                if (sei.type === "repeat") {
                  song.sectionOrder.splice(seiIndex, 1);
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
                } else if (sei.type === "note") {
                  song.sectionOrder.splice(seiIndex, 1);
                  song.notes.splice(
                    song.notes.indexOf(
                      song.notes.find((n) => n.name === sei.name)!,
                    ),
                    1,
                  );
                }
                updateState();
              }}
            />
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
                  if (
                    song.sectionOrder[seiIndex - 1].type === "section" ||
                    song.sectionOrder[seiIndex - 1].type === "repeat"
                  ) {
                    // swapping selected
                    if (selected.sectionID == seiIndex) {
                      setSelected({
                        ...selected,
                        sectionID: selected.sectionID - 1,
                      });
                    } else if (selected.sectionID == seiIndex - 1) {
                      setSelected({
                        ...selected,
                        sectionID: selected.sectionID + 1,
                      });
                    }
                    // swapping liveElements
                    liveElements.map((le, i) =>
                      le.type === "text" && le.reference.object === song
                        ? le.reference.sectionID == seiIndex
                          ? {
                              ...le,
                              reference: {
                                ...le.reference,
                                sectionID: le.reference.sectionID - 1,
                              },
                            }
                          : le.reference.sectionID == seiIndex - 1
                            ? {
                                ...le,
                                reference: {
                                  ...le.reference,
                                  sectionID: le.reference.sectionID + 1,
                                },
                              }
                            : le
                        : le,
                    );
                  }
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
                  if (
                    song.sectionOrder[seiIndex + 1].type === "section" ||
                    song.sectionOrder[seiIndex + 1].type === "repeat"
                  ) {
                    // swapping selected
                    if (selected.sectionID == seiIndex) {
                      setSelected({
                        ...selected,
                        sectionID: selected.sectionID + 1,
                      });
                    } else if (selected.sectionID == seiIndex + 1) {
                      setSelected({
                        ...selected,
                        sectionID: selected.sectionID - 1,
                      });
                    }
                    // swapping liveElements
                    liveElements.map((le, i) =>
                      le.type === "text" && le.reference.object == song
                        ? le.reference.sectionID == seiIndex
                          ? {
                              ...le,
                              reference: {
                                ...le.reference,
                                sectionID: le.reference.sectionID + 1,
                              },
                            }
                          : le.reference.sectionID == seiIndex + 1
                            ? {
                                ...le,
                                reference: {
                                  ...le.reference,
                                  sectionID: le.reference.sectionID - 1,
                                },
                              }
                            : le
                        : le,
                    );
                  }
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
          className="dark-material-input text-input"
          type="text"
          onChange={(event) => {
            newElementText.current = event.target.value.trim();
          }}
        ></input>
        <button
          className="new-element-button"
          onClick={() => {
            if (!newElementText.current) {
              return;
            }

            let noteID: number = 1;
            while (song.notes.find((n) => n.name === `note${noteID}`)) {
              noteID++;
              if (noteID >= Number.MAX_SAFE_INTEGER) {
                return;
              }
            }
            const newNoteName = `note${noteID}`;
            song.notes.push({
              name: newNoteName,
              text: newElementText.current,
            });

            song.sectionOrder.push({ name: newNoteName, type: "note" });

            updateState();
          }}
        >
          <div className="new-element-button-content">+N</div>
        </button>
        <button
          className="new-element-button"
          onClick={() => {
            if (
              !song.sections.find((s) => s.name === newElementText.current) &&
              newElementText.current
            ) {
              song.sections.push({ name: newElementText.current, verses: [] });
              song.sectionOrder.push({
                name: newElementText.current,
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
        sIndex++;
        return [
          <h3
            key={`s${seiIndex}`}
            className="section-title"
            style={{ marginTop: seiIndex == 0 ? 0 : "" }}
          >
            {sei.name}
          </h3>,

          currentSection.verses.map((_v, vIndex) => {
            buttonIDCounter += 1;
            return (
              <VerseButton
                key={`s${seiIndex}v${vIndex}`}
                section={currentSection}
                reference={{
                  object: song,
                  verseID: vIndex,
                  sectionID: sIndex,
                }}
                selectedState={{ value: selected, set: setSelected }}
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
          <div key={sei.name} className="note">
            <b>Note: </b>
            {song.notes.find((n) => n.name === sei.name)!.text}{" "}
          </div>
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
