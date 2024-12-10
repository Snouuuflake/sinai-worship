function Body(props: { content: string }) {
  return (
    <div>
      <h1> this is the body! </h1>
      <div>{props.content}</div>
    </div>
  );
}

export default Body;
