export const Input = ({
  name,
  label,
  bottom,
  state,
  setState,
}: {
  name: string
  label: string
  bottom: string[]
  state: Record<string, any>
  setState: React.Dispatch<React.SetStateAction<Record<string, any>>>
}) => {
  return (
    <div style={{ marginBottom: 10 }}>
      <label htmlFor={name}>{label}</label>
      <br />
      {bottom.map((num) => (
        <button key={num} type="button" style={{ marginRight: 5 }} onClick={() => setState({ ...state, [name]: num })}>
          {num}
        </button>
      ))}
      <input
        type="text"
        onChange={(e) => {
          setState({ ...state, [name]: e.target.value })
        }}
        value={state[name]}
        name={name}
        id={name}
      />
    </div>
  )
}

