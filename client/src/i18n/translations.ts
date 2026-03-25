export type Language = 'en' | 'es'

export const translations: Record<Language, Record<string, string>> = {
  en: {
    // Header
    'app.title': 'Map Noir',
    'app.subtitle': 'Last Known Location',

    // Idle screen
    'idle.title': 'Last Known Location',
    'idle.description': 'A suspect has been spotted. Analyze the scene, gather intelligence, and mark their last known position on the map.',
    'idle.difficulty': 'Difficulty',
    'idle.newCase': 'New Case',
    'idle.loading': 'Opening case...',

    // Difficulty
    'difficulty.easy': 'Easy',
    'difficulty.easy.detail': '4 energy, 60s',
    'difficulty.medium': 'Medium',
    'difficulty.medium.detail': '3 energy, 45s',
    'difficulty.hard': 'Hard',
    'difficulty.hard.detail': '2 energy, 30s',

    // Briefing
    'briefing.title': 'Case Briefing',
    'briefing.subtitle': 'Read the intel carefully before starting your investigation.',
    'briefing.start': 'Start Investigation',
    'briefing.difficulty': 'Difficulty',
    'briefing.timeLimit': 'Time Limit',
    'briefing.energy': 'Energy',
    'briefing.seconds': 's',

    // Game
    'game.confirmLocation': 'Confirm Location',
    'game.submitting': 'Submitting...',

    // Resources
    'resource.energy': 'Energy',
    'resource.move': 'Move',
    'resource.moving': 'Moving',
    'resource.clue': 'Clue',
    'resource.bet': 'Bet',
    'resource.betOn': 'Bet On',
    'resource.move.title': 'Unlock scene movement',
    'resource.move.done': 'Movement already unlocked',
    'resource.clue.title': 'Request additional clue (-15% score)',
    'resource.clue.none': 'No more clues',
    'resource.bet.title': 'Double your score (or nothing)',
    'resource.bet.done': 'Bet already placed',

    // Clue panel
    'clue.intel': 'Intel',
    'clue.index': 'Clue',

    // Result
    'result.title': 'Case Report',
    'result.score': 'Score',
    'result.distance': 'Distance',
    'result.baseScore': 'Base Score',
    'result.cluePenalty': 'Clue Penalty',
    'result.timeBonus': 'Time Bonus',
    'result.betMultiplier': 'Bet Multiplier',
    'result.newCase': 'New Case',

    // Errors
    'error.dismiss': 'Dismiss',
    'error.noScene': 'Could not find a scene. Try again!',

    // Scene viewer
    'scene.noProvider': 'No scene provider configured',
    'scene.hint': 'Set SCENE_PROVIDER in .env',
    'scene.noImagery': 'No street-level imagery available',
    'scene.hintToken': 'Set MAPILLARY_TOKEN in server .env',
    'scene.loading': 'Loading scene...',

    // Theme
    'theme.light': 'Switch to light mode',
    'theme.dark': 'Switch to dark mode',
  },
  es: {
    // Header
    'app.title': 'Map Noir',
    'app.subtitle': 'Última Ubicación Conocida',

    // Idle screen
    'idle.title': 'Última Ubicación Conocida',
    'idle.description': 'Se ha avistado a un sospechoso. Analiza la escena, recopila inteligencia y marca su última posición conocida en el mapa.',
    'idle.difficulty': 'Dificultad',
    'idle.newCase': 'Nuevo Caso',
    'idle.loading': 'Abriendo caso...',

    // Difficulty
    'difficulty.easy': 'Fácil',
    'difficulty.easy.detail': '4 energía, 60s',
    'difficulty.medium': 'Media',
    'difficulty.medium.detail': '3 energía, 45s',
    'difficulty.hard': 'Difícil',
    'difficulty.hard.detail': '2 energía, 30s',

    // Briefing
    'briefing.title': 'Informe del Caso',
    'briefing.subtitle': 'Lee la información con calma antes de iniciar la investigación.',
    'briefing.start': 'Iniciar Investigación',
    'briefing.difficulty': 'Dificultad',
    'briefing.timeLimit': 'Tiempo Límite',
    'briefing.energy': 'Energía',
    'briefing.seconds': 's',

    // Game
    'game.confirmLocation': 'Confirmar Ubicación',
    'game.submitting': 'Enviando...',

    // Resources
    'resource.energy': 'Energía',
    'resource.move': 'Mover',
    'resource.moving': 'Moviendo',
    'resource.clue': 'Pista',
    'resource.bet': 'Apuesta',
    'resource.betOn': 'Apostado',
    'resource.move.title': 'Desbloquear movimiento en la escena',
    'resource.move.done': 'Movimiento ya desbloqueado',
    'resource.clue.title': 'Solicitar pista adicional (-15% puntuación)',
    'resource.clue.none': 'No hay más pistas',
    'resource.bet.title': 'Duplica tu puntuación (o nada)',
    'resource.bet.done': 'Apuesta ya realizada',

    // Clue panel
    'clue.intel': 'Intel',
    'clue.index': 'Pista',

    // Result
    'result.title': 'Informe del Caso',
    'result.score': 'Puntuación',
    'result.distance': 'Distancia',
    'result.baseScore': 'Puntuación Base',
    'result.cluePenalty': 'Penalización Pistas',
    'result.timeBonus': 'Bonus Tiempo',
    'result.betMultiplier': 'Multiplicador Apuesta',
    'result.newCase': 'Nuevo Caso',

    // Errors
    'error.dismiss': 'Cerrar',
    'error.noScene': 'No se encontró escena. ¡Inténtalo de nuevo!',

    // Scene viewer
    'scene.noProvider': 'Proveedor de escenas no configurado',
    'scene.hint': 'Configura SCENE_PROVIDER en .env',
    'scene.noImagery': 'Imágenes a nivel de calle no disponibles',
    'scene.hintToken': 'Configura MAPILLARY_TOKEN en .env del servidor',
    'scene.loading': 'Cargando escena...',

    // Theme
    'theme.light': 'Cambiar a modo claro',
    'theme.dark': 'Cambiar a modo oscuro',
  },
}
