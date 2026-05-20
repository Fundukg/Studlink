import Cookies from 'js-cookie';
import { useState, useRef } from 'react'
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
    if (e.type === 'dragenter' || e.type === 'dragover') {setIsDragging(true)}
    else if (e.type === 'dragleave') {setIsDragging(false)}
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
    if (!file) {return;}
    setLoading(true);

    const formData = new FormData();
    formData.append('file', file);

    // Берем базовый URL из твоего env, заменяя /trpc на /api/upload
    const baseUrl = env.VITE_BACKEND_TRPC_URL.replace('/trpc', '');
    const uploadUrl = `${baseUrl}/api/upload`; 

    try {
      const token = Cookies.get('token-studlink'); // Берем твой куки

      const res = await fetch(uploadUrl, {
        method: 'POST',
        body: formData,
        headers: {
          // Важно: для FormData заголовок Content-Type ставить НЕ НУЖНО, 
          // браузер сам выставит boundary. Только авторизация:
          ...(token && { 'Authorization': `Bearer ${token}` }),
        },
      });

      if (res.status === 404) {
        throw new Error(`Маршрут не найден по адресу: ${uploadUrl}`);
      }

      const data = await res.json();
      setReport(data);
    } catch (error: any) {
      console.error(error);
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.importContainer}>
      <h1>Массовый импорт студентов</h1>

      <div
        className={`${styles.dropZone} ${isDragging ? styles.active : ''}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <div className={styles.icon}>📁</div>
        <p>Перетащите CSV файл сюда или нажмите для выбора</p>
        <span>Поддерживаются только .csv файлы</span>
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
