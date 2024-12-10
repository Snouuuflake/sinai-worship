import { PropsWithChildren } from "react";

export default function RedSquare(props: PropsWithChildren) {
  return (
    <div style={{ height: "300px", width: "300px", backgroundColor: "red" }}>
      {props.children}
    </div>
  );
}
