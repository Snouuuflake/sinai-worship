import { useContext } from "react";
import { GlobalContext } from "../GlobalContext";

function AddButtons({
  song,
  section,
  sectionOrderIndex,
}: {
  song: Song;
  section: Section;
  sectionOrderIndex: number;
}) {
  const { openElements } = useContext(GlobalContext) as GlobalContextType;

  return (
    <div style={{ display: "flex" }}>
      {/* i am going to make a separate menu for this, this is awful
      <button
        onClick={() => {
          const TMP_NAME = ":333";
          if (
            !song.sectionOrder.find(
              (sei) => sei.type === "section" && sei.name === TMP_NAME,
            )
          ) {
            song.sectionOrder.splice(sectionOrderIndex, 0, {
              type: "section",
              name: TMP_NAME,
            });
            song.sections = [
              ...song.sections,
              {
                name: TMP_NAME,
                verses: [{ lines: [":3"] }],
              },
            ];
            openElements.set(openElements.value);
            viewElement.set(viewElement.value);
            console.log(viewElement.value);
          }
        }}
      >
        +Section
      </button>*/}

      <button
        style={{ marginLeft: "auto" }}
        onClick={() => {
          section.verses.push({ lines: ["Verse text goes here."] });
          console.log(section.verses);

          // i cant tell if this is/nt incredibly stupid
          openElements.set([...openElements.value]);
        }}
      >
        + Verse
      </button>
    </div>
  );
}

export default AddButtons;
