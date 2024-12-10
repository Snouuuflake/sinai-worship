import { useContext } from "react";
import { GlobalContextType, GlobalContext } from "./Main/GlobalContext";

function Body() {
  const { liveSong, setLiveSong } = useContext(
    GlobalContext,
  ) as GlobalContextType;
  return (
    <div>
      <h1> MSS-Worship (Now in react!) </h1>
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
                    lines: ["v1 l1", "v1 l2", "v1 l3", "v1 l4"],
                  },
                  {
                    lines: ["v2 l1", "v2 l2", "v2 l3", "v2 l4"],
                  },
                  {
                    lines: ["v2 l1", "v2 l2", "v2 l3", "v2 l4"],
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
                    lines: ["v2 l1", "v2 l2", "v2 l3", "v2 l4"],
                  },
                ],
              },
              {
                name: "Section 3",
                verses: [
                  {
                    lines: ["v1 l1", "v1 l2", "v1 l3", "v1 l4"],
                  },
                  {
                    lines: ["v2 l1", "v2 l2", "v2 l3", "v2 l4"],
                  },
                  {
                    lines: ["v2 l1", "v2 l2", "v2 l3", "v2 l4"],
                  },
                ],
              },
            ],
            sectionOrder: ["Section 3", "Section 2", "Section 1", "Section 2"],
          };
          setLiveSong(testSong);
        }}
      ></button>
      <div style={{ whiteSpace: "pre-line" }}>
        <h2>Title: {liveSong ? liveSong.title : ""}</h2>
        <h2>Author: {liveSong ? liveSong.author : ""}</h2>
        {liveSong
          ? liveSong.sectionOrder
            .map(
              (sname) =>
                sname +
                liveSong.sections
                  .find((s) => s.name === sname)!
                  .verses.reduce(
                    (p, c) =>
                      p +
                      c.lines.reduce((p, c) => p + " \n" + c, "") +
                      " \n",
                    "",
                  ) || "",
            )
            .reduce((p, c) => p + " \n" + c)
          : ""}
      </div>
    </div>
  );
}

export default Body;
