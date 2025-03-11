function TextInput({ label }: { label: string }) {
  return (
    <div>
      <label className="form-label-1">{label}</label>
      <input type="text" className="text-input form-input-1"></input>
    </div>
  )
}

export default TextInput;
