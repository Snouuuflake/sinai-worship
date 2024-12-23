import { useContext } from "react";
import { GlobalContext } from "./GlobalContext";
import MainSection from "./MainSection";

function Body() {
  const { openElement } = useContext(GlobalContext) as GlobalContextType;
  return (
    <div>
      <button
        onClick={() => {
          const testSong: Song = {
            title: "Test Song",
            author: "Craigory",
            sections: [
              {
                name: "Section 1",
                verses: [
                  {
                    lines: ["v1 l1"],
                  },
                  {
                    lines: ["v2 l1", "v2 l2"],
                  },
                  {
                    lines: ["v3 l1", "v3 l2", "v3 l3", "v3 l4"],
                  },
                ],
              },
              {
                name: "Section 2",
                verses: [
                  {
                    lines: ["v1 l1", "v1 l2", "v1 l3", "v1 l4"],
                  },
                  {
                    lines: ["v2 l1", "v2 l2", "v2 l3", "v2 l4"],
                  },
                  {
                    lines: ["v3 l1", "v3 l2", "v3 l3", "v3 l4"],
                  },
                ],
              },
              {
                name: "Section 3",
                verses: [
                  {
                    lines: ["v1 l1"],
                  },
                  {
                    lines: ["v2 l1", "v2 l2"],
                  },
                  {
                    lines: ["v3 l1", "v3 l2", "v3 l3"],
                  },
                ],
              },
            ],
            sectionOrder: ["Section 3", "Section 2", "Section 1", "Section 2"],
          };
          openElement.set({
            type: "song",
            song: testSong,
          });
        }}
      >
        Load Test Song
      </button>

      <MainSection></MainSection>
    </div>
  );
}

export default Body;
