import { readFileSync } from 'fs'
import path from 'path'
import type { CountryClues, ClueType, Difficulty, GeneratedClues, Language } from '../types'

const DATA_DIR = path.join(__dirname, '..', 'data')

// Clue type selection weights by difficulty
const INITIAL_CLUE_TYPES: Record<Difficulty, ClueType[]> = {
  easy: ['auditory', 'geopolitical'],          // Strong, direct clues
  medium: ['contextual', 'geopolitical'],       // Mix
  hard: ['narrative', 'negative'],              // Ambiguous clues
}

const PURCHASABLE_CLUE_ORDER: Record<Difficulty, ClueType[]> = {
  easy: ['contextual', 'narrative', 'negative'],
  medium: ['auditory', 'narrative', 'negative'],
  hard: ['contextual', 'geopolitical', 'auditory'],
}

export class ClueGenerator {
  private cache = new Map<Language, Record<string, CountryClues>>()

  private loadClues(lang: Language): Record<string, CountryClues> {
    const cached = this.cache.get(lang)
    if (cached) return cached

    const filePath = path.join(DATA_DIR, `clues-${lang}.json`)
    try {
      const raw = readFileSync(filePath, 'utf-8')
      const data = JSON.parse(raw) as Record<string, CountryClues>
      this.cache.set(lang, data)
      console.log(`[clues] Loaded clues-${lang}.json (${Object.keys(data).length} countries)`)
      return data
    } catch {
      console.error(`[clues] Failed to load clues-${lang}.json, falling back to en`)
      if (lang !== 'en') return this.loadClues('en')
      return {}
    }
  }

  private pickRandom<T>(arr: T[]): T {
    return arr[Math.floor(Math.random() * arr.length)]
  }

  private pickFromType(countryClues: CountryClues, type: ClueType, exclude: Set<string>): string | null {
    const candidates = countryClues[type].filter(c => !exclude.has(c))
    if (candidates.length === 0) return null
    return this.pickRandom(candidates)
  }

  generateCluesForLocation(countryCode: string, difficulty: Difficulty, lang: Language = 'en'): GeneratedClues {
    const db = this.loadClues(lang)
    const countryClues = db[countryCode]

    const fallback = lang === 'es'
      ? {
          initial: 'La pista se ha enfriado. No hay inteligencia disponible para esta región.',
          purchasable: [
            'Nuestros contactos no tienen información sobre esta zona.',
            'Los agentes de campo no reportan nada útil.',
            'El sospechoso parece haber elegido una ubicación fuera de nuestro radar.',
          ],
        }
      : {
          initial: 'The trail has gone cold. No additional intelligence is available for this region.',
          purchasable: [
            'Our contacts have no information about this area.',
            'Field agents report nothing useful.',
            'The suspect seems to have chosen a location off our radar.',
          ],
        }

    if (!countryClues) return fallback

    const used = new Set<string>()

    // Pick initial clue based on difficulty
    const initialTypes = INITIAL_CLUE_TYPES[difficulty]
    let initial: string | null = null
    for (const type of initialTypes) {
      initial = this.pickFromType(countryClues, type, used)
      if (initial) break
    }
    if (!initial) {
      for (const type of Object.keys(countryClues) as ClueType[]) {
        initial = this.pickFromType(countryClues, type, used)
        if (initial) break
      }
    }
    initial = initial || fallback.initial
    used.add(initial)

    // Pick purchasable clues (3 clues, one per type in order)
    const purchasable: string[] = []
    const purchasableTypes = PURCHASABLE_CLUE_ORDER[difficulty]
    for (const type of purchasableTypes) {
      const clue = this.pickFromType(countryClues, type, used)
      if (clue) {
        purchasable.push(clue)
        used.add(clue)
      }
    }

    // Fill from remaining types if needed
    if (purchasable.length < 3) {
      const allTypes: ClueType[] = ['auditory', 'contextual', 'geopolitical', 'narrative', 'negative']
      for (const type of allTypes) {
        if (purchasable.length >= 3) break
        const clue = this.pickFromType(countryClues, type, used)
        if (clue) {
          purchasable.push(clue)
          used.add(clue)
        }
      }
    }

    return { initial, purchasable }
  }
}
