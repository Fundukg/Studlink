export const App = () => {
  const informatoin = [
    { nick: 'cool-set-nick-1', name: 'Profile', description: 'Description...' },
    {
      nick: 'cool-set-nick-2',
      name: 'Settings',
      description: 'Description...',
    },
    {
      nick: 'cool-set-nick-3',
      name: 'Calender',
      description: 'Description...',
    },
    { nick: 'cool-set-nick-4', name: 'Schedule', description: 'Description...' },
  ]
  return (
    <div>
      <h1>StudLink</h1>
      {informatoin.map((informatoin) => {
        return (
          <div key={informatoin.nick}>
            <h2>{informatoin.name}</h2>
            <p>{informatoin.description}</p>
          </div>
        )
      })}
    </div>
  )
}
