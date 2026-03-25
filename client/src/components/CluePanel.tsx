interface CluePanelProps {
  initialClue: string
  revealedClues: string[]
  t: (key: string) => string
}

export function CluePanel({ initialClue, revealedClues, t }: CluePanelProps) {
  return (
    <div className="clue-panel">
      <div className="clue-entry clue-initial">
        <span className="clue-tag">{t('clue.intel')}</span>
        <p className="clue-text">{initialClue}</p>
      </div>
      {revealedClues.map((clue, i) => (
        <div key={i} className="clue-entry clue-purchased">
          <span className="clue-tag">{t('clue.index')} {i + 1}</span>
          <p className="clue-text">{clue}</p>
        </div>
      ))}
    </div>
  )
}
