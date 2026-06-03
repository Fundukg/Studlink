import Cookies from 'js-cookie'
import { useState, useRef } from 'react'
import toast from 'react-hot-toast'
import { env } from '../../lib/env'
import styles from './index.module.scss'

export default function ImportStudentPage() {
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [report, setReport] = useState<any>(null)
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setIsDragging(true)
    } else if (e.type === 'dragleave') {
      setIsDragging(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0])
    }
  }

  const handleUpload = async () => {
    if (!file) {return}

    const formData = new FormData()
    formData.append('file', file)

    const baseUrl = env.VITE_BACKEND_TRPC_URL.replace('/trpc', '')
    const uploadUrl = `${baseUrl}/api/upload`

    // Создаем функцию, которая выполняет запрос и возвращает Promise
    const uploadPromise = async () => {
      const token = Cookies.get('token-studlink')

      const res = await fetch(uploadUrl, {
        method: 'POST',
        body: formData,
        headers: {
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      })

      if (!res.ok) {
        if (res.status === 404) {throw new Error('Маршрут загрузки не найден')}
        const errorData = await res
          .json()
          .catch(() => ({ message: 'Ошибка сервера' }))
        throw new Error(errorData.message || `Ошибка: ${res.statusText}`)
      }

      return await res.json()
    }

    // Применяем toast.promise
    try {
      setLoading(true)
      const data = await toast.promise(uploadPromise(), {
        loading: 'Загрузка файла...',
        success: 'Файл успешно загружен и обработан! ✅',
        error: (err: any) => err.message || 'Ошибка при загрузке файла',
      })

      setReport(data)
    } catch (error) {
      console.error('Upload error:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={styles.importContainer}>
      <h1>Массовый импорт студентов</h1>

      {/* Добавляем памятку для пользователя */}
      <div className={styles.instructionBox}>
        <h3>Формат CSV файла:</h3>
        <p>
          Файл должен содержать заголовки:{' '}
          <code>
            lastName, firstName, middleName, studentCard, groupName, course
          </code>
        </p>
        <small>middleName - опционально</small>
      </div>

      <div
        className={`${styles.dropZone} ${isDragging ? styles.active : ''}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <div className={styles.icon}>📁</div>
        <p>
          {file ? file.name : 'Перетащите CSV файл или нажмите для выбора'}
        </p>
        <span>Только .csv файлы</span>
        <input
          type="file"
          ref={fileInputRef}
          onChange={(e) => setFile(e.target.files?.[0] || null)}
          accept=".csv"
          hidden
        />
      </div>

      {file && (
        <div className={styles.fileInfo}>
          <div>
            <strong>Выбранный файл:</strong> {file.name} (
            {(file.size / 1024).toFixed(2)} KB)
          </div>
          <button
            onClick={handleUpload}
            disabled={loading}
            className={styles.uploadBtn}
          >
            {loading ? 'Загрузка...' : 'Начать импорт'}
          </button>
        </div>
      )}

      {report && (
        <div className={styles.errorTableContainer}>
          <div className={styles.reportSummary}>
            <h3 style={{ color: '#38a169' }}>
              Успешно импортировано: {report.imported}
            </h3>
            {report.failed > 0 && (
              <h3 className={styles.errorHeader}>Ошибок: {report.failed}</h3>
            )}
          </div>

          {report.errors?.length > 0 && (
            <table className={styles.studentsTable}>
              <thead>
                <tr>
                  <th>Строка</th>
                  <th>Описание ошибки</th>
                </tr>
              </thead>
              <tbody>
                {report.errors.map((err: any, i: number) => (
                  <tr key={i}>
                    <td>{err.row}</td>
                    <td style={{ color: '#e53e3e' }}>{err.message}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  )
}
