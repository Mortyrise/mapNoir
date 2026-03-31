import { useEffect, useState, useCallback, useRef } from 'react'
import { api } from '../services/api'
import { MapillaryViewer } from './MapillaryViewer'
import type { ReviewLocation, ReviewStats, ReviewVote } from '../types'
import { translations, type Language } from '../i18n/translations'
import './ReviewApp.css'

const MAPILLARY_TOKEN = import.meta.env.MAPILLARY_TOKEN || ''

type Tab = 'locations' | 'stats'

export default function ReviewApp() {
  const [lang] = useState<Language>('es')
  const t = (key: string) => translations[lang][key] || key

  const [locations, setLocations] = useState<ReviewLocation[]>([])
  const [countries, setCountries] = useState<string[]>([])
  const [stats, setStats] = useState<ReviewStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [voting, setVoting] = useState(false)

  const [countryFilter, setCountryFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [selectedIdx, setSelectedIdx] = useState(0)
  const [note, setNote] = useState('')
  const [tab, setTab] = useState<Tab>('locations')

  const selected = locations[selectedIdx] || null

  // Refs to avoid stale closures in keyboard handler
  const selectedRef = useRef(selected)
  const selectedIdxRef = useRef(selectedIdx)
  const locationsLenRef = useRef(locations.length)
  const noteRef = useRef(note)
  const votingRef = useRef(voting)
  selectedRef.current = selected
  selectedIdxRef.current = selectedIdx
  locationsLenRef.current = locations.length
  noteRef.current = note
  votingRef.current = voting

  const loadLocations = useCallback(async () => {
    setLoading(true)
    try {
      const data = await api.getReviewLocations(
        countryFilter || undefined,
        statusFilter !== 'all' ? statusFilter : undefined
      )
      setLocations(data)
      setSelectedIdx(0)
    } catch (e) {
      console.error('Failed to load locations', e)
    }
    setLoading(false)
  }, [countryFilter, statusFilter])

  const loadStats = useCallback(async () => {
    try {
      const data = await api.getReviewStats()
      setStats(data)
    } catch (e) {
      console.error('Failed to load stats', e)
    }
  }, [])

  useEffect(() => {
    api.getReviewCountries().then(setCountries).catch(console.error)
    loadStats()
  }, [loadStats])

  useEffect(() => {
    loadLocations()
  }, [loadLocations])

  // Set note from existing review when selected changes
  useEffect(() => {
    setNote(selected?.review?.note || '')
  }, [selected?.imageId])

  // Update stats locally instead of fetching after every vote
  const updateStatsLocal = useCallback((vote: ReviewVote, prevVote?: ReviewVote) => {
    setStats((prev) => {
      if (!prev) return prev
      const s = { ...prev, countries: prev.countries.map((c) => ({ ...c })) }
      if (!prevVote) {
        s.reviewed++
      } else {
        if (prevVote === 'approve') s.approved--
        else s.rejected--
      }
      if (vote === 'approve') s.approved++
      else s.rejected++
      return s
    })
  }, [])

  const handleVote = useCallback(async (vote: ReviewVote) => {
    const cur = selectedRef.current
    if (!cur || votingRef.current) return
    setVoting(true)
    try {
      const prevVote = cur.review?.vote
      await api.submitReview(cur.imageId, vote, noteRef.current || undefined)
      setLocations((prev) =>
        prev.map((l) =>
          l.imageId === cur.imageId
            ? { ...l, review: { vote, note: noteRef.current || undefined, reviewedAt: new Date().toISOString() } }
            : l
        )
      )
      updateStatsLocal(vote, prevVote)
      // Auto-advance to next
      setSelectedIdx((i) => (i < locationsLenRef.current - 1 ? i + 1 : i))
    } catch (e) {
      console.error('Failed to submit review', e)
    }
    setVoting(false)
  }, [updateStatsLocal])

  const [pendingDelete, setPendingDelete] = useState<string | null>(null)

  const handleDeleteRequest = () => {
    const cur = selectedRef.current
    if (cur) setPendingDelete(cur.imageId)
  }

  const handleDeleteConfirm = async () => {
    const imageId = pendingDelete
    setPendingDelete(null)
    if (!imageId) return
    try {
      await api.deleteLocation(imageId)
      setLocations((prev) => prev.filter((l) => l.imageId !== imageId))
      setSelectedIdx((i) => Math.max(0, i >= locationsLenRef.current - 1 ? i - 1 : i))
      loadStats()
    } catch (e) {
      console.error('Failed to delete location', e)
    }
  }

  // Keyboard shortcuts (stable handler via refs)
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLTextAreaElement) return
      if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        e.preventDefault()
        setSelectedIdx((i) => Math.max(0, i - 1))
      } else if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        e.preventDefault()
        setSelectedIdx((i) => Math.min(locationsLenRef.current - 1, i + 1))
      } else if (e.key === 'a') {
        handleVote('approve')
      } else if (e.key === 'r') {
        handleVote('reject')
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [handleVote])

  return (
    <div className="review-app">
      <header className="review-header">
        <h1>{t('review.title')}</h1>
        <a href="/">{t('review.backToGame')}</a>
      </header>

      <div className="review-toolbar">
        <label>
          {t('review.filterCountry')}
          <select value={countryFilter} onChange={(e) => setCountryFilter(e.target.value)}>
            <option value="">{t('review.filterAll')}</option>
            {countries.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </label>

        <label>
          {t('review.filterStatus')}
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="all">{t('review.statusAll')}</option>
            <option value="reviewed">{t('review.statusReviewed')}</option>
            <option value="unreviewed">{t('review.statusUnreviewed')}</option>
          </select>
        </label>

        {stats && (
          <div className="review-stats-bar">
            <span>{t('review.total')}: {stats.total}</span>
            <span>{t('review.reviewed')}: {stats.reviewed}</span>
            <span style={{ color: '#22c55e' }}>{t('review.approved')}: {stats.approved}</span>
            <span style={{ color: '#ef4444' }}>{t('review.rejected')}: {stats.rejected}</span>
          </div>
        )}
      </div>

      <div className="review-main">
        <div className="review-viewer">
          {loading ? (
            <div className="review-loading">{t('review.loading')}</div>
          ) : selected ? (
            <MapillaryViewer
              imageId={selected.imageId}
              accessToken={MAPILLARY_TOKEN}
              interactive={true}
              t={t}
            />
          ) : (
            <div className="review-empty">{t('review.noLocations')}</div>
          )}
        </div>

        <div className="review-sidebar">
          <div className="review-tab-buttons">
            <button className={tab === 'locations' ? 'active' : ''} onClick={() => setTab('locations')}>
              Locations
            </button>
            <button className={tab === 'stats' ? 'active' : ''} onClick={() => setTab('stats')}>
              {t('review.stats')}
            </button>
          </div>

          {tab === 'locations' ? (
            <>
              {selected && (
                <>
                  <div className="review-info">
                    <h3>{selected.countryCode} — {selected.imageId}</h3>
                    <p>{selected.lat.toFixed(4)}, {selected.lng.toFixed(4)}</p>
                  </div>

                  <div className="review-actions">
                    <textarea
                      placeholder={t('review.notePlaceholder')}
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                    />
                    <div className="review-vote-buttons">
                      <button
                        className={`review-btn-approve ${selected.review?.vote === 'approve' ? 'active' : ''}`}
                        onClick={() => handleVote('approve')}
                      >
                        {t('review.approve')} (A)
                      </button>
                      <button
                        className={`review-btn-reject ${selected.review?.vote === 'reject' ? 'active' : ''}`}
                        onClick={() => handleVote('reject')}
                      >
                        {t('review.reject')} (R)
                      </button>
                      <button className="review-btn-delete" onClick={handleDeleteRequest} title={t('review.delete')}>
                        X
                      </button>
                    </div>
                    {pendingDelete === selected.imageId && (
                      <div className="review-delete-confirm">
                        <span>{t('review.deleteConfirm')}</span>
                        <button className="review-btn-reject" onClick={handleDeleteConfirm}>
                          {t('review.delete')}
                        </button>
                        <button onClick={() => setPendingDelete(null)}>Cancel</button>
                      </div>
                    )}
                  </div>
                </>
              )}

              <div className="review-nav">
                <button disabled={selectedIdx === 0} onClick={() => setSelectedIdx(selectedIdx - 1)}>
                  &larr;
                </button>
                <span>{locations.length > 0 ? `${selectedIdx + 1} ${t('review.of')} ${locations.length}` : '—'}</span>
                <button disabled={selectedIdx >= locations.length - 1} onClick={() => setSelectedIdx(selectedIdx + 1)}>
                  &rarr;
                </button>
              </div>

              <div className="review-list">
                {locations.map((loc, i) => (
                  <div
                    key={loc.imageId}
                    className={`review-card ${i === selectedIdx ? 'selected' : ''}`}
                    onClick={() => setSelectedIdx(i)}
                  >
                    <span className="review-card-country">{loc.countryCode}</span>
                    <span className="review-card-id">{loc.imageId}</span>
                    {loc.review && (
                      <span className={`review-badge ${loc.review.vote}`}>
                        {loc.review.vote === 'approve' ? 'OK' : 'BAD'}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="review-stats-panel">
              {stats && (
                <table className="review-stats-table">
                  <thead>
                    <tr>
                      <th>{t('review.filterCountry')}</th>
                      <th>{t('review.total')}</th>
                      <th>{t('review.approved')}</th>
                      <th>{t('review.rejected')}</th>
                      <th>Pending</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.countries.map((c) => (
                      <tr
                        key={c.countryCode}
                        style={{ cursor: 'pointer' }}
                        onClick={() => {
                          setCountryFilter(c.countryCode)
                          setTab('locations')
                        }}
                      >
                        <td><strong>{c.countryCode}</strong></td>
                        <td>{c.total}</td>
                        <td style={{ color: '#22c55e' }}>{c.approved}</td>
                        <td style={{ color: '#ef4444' }}>{c.rejected}</td>
                        <td>{c.total - c.reviewed}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
