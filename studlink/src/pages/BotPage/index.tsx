import { useState, useMemo } from 'react'
import {
  FiEdit2,
  FiTrash2,
  FiPlus,
  FiSearch,
  FiCpu,
  FiInfo,
  FiMessageSquare,
  FiUsers,
  FiAlertTriangle,
  FiKey,
} from 'react-icons/fi'
import { ActionMenu, type ActionOption } from '../../components/ActionMenu'
import { BotModal } from '../../components/Create-UpdateModal/BotModal' // Нужно будет создать аналогично GroupModal
import { UniversalModal } from '../../components/UniversalModal'
import { withPageWrapper } from '../../lib/pageWarpper'
import { trpc } from '../../lib/trpc'
import css from './index.module.scss'

export const BotPage = withPageWrapper({
  useQuery: () => trpc.getBots.useQuery(),
  setProps: ({ queryResult }) => ({
    data: queryResult.data,
  }),
})(({ data: botsData }) => {
  const utils = trpc.useUtils()

  // Данные
  const [searchQuery, setSearchQuery] = useState('')

  // Состояния модалок
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [selectedBot, setSelectedBot] = useState<any>(null)

  const [botToDelete, setBotToDelete] = useState<any>(null)
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)
  const [viewingBot, setViewingBot] = useState<any>(null)

  // Фильтрация по имени или username бота
  const filteredBots = useMemo(() => {
    if (!botsData) {
      return []
    }
    const query = searchQuery.toLowerCase()
    return botsData.filter(
      (b) =>
        b.name.toLowerCase().includes(query) ||
        b.platform?.toLowerCase().includes(query)
    )
  }, [botsData, searchQuery])

  // Удаление
  const deleteMutation = trpc.deleteBot.useMutation({
    onSuccess: () => {
      utils.getBots.invalidate()
      setBotToDelete(null)
    },
    onError: (err) => alert(err.message),
  })

  // Статистика перед удалением
  const { data: deleteStats } = trpc.getBotDeleteStats.useQuery(
    { id: botToDelete?.id },
    { enabled: !!botToDelete }
  )

  const handleEdit = (bot: any) => {
    setSelectedBot(bot)
    setIsEditModalOpen(true)
  }

  const handleShowDetails = (bot: any) => {
    setViewingBot(bot)
    setIsDetailsOpen(true)
  }

  return (
    <div className={css.container}>
      <div className={css.header}>
        <div className={css.titleBlock}>
          <h1>Телеграм боты</h1>
          <span className={css.countBadge}>{filteredBots.length}</span>
        </div>

        <div className={css.controls}>
          <div className={css.searchWrapper}>
            <FiSearch className={css.searchIcon} />
            <input
              type="text"
              placeholder="Поиск по названию..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={css.searchInput}
            />
          </div>
          <button
            className={css.addBtn}
            onClick={() => {
              setSelectedBot(null)
              setIsEditModalOpen(true)
            }}
          >
            <FiPlus /> Добавить бота
          </button>
        </div>
      </div>

      <div className={css.tableWrapper}>
        <table className={css.table}>
          <thead>
            <tr>
              <th>Бот</th>
              <th>Статистика</th>
              <th>Токен (скрыт)</th>
              <th style={{ textAlign: 'right' }}>Действия</th>
            </tr>
          </thead>
          <tbody>
            {filteredBots.map((bot) => {
              const botActions: ActionOption[] = [
                {
                  label: 'Детали',
                  icon: <FiInfo />,
                  onClick: () => handleShowDetails(bot),
                },
                {
                  label: 'Редактировать',
                  icon: <FiEdit2 />,
                  onClick: () => handleEdit(bot),
                },
                {
                  label: 'Удалить',
                  icon: <FiTrash2 />,
                  onClick: () => setBotToDelete(bot),
                  variant: 'danger',
                },
              ]

              return (
                <tr key={bot.id}>
                  <td
                    className={css.studentName}
                    onClick={() => handleShowDetails(bot)}
                    style={{ cursor: 'pointer' }}
                  >
                    <div className={css.nameWithIcon}>
                      <FiCpu
                        className={css.entryIcon}
                        style={{ color: '#10b981', marginRight: '8px' }}
                      />
                      <div className={css.deptInfo}>
                        <div className={css.primaryText}>{bot.name}</div>
                        {/* <div className={css.secondaryText}>
                          @{bot.username || 'no_username'}
                        </div> */}
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className={css.statsRow}>
                      <span className={css.statBadge}>
                        <FiUsers size={12} /> {bot._count.users}
                      </span>
                      <span className={`${css.statBadge} ${css.blue}`}>
                        <FiMessageSquare size={12} /> {bot._count.messages}
                      </span>
                    </div>
                  </td>
                  <td>
                    <div className={css.tokenCell}>
                      <FiKey size={14} /> <span>••••••••••••</span>
                    </div>
                  </td>
                  <td className={css.actions}>
                    <ActionMenu options={botActions} />
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <BotModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        bot={selectedBot}
      />

      {/* Модалка деталей */}
      <UniversalModal
        isOpen={isDetailsOpen}
        onClose={() => setIsDetailsOpen(false)}
        title="Параметры бота"
      >
        {viewingBot && (
          <div className={css.studentInfoModal}>
            <div className={css.modalHeaderSection}>
              <div className={css.modalAvatar}>
                <FiCpu />
              </div>
              <h3>{viewingBot.name}</h3>
              <div className={css.statusWrapper}>
                {/* Добавляем индикатор активности */}
                <span
                  className={`${css.statusBadge} ${viewingBot.isActive ? css.active : css.inactive}`}
                >
                  {viewingBot.isActive ? 'В сети' : 'Отключен'}
                </span>
                <div className={css.studentIdBadge}>ID: {viewingBot.id}</div>
              </div>
            </div>

            <div className={css.infoGrid}>
              <div className={css.infoItem}>
                <label>Платформа</label>
                <span className={css.platformName}>{viewingBot.platform}</span>
              </div>
              {/* <div className={css.infoItem}>
                <label>Username</label>
                <span className={css.link}>
                  {viewingBot.username ? `@${viewingBot.username}` : '—'}
                </span>
              </div> */}
              <div className={css.infoItem}>
                <label>Дата создания</label>
                <span>
                  {new Date(viewingBot.createdAt).toLocaleString('ru-RU', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </span>
              </div>
              <div className={css.infoItem}>
                <label>Активность</label>
                <span>{viewingBot._count.users} пользователей</span>
              </div>
            </div>

            {/* Секция дополнительных настроек из JSON */}
            {viewingBot.settings &&
              typeof viewingBot.settings === 'object' && (
                <div className={css.settingsSection}>
                  <label className={css.sectionTitle}>
                    Дополнительные настройки
                  </label>
                  <div className={css.settingsGrid}>
                    {Object.entries(
                      viewingBot.settings as Record<string, any>
                    ).map(([key, value]) => (
                      <div key={key} className={css.settingRow}>
                        <span className={css.settingKey}>{key}:</span>
                        <span className={css.settingValue}>
                          {JSON.stringify(value)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            <div className={css.tokenFullBox}>
              <div className={css.tokenHeader}>
                <label>
                  <FiKey /> API Токен
                </label>
                {/* Кнопка копирования (опционально) */}
                <button
                  className={css.copyBtn}
                  onClick={() =>
                    navigator.clipboard.writeText(viewingBot.token)
                  }
                >
                  Копировать
                </button>
              </div>
              <code>{viewingBot.token}</code>
            </div>
          </div>
        )}
      </UniversalModal>

      {/* Модалка удаления */}
      <UniversalModal
        isOpen={!!botToDelete}
        onClose={() => setBotToDelete(null)}
        title="Удаление бота"
        footer={
          <div className={css.modalFooter}>
            <button
              className={css.cancelBtn}
              onClick={() => setBotToDelete(null)}
            >
              Отмена
            </button>
            <button
              className={css.dangerBtn}
              onClick={() => deleteMutation.mutate({ id: botToDelete.id })}
              disabled={deleteMutation.isPending}
            >
              Удалить
            </button>
          </div>
        }
      >
        <div className={css.deleteConfirm}>
          <FiAlertTriangle
            className={css.warningIcon}
            style={{ color: '#ef4444' }}
          />
          <p>
            Вы действительно хотите удалить бота <b>{botToDelete?.name}</b>?
          </p>
          <div
            className={css.statsHint}
            style={{
              background: '#fef2f2',
              borderColor: '#fee2e2',
              color: '#991b1b',
            }}
          >
            Будут безвозвратно удалены:
            <ul>
              <li>Связи с пользователями: {deleteStats?.users || 0}</li>
              <li>Все сообщения бота: {deleteStats?.messages || 0}</li>
            </ul>
          </div>
        </div>
      </UniversalModal>
    </div>
  )
})
