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

    // Briefing narrative intros (10 variants, randomly selected)
    'briefing.caseIntro.1': 'An anonymous tip came in at 0300 hours. A suspect has been spotted at an unknown location. Study the scene and determine the coordinates.',
    'briefing.caseIntro.2': 'Intelligence intercepted a coded transmission. We traced it to a street-level camera feed. Identify the suspect\'s position.',
    'briefing.caseIntro.3': 'A field agent went dark after sending partial coordinates. Reconstruct their route from the available evidence.',
    'briefing.caseIntro.4': 'A diplomatic pouch was intercepted at a border crossing. The contents lead here. Confirm the location.',
    'briefing.caseIntro.5': 'Satellite imagery flagged unusual activity. Ground-level confirmation needed. Trust the clues, not the scenery.',
    'briefing.caseIntro.6': 'An asset embedded in a smuggling ring sent these coordinates before going silent. Verify the drop point.',
    'briefing.caseIntro.7': 'Surveillance footage was recovered from a damaged hard drive. The timestamp is gone, but the location may still be identifiable.',
    'briefing.caseIntro.8': 'A coded message was found in an abandoned safehouse. It references this camera feed. Determine where it was taken.',
    'briefing.caseIntro.9': 'A defector claims to have passed through this area. Cross-reference the scene with available intelligence.',
    'briefing.caseIntro.10': 'An intercepted phone call mentioned this location. The line went dead seconds later. Pinpoint the coordinates.',
    'briefing.caseIntro.count': '10',

    // Round transition — handler voice (escalating tension)
    'round.transition.1': 'First signal intercepted. Proceeding to the next lead.',
    'round.transition.2': 'The suspect moved. Tracking second position.',
    'round.transition.3': 'Halfway through the case. Stay sharp, detective.',
    'round.transition.4': 'We\'re closing in. One more signal after this.',
    'round.transition.5': 'Last known position. Make it count.',

    // Handler performance comments (shown after each round)
    'handler.accuracy.excellent': 'Impressive precision. The suspect can\'t hide for long.',
    'handler.accuracy.good': 'Solid lead. We\'re on the right track.',
    'handler.accuracy.decent': 'In the vicinity. Could be tighter.',
    'handler.accuracy.poor': 'Loose lead. We need to sharpen up.',
    'handler.accuracy.cold': 'Way off. The trail went cold on this one.',

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
    'summary.conclusion.good': 'Excellent work, detective. The case is closed. I\'ll file this one as a success.',
    'summary.conclusion.mid': 'Decent fieldwork. The suspect slipped, but we have enough to keep the file open.',
    'summary.conclusion.bad': 'The case goes cold. We\'ll need better intel next time, detective.',
    'summary.bestRound': 'Best lead: Round {round} — {distance}km off.',
    'summary.worstRound': 'Weakest signal: Round {round} — {distance}km off.',
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

    // Briefing narrative intros (10 variants)
    'briefing.caseIntro.1': 'Recibimos un aviso anónimo a las 0300. Un sospechoso ha sido avistado en una ubicación desconocida. Estudia la escena y determina las coordenadas.',
    'briefing.caseIntro.2': 'Inteligencia interceptó una transmisión cifrada. La rastreamos hasta una cámara a pie de calle. Identifica la posición del sospechoso.',
    'briefing.caseIntro.3': 'Un agente de campo dejó de responder tras enviar coordenadas parciales. Reconstruye su ruta con la evidencia disponible.',
    'briefing.caseIntro.4': 'Una valija diplomática fue interceptada en un paso fronterizo. El contenido apunta aquí. Confirma la ubicación.',
    'briefing.caseIntro.5': 'Imágenes satelitales detectaron actividad inusual. Se necesita confirmación a nivel de calle. Confía en las pistas, no en el paisaje.',
    'briefing.caseIntro.6': 'Un activo infiltrado en una red de contrabando envió estas coordenadas antes de quedarse en silencio. Verifica el punto de entrega.',
    'briefing.caseIntro.7': 'Material de vigilancia fue recuperado de un disco duro dañado. La marca temporal se perdió, pero la ubicación podría ser identificable.',
    'briefing.caseIntro.8': 'Un mensaje cifrado fue hallado en una casa franca abandonada. Hace referencia a esta cámara. Determina dónde fue tomada.',
    'briefing.caseIntro.9': 'Un desertor asegura haber pasado por esta zona. Cruza la escena con la inteligencia disponible.',
    'briefing.caseIntro.10': 'Una llamada interceptada mencionó esta ubicación. La línea se cortó segundos después. Localiza las coordenadas.',
    'briefing.caseIntro.count': '10',

    // Round transition — handler voice
    'round.transition.1': 'Primera señal interceptada. Procediendo a la siguiente pista.',
    'round.transition.2': 'El sospechoso se movió. Rastreando segunda posición.',
    'round.transition.3': 'Mitad del caso. Mantén la concentración, detective.',
    'round.transition.4': 'Nos acercamos. Una señal más después de esta.',
    'round.transition.5': 'Última posición conocida. Que cuente.',

    // Handler performance comments
    'handler.accuracy.excellent': 'Precisión impresionante. El sospechoso no podrá esconderse mucho más.',
    'handler.accuracy.good': 'Pista sólida. Vamos por buen camino.',
    'handler.accuracy.decent': 'En la zona. Podría ser más preciso.',
    'handler.accuracy.poor': 'Pista floja. Hay que afinar.',
    'handler.accuracy.cold': 'Muy lejos. La pista se enfrió en esta.',

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
    'summary.conclusion.good': 'Excelente trabajo, detective. El caso queda cerrado. Lo archivo como un éxito.',
    'summary.conclusion.mid': 'Buen trabajo de campo. El sospechoso escapó, pero tenemos suficiente para mantener el expediente abierto.',
    'summary.conclusion.bad': 'El caso se enfría. Necesitaremos mejor inteligencia la próxima vez, detective.',
    'summary.bestRound': 'Mejor pista: Ronda {round} — a {distance}km.',
    'summary.worstRound': 'Señal más débil: Ronda {round} — a {distance}km.',
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
