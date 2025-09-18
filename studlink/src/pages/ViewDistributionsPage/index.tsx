import { useState } from 'react'
import { FiSearch, FiMail, FiClock, FiEye } from 'react-icons/fi'
import { Link } from 'react-router-dom'
import { MailingHeader } from '../../components/MailingHeader'
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
  const [searchTerm, setSearchTerm] = useState('')

  const filteredDistributions = distributions.distributions.filter(
    (dist) =>
      dist.text.toLowerCase().includes(searchTerm.toLowerCase()) ||
      dist.recipient.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className={css.container}>
      <MailingHeader />

      <div className={css.content}>
        <div className={css.listHeader}>
          <h2 className={css.sectionTitle}>Sent Mailings</h2>
          <div className={css.searchContainer}>
            <FiSearch className={css.searchIcon} />
            <input
              type="text"
              placeholder="Search mailings..."
              className={css.searchInput}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className={css.distributionList}>
          {filteredDistributions.map((distribution) => (
            <div key={distribution.id} className={css.distributionItem}>
              <div className={css.distributionIcon}>
                <FiMail className={css.icon} />
              </div>

              <div className={css.distributionContent}>
                <div className={css.distributionHeader}>
                  <div className={css.recipientInfo}>
                    <h3 className={css.distributionSubject}>{distribution.recipient || 'No subject'}</h3>
                    <span className={css.status}>sent</span>
                  </div>
                  <div className={css.distributionTime}>
                    <FiClock style={{ marginRight: '4px' }} />
                    {new Date(distribution.createdAt).toLocaleDateString()}
                  </div>
                </div>

                <div className={css.distributionMessage}>
                  <p>
                    {distribution.text
                      ? distribution.text.substring(0, 120) + (distribution.text.length > 120 ? '...' : '')
                      : 'No content'}
                  </p>
                </div>

                <div className={css.distributionActions}>
                  <Link className={css.viewDetailsButton} to={getViewDistributionRoute({distributionId: distribution.id})}>
                    <FiEye className={css.icon} /> View Details
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
})
