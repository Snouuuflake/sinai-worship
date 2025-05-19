import "./ImageControls.css";

function ImageControls({ image }: { image: Image }) {
  return (
    <div
      style={{ display: "flex", flexDirection: "column", gap: "10px"}}
      className="image-controls"
    >
      <div className="inverse-title">{image.title}</div>
      <div style={{ flex: "1" }}>
        <img
          src={`mssf://${image.path}`}
          style={{ width: "100%", objectFit: "cover" }}
        />
      </div>
      <button className="inverse-title-button">hi</button>
    </div>
  );
}

export default ImageControls;
