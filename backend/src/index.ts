import express from 'express'

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

const expressApp = express()
expressApp.get('/ping', (req, res) => {
  res.send('pong')
})
expressApp.get('/work_desk', (req, res) => {
  res.send(work_desk)
})
expressApp.listen(3000, () => {
  console.info('Listening at http://localhost:3000')
})
