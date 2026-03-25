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
    'difficulty.easy.detail': '10 energy, 60s/round',
    'difficulty.medium': 'Medium',
    'difficulty.medium.detail': '7 energy, 45s/round',
    'difficulty.hard': 'Hard',
    'difficulty.hard.detail': '4 energy, 30s/round',

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

    // Session / Rounds
    'game.round': 'Round',
    'session.case': 'Case',

    // Briefing narrative intros (3 variants, randomly selected)
    'briefing.caseIntro.1': 'An anonymous tip came in at 0300 hours. A suspect has been spotted at an unknown location. Study the scene and determine the coordinates.',
    'briefing.caseIntro.2': 'Intelligence intercepted a coded transmission. We traced it to a street-level camera feed. Identify the suspect\'s position.',
    'briefing.caseIntro.3': 'A field agent went dark after sending partial coordinates. Reconstruct their route from the available evidence.',

    // Round Result (brief, between rounds)
    'roundResult.title': 'Round Complete',
    'roundResult.nextRound': 'Next Round',
    'roundResult.viewSummary': 'View Report',

    // Final Summary
    'summary.title': 'Case Report',
    'summary.round': 'Round',
    'summary.distance': 'Distance',
    'summary.score': 'Score',
    'summary.totalScore': 'Total Score',
    'summary.share': 'Share Result',
    'summary.copied': 'Copied!',
    'summary.playAgain': 'New Case',

    // Sound
    'sound.mute': 'Mute sounds',
    'sound.unmute': 'Unmute sounds',

    // Review
    'review.title': 'Location Review',
    'review.backToGame': 'Back to Game',
    'review.filterCountry': 'Country',
    'review.filterAll': 'All',
    'review.filterStatus': 'Status',
    'review.statusAll': 'All',
    'review.statusReviewed': 'Reviewed',
    'review.statusUnreviewed': 'Unreviewed',
    'review.approve': 'Approve',
    'review.reject': 'Reject',
    'review.delete': 'Delete',
    'review.deleteConfirm': 'Delete this location from the pool?',
    'review.note': 'Note (optional)',
    'review.notePlaceholder': 'e.g. dirty camera, no road visible...',
    'review.stats': 'Stats',
    'review.total': 'Total',
    'review.reviewed': 'Reviewed',
    'review.approved': 'Approved',
    'review.rejected': 'Rejected',
    'review.noLocations': 'No locations match filters',
    'review.of': 'of',
    'review.loading': 'Loading...',
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
    'difficulty.easy.detail': '10 energía, 60s/ronda',
    'difficulty.medium': 'Media',
    'difficulty.medium.detail': '7 energía, 45s/ronda',
    'difficulty.hard': 'Difícil',
    'difficulty.hard.detail': '4 energía, 30s/ronda',

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

    // Session / Rounds
    'game.round': 'Ronda',
    'session.case': 'Caso',

    // Briefing narrative intros
    'briefing.caseIntro.1': 'Recibimos un aviso anónimo a las 0300. Un sospechoso ha sido avistado en una ubicación desconocida. Estudia la escena y determina las coordenadas.',
    'briefing.caseIntro.2': 'Inteligencia interceptó una transmisión cifrada. La rastreamos hasta una cámara a pie de calle. Identifica la posición del sospechoso.',
    'briefing.caseIntro.3': 'Un agente de campo dejó de responder tras enviar coordenadas parciales. Reconstruye su ruta con la evidencia disponible.',

    // Round Result
    'roundResult.title': 'Ronda Completada',
    'roundResult.nextRound': 'Siguiente Ronda',
    'roundResult.viewSummary': 'Ver Informe',

    // Final Summary
    'summary.title': 'Informe del Caso',
    'summary.round': 'Ronda',
    'summary.distance': 'Distancia',
    'summary.score': 'Puntuación',
    'summary.totalScore': 'Puntuación Total',
    'summary.share': 'Compartir Resultado',
    'summary.copied': '¡Copiado!',
    'summary.playAgain': 'Nuevo Caso',

    // Sound
    'sound.mute': 'Silenciar sonidos',
    'sound.unmute': 'Activar sonidos',

    // Review
    'review.title': 'Revisar Ubicaciones',
    'review.backToGame': 'Volver al Juego',
    'review.filterCountry': 'Pais',
    'review.filterAll': 'Todos',
    'review.filterStatus': 'Estado',
    'review.statusAll': 'Todos',
    'review.statusReviewed': 'Revisados',
    'review.statusUnreviewed': 'Sin revisar',
    'review.approve': 'Aprobar',
    'review.reject': 'Rechazar',
    'review.delete': 'Eliminar',
    'review.deleteConfirm': 'Eliminar esta ubicacion del pool?',
    'review.note': 'Nota (opcional)',
    'review.notePlaceholder': 'ej. camara sucia, no se ve nada...',
    'review.stats': 'Estadisticas',
    'review.total': 'Total',
    'review.reviewed': 'Revisadas',
    'review.approved': 'Aprobadas',
    'review.rejected': 'Rechazadas',
    'review.noLocations': 'No hay ubicaciones con estos filtros',
    'review.of': 'de',
    'review.loading': 'Cargando...',
  },
}
