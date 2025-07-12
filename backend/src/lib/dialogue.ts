import _ from 'lodash'

export const WorkDesk = _.times(100, (i) => ({
  nick: `cool-set-nick-${i}`,
  name: `Content ${i}`,
  description: 'Description...',
  text: _.times(100, (j) => `<p>Text paragraph ${j} of content ${i}</p>`).join(''),
}))