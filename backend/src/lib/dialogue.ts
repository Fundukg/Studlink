import _ from 'lodash'

export const WorkDesk = _.times(100, (i) => ({
  nick: `cool-set-nick-${i}`,
  name: `Content ${i}`,
  description: 'Description...',
  text: _.times(100, (j) => `<p>Text paragraph ${j} of content ${i}</p>`).join(''),
}))

export const Dialogue = _.times(100, (i) => ({
      course: `course-numbrer-${i}`,
      departament: `Content ${i}`,
      directions: `Content ${i}`,
      group: `Content ${i}`,
      message: _.times(100, (j) => `<p>Text paragraph ${j} of content ${i}</p>`).join(''),
}))
