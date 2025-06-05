export const App = () => {
  const work_desk = [
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
      {work_desk.map((work_desk) => {
        return (
          <div key={work_desk.nick}>
            <h2>{work_desk.name}</h2>
            <p>{work_desk.description}</p>
          </div>
        )
      })}
    </div>
  )
}
