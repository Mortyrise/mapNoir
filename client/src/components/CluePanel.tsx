import { useEffect, useRef } from 'react'

interface CluePanelProps {
  initialClue: string
  revealedClues: string[]
  t: (key: string) => string
}

export function CluePanel({ initialClue, revealedClues, t }: CluePanelProps) {
  const panelRef = useRef<HTMLDivElement>(null)
  const hasRevealed = revealedClues.length > 0
  const lastIndex = revealedClues.length - 1

  // Auto-scroll to the latest clue
  useEffect(() => {
    if (panelRef.current && hasRevealed) {
      panelRef.current.scrollTop = panelRef.current.scrollHeight
    }
  }, [revealedClues.length, hasRevealed])

  return (
    <div className="clue-panel" ref={panelRef}>
      <div className={`clue-entry ${hasRevealed ? 'clue-older' : 'clue-latest'}`}>
        <span className="clue-tag">{t('clue.intel')}</span>
        <p className="clue-text">{initialClue}</p>
      </div>
      {revealedClues.map((clue, i) => (
        <div key={i} className={`clue-entry ${i === lastIndex ? 'clue-latest' : 'clue-older'}`}>
          <span className="clue-tag">{t('clue.index')} {i + 1}</span>
          <p className="clue-text">{clue}</p>
        </div>
      ))}
    </div>
  )
}
