import { useState } from 'react'
import {
  FiSearch,
  FiMail,
  FiClock,
  FiEye,
  FiUser,
  FiBarChart2,
  FiSend,
} from 'react-icons/fi'
import { MailingHeader } from '../../components/MailingHeader'
import { UniversalModal } from '../../components/UniversalModal'
import { withPageWrapper } from '../../lib/pageWarpper'
import { trpc } from '../../lib/trpc'
import css from './index.module.scss'

export const ViewDistributionsPage = withPageWrapper({
  useQuery: () => trpc.getDistributions.useQuery(),
  setProps: ({ queryResult }) => ({
    initialDistributions: queryResult.data?.distributions || [],
  }),
})(({ initialDistributions }) => {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedId, setSelectedId] = useState<string | null>(null)

  // Запрос деталей конкретной рассылки (включается только когда выбран ID)
  const { data: details, isLoading: isDetailsLoading } =
    trpc.getDistribution.useQuery(
      { distributionId: selectedId as string },
      { enabled: !!selectedId }
    )

  const filteredDistributions = initialDistributions.filter(
    (dist) =>
      dist.text?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      dist.targetType?.toLowerCase().includes(searchTerm.toLowerCase())
  )
  const targetTypeLabels: Record<string, string> = {
  ALL: 'Все пользователи',
  STUDENT: 'Студенты',
  GROUP: 'Группы',
  DEPARTMENT: 'Кафедры',
  FACULTY: 'Факультеты',
  COURSE: 'Курсы',
};

const platformLabels: Record<string, string> = {
  ALL: 'Все платформы',
  TELEGRAM: 'Telegram',
  VK: 'ВКонтакте',
  OK: 'Одноклассники',
};
  return (
    <div className={css.container}>
      <MailingHeader />

      <div className={css.content}>
        <div className={css.listHeader}>
          <h2 className={css.sectionTitle}>История рассылок</h2>
          <div className={css.searchContainer}>
            <FiSearch className={css.searchIcon} />
            <input
              type="text"
              placeholder="Поиск по тексту..."
              className={css.searchInput}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className={css.distributionList}>
          {filteredDistributions.map((dist) => (
            <div key={dist.id} className={css.distributionItem}>
              <div className={css.itemMain}>
                <div className={css.iconBox}>
                  <FiMail />
                </div>
                <div className={css.itemInfo}>
                  <div className={css.meta}>
                    <span className={css.badge}>{targetTypeLabels[dist.targetType] || dist.targetType}</span>
                    <span className={css.platformBadge}>{platformLabels[dist.platform] || dist.platform}</span>
                    <span className={css.date}>
                      <FiClock />{' '}
                      {new Date(dist.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className={css.textPreview}>{dist.text}</p>
                </div>
              </div>

              <div className={css.itemStats}>
                <span className={css.count}>
                  <FiSend /> {dist.successCount || 0}
                </span>
                <button
                  className={css.detailsBtn}
                  onClick={() => setSelectedId(dist.id)}
                >
                  <FiEye /> Детали
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Модалка с деталями */}
      <UniversalModal
        isOpen={!!selectedId}
        onClose={() => setSelectedId(null)}
        title="Детальная информация о рассылке"
        maxWidth={700}
        footer={
          <button
            className={css.modalCloseBtn}
            onClick={() => setSelectedId(null)}
          >
            Закрыть
          </button>
        }
      >
        {isDetailsLoading ? (
          <div className={css.loader}>
            <div className={css.spinner} />
            <p>Загрузка данных...</p>
          </div>
        ) : (
          details && (
            <div className={css.modalBody}>
              {/* Верхняя карточка с мета-данными */}
              <div className={css.gridInfo}>
                <div className={css.infoCard}>
                  <label>
                    <FiUser /> Отправитель
                  </label>
                  <div className={css.valGroup}>
                    <span className={css.mainVal}>
                      {details.sender.name}
                    </span>
                    <span className={css.subVal}>@{details.sender.nick}</span>
                  </div>
                </div>

                <div className={css.infoCard}>
                  <label>
                    <FiBarChart2 /> Статистика
                  </label>
                  <div className={css.valGroup}>
                    <span className={css.mainVal}>
                      {details.stats.totalSent}
                    </span>
                    <span className={css.subVal}>сообщений доставлено</span>
                  </div>
                </div>
              </div>

              {/* Секция таргетинга (Кому отправлено) */}
              <div className={css.detailSection}>
                <label>
                  Целевая аудитория (
                  {targetTypeLabels[details.targetType] || details.targetType}
                  ):
                </label>
                <div className={css.targetTags}>
                  {details.targets.length > 0 ? (
                    details.targets.map((target) => (
                      <span key={target.id} className={css.targetBadge}>
                        {target.name}
                      </span>
                    ))
                  ) : (
                    <span className={css.targetBadge}>Все пользователи</span>
                  )}
                </div>
              </div>

              {/* Секция платформы и даты */}
              <div className={css.metaRow}>
                <div className={css.metaItem}>
                  <label>Платформа:</label>
                  <span
                    className={css.platformTag}
                    data-platform={details.platform}
                  >
                    {platformLabels[details.platform] || details.platform}
                  </span>
                </div>
                <div className={css.metaItem}>
                  <label>Дата создания:</label>
                  <span>{new Date(details.createdAt).toLocaleString()}</span>
                </div>
              </div>

              {/* Текст сообщения */}
              <div className={css.detailSection}>
                <label>Текст сообщения:</label>
                <div className={css.fullText}>{details.text}</div>
              </div>
            </div>
          )
        )}
      </UniversalModal>
    </div>
  )
})
