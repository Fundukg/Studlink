import { useParams } from 'react-router-dom'

export const DialoguesPage = () => {
  const { WorkDesk } = useParams() as { WorkDesk: string }
  return (
    <div>
      <h1>{WorkDesk}</h1>
      <div>
        <p>Dialogue 1 ...</p>
        <p>Dialogue 2 ...</p>
        <p>Dialogue 3 ...</p>
      </div>
    </div>
  )
}
