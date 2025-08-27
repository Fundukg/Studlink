import { format } from 'date-fns'
import { Link } from 'react-router-dom'
import { Segment } from '../../components/Segment/index'
import { withPageWrapper } from '../../lib/pageWarpper'
import { getViewDistributionRoute } from '../../lib/routes'
import { trpc } from '../../lib/trpc'
import css from './index.module.scss'

export const ViewDistributionsPage = withPageWrapper({
  useQuery: () => trpc.getDistributions.useQuery(),

  setProps: ({ queryResult }) => ({
    distributions: queryResult.data!,
  }),
})(({ distributions }) => {
  return (
    <Segment title="Рассылки">
      <div className={css.ideas}>
        {distributions.distributions.map((distribution) => (
          <div className={css.idea} key={distribution.id}>
            <Segment
              title={
                <Link
                  className={css.ideaLink}
                  to={getViewDistributionRoute({
                    distributionId: distribution.id,
                  })}
                >
                  {distribution.recipient}
                </Link>
              }
              size={2}
              description={`${distribution.text} ${format(distribution.createdAt, 'HH:mm')}`}
            />
          </div>
        ))}
      </div>
    </Segment>
  )
})
