export type Language = 'en' | 'es'

export const translations: Record<Language, Record<string, string>> = {
  en: {
    // Header
    'app.title': 'Map Noir',
    'app.subtitle': 'Last Known Location',

    // Idle / Splash home
    'idle.title': 'Where did they go last?',
    'idle.description':
      'An informant. Five memory fragments. A whole map to decide on.',
    'idle.difficulty': 'Difficulty',
    'idle.newCase': 'Open case',
    'idle.loading': 'Opening case…',
    'idle.kicker': 'New investigation',
    'idle.active': 'Active',

    // Difficulty — narrative labels
    'difficulty.easy': 'Stakeout',
    'difficulty.easy.detail': '5 rounds · wide radius · 3 clues',
    'difficulty.medium': 'Investigation',
    'difficulty.medium.detail': '5 rounds · mid radius · 2 clues',
    'difficulty.hard': 'Cold case',
    'difficulty.hard.detail': '5 rounds · tight radius · 1 clue',

    // Briefing
    'briefing.title': 'Case Briefing',
    'briefing.subtitle': 'Read the intel carefully before starting your investigation.',
    'briefing.start': 'Begin round',
    'briefing.difficulty': 'Difficulty',
    'briefing.timeLimit': 'Duration',
    'briefing.energy': 'Energy',
    'briefing.clues': 'Clues',
    'briefing.seconds': 's',
    'briefing.dossier': 'Dossier',
    'briefing.gutter': 'Briefing',
    'briefing.classified': 'Classified',
    'briefing.source': 'Anonymous source',

    // Game (HUD)
    'game.confirmLocation': 'Confirm location',
    'game.submitting': 'Submitting…',
    'hud.remaining': 'Remaining',
    'hud.mapPrompt': 'Mark where you think they were',
    'hud.actionsAvailable': 'Available actions',
    'hud.hoverActions': 'Hover · Actions',

    // HUD actions
    'action.clue.label': 'Request clue',
    'action.clue.cost': '−1 ENE · −15% PTS',
    'action.clue.desc': 'The contact whispers one more detail.',
    'action.move.label': 'Move scene',
    'action.move.cost': '−1 ENE',
    'action.move.desc': 'Step forward in the street to see more.',
    'action.bet.label': 'Bet ×2',
    'action.bet.cost': '−2 ENE · high risk',
    'action.bet.desc': 'Doubles points. Missing will sting.',

    // Legacy resource keys (kept for any other callers)
    'resource.energy': 'Energy',
    'resource.move': 'Move',
    'resource.moving': 'Moving',
    'resource.clue': 'Clue',
    'resource.bet': 'Bet',
    'resource.betOn': 'Bet on',

    // Clue panel
    'clue.intel': 'Intel',
    'clue.index': 'Clue',
    'clue.revealed': 'Clues revealed:',

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
    'scene.loading': 'Loading scene…',

    // Theme
    'theme.light': 'Switch to paper mode',
    'theme.dark': 'Switch to noir mode',

    // Session / Rounds
    'game.round': 'Round',
    'session.case': 'Case',

    // Briefing narrative intros (10 variants)
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

    // Round transitions
    'round.transition.1': 'First signal intercepted. Proceeding to the next lead.',
    'round.transition.2': 'The suspect moved. Tracking second position.',
    'round.transition.3': 'Halfway through the case. Stay sharp, detective.',
    'round.transition.4': 'We\'re closing in. One more signal after this.',
    'round.transition.5': 'Last known position. Make it count.',

    // Handler performance comments
    'handler.accuracy.excellent': 'Impressive precision. The suspect can\'t hide for long.',
    'handler.accuracy.good': 'Solid lead. We\'re on the right track.',
    'handler.accuracy.decent': 'In the vicinity. Could be tighter.',
    'handler.accuracy.poor': 'Loose lead. We need to sharpen up.',
    'handler.accuracy.cold': 'Way off. The trail went cold on this one.',

    // Round Result (intermediate)
    'roundResult.title': 'Round Complete',
    'roundResult.nextRound': 'Next round',
    'roundResult.viewSummary': 'View report',
    'roundResult.report': 'Round report',
    'roundResult.hit': 'Hit',
    'roundResult.miss': 'Miss',
    'roundResult.trajectory': 'Guess → actual',

    // Final Summary
    'summary.title': 'Case Report',
    'summary.round': 'Round',
    'summary.distance': 'Distance',
    'summary.score': 'Pts',
    'summary.totalScore': 'Total points',
    'summary.accuracy': 'Avg. accuracy',
    'summary.verdictHead': 'Verdict · case closed',
    'summary.verdictGutter': 'Verdict',
    'summary.ledger': 'Ledger',
    'summary.hits': 'Hits',
    'summary.conclusion.good': 'Four out of five solved. The contact lied once, but you read the rest clean.',
    'summary.conclusion.mid': 'A mixed report. Some leads held, others slipped through.',
    'summary.conclusion.bad': 'The case goes cold. The suspect stays a ghost for now.',
    'summary.verdict.good': 'Outstanding detective.',
    'summary.verdict.mid': 'Respectable detective.',
    'summary.verdict.bad': 'Tired detective.',
    'summary.bestRound': 'Best · R{round} · {distance} km',
    'summary.worstRound': 'Worst · R{round} · {distance} km',
    'summary.share': 'Share',
    'summary.copied': 'Copied!',
    'summary.playAgain': 'New case',

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
    'review.notePlaceholder': 'e.g. dirty camera, no road visible…',
    'review.stats': 'Stats',
    'review.total': 'Total',
    'review.reviewed': 'Reviewed',
    'review.approved': 'Approved',
    'review.rejected': 'Rejected',
    'review.noLocations': 'No locations match filters',
    'review.of': 'of',
    'review.loading': 'Loading…',
  },
  es: {
    // Header
    'app.title': 'Map Noir',
    'app.subtitle': 'Última Ubicación Conocida',

    // Idle / Splash home
    'idle.title': '¿Dónde estuvo por última vez?',
    'idle.description':
      'Un informante. Cinco fragmentos de memoria. Un mapa entero donde decidir.',
    'idle.difficulty': 'Dificultad',
    'idle.newCase': 'Abrir expediente',
    'idle.loading': 'Abriendo caso…',
    'idle.kicker': 'Nueva investigación',
    'idle.active': 'Activo',

    // Difficulty
    'difficulty.easy': 'Vigilancia',
    'difficulty.easy.detail': '5 rondas · radio amplio · 3 pistas',
    'difficulty.medium': 'Investigación',
    'difficulty.medium.detail': '5 rondas · radio medio · 2 pistas',
    'difficulty.hard': 'Caso frío',
    'difficulty.hard.detail': '5 rondas · radio estrecho · 1 pista',

    // Briefing
    'briefing.title': 'Informe del Caso',
    'briefing.subtitle': 'Lee la información con calma antes de iniciar la investigación.',
    'briefing.start': 'Empezar ronda',
    'briefing.difficulty': 'Dificultad',
    'briefing.timeLimit': 'Duración',
    'briefing.energy': 'Energía',
    'briefing.clues': 'Pistas',
    'briefing.seconds': 's',
    'briefing.dossier': 'Dossier',
    'briefing.gutter': 'Briefing',
    'briefing.classified': 'Clasificado',
    'briefing.source': 'Fuente anónima',

    // Game (HUD)
    'game.confirmLocation': 'Confirmar ubicación',
    'game.submitting': 'Enviando…',
    'hud.remaining': 'Restante',
    'hud.mapPrompt': 'Marca dónde crees que estuvo',
    'hud.actionsAvailable': 'Acciones disponibles',
    'hud.hoverActions': 'Hover · acciones',

    // HUD actions
    'action.clue.label': 'Pedir pista',
    'action.clue.cost': '−1 ENE · −15% PTS',
    'action.clue.desc': 'El contacto susurra un detalle más.',
    'action.move.label': 'Mover escena',
    'action.move.cost': '−1 ENE',
    'action.move.desc': 'Avanza en la calle para ver más.',
    'action.bet.label': 'Apostar ×2',
    'action.bet.cost': '−2 ENE · alto riesgo',
    'action.bet.desc': 'Duplica puntos. El fallo duele.',

    // Legacy resource keys (kept for any other callers)
    'resource.energy': 'Energía',
    'resource.move': 'Mover',
    'resource.moving': 'Moviendo',
    'resource.clue': 'Pista',
    'resource.bet': 'Apuesta',
    'resource.betOn': 'Apostado',

    // Clue panel
    'clue.intel': 'Intel',
    'clue.index': 'Pista',
    'clue.revealed': 'Pistas reveladas:',

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
    'scene.loading': 'Cargando escena…',

    // Theme
    'theme.light': 'Cambiar a modo papel',
    'theme.dark': 'Cambiar a modo noir',

    // Session / Rounds
    'game.round': 'Ronda',
    'session.case': 'Caso',

    // Briefing narrative intros
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

    // Round transitions
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

    // Round Result (intermediate)
    'roundResult.title': 'Ronda Completada',
    'roundResult.nextRound': 'Siguiente ronda',
    'roundResult.viewSummary': 'Ver informe',
    'roundResult.report': 'Informe de ronda',
    'roundResult.hit': 'Acierto',
    'roundResult.miss': 'Fallo',
    'roundResult.trajectory': 'Marca → real',

    // Final Summary
    'summary.title': 'Informe del Caso',
    'summary.round': 'Ronda',
    'summary.distance': 'Distancia',
    'summary.score': 'Pts',
    'summary.totalScore': 'Puntos totales',
    'summary.accuracy': 'Precisión media',
    'summary.verdictHead': 'Veredicto · caso cerrado',
    'summary.verdictGutter': 'Veredicto',
    'summary.ledger': 'Libro de cuentas',
    'summary.hits': 'Aciertos',
    'summary.conclusion.good': 'Cuatro de cinco resueltas. El contacto te engañó con un detalle falso, pero el resto lo leíste bien.',
    'summary.conclusion.mid': 'Informe mixto. Algunas pistas aguantaron, otras se escaparon.',
    'summary.conclusion.bad': 'El caso se enfría. El sospechoso sigue siendo un fantasma.',
    'summary.verdict.good': 'Detective sobresaliente.',
    'summary.verdict.mid': 'Detective respetable.',
    'summary.verdict.bad': 'Detective cansado.',
    'summary.bestRound': 'Mejor · R{round} · {distance} km',
    'summary.worstRound': 'Peor · R{round} · {distance} km',
    'summary.share': 'Compartir',
    'summary.copied': '¡Copiado!',
    'summary.playAgain': 'Nuevo caso',

    // Sound
    'sound.mute': 'Silenciar sonidos',
    'sound.unmute': 'Activar sonidos',

    // Review
    'review.title': 'Revisar Ubicaciones',
    'review.backToGame': 'Volver al Juego',
    'review.filterCountry': 'País',
    'review.filterAll': 'Todos',
    'review.filterStatus': 'Estado',
    'review.statusAll': 'Todos',
    'review.statusReviewed': 'Revisados',
    'review.statusUnreviewed': 'Sin revisar',
    'review.approve': 'Aprobar',
    'review.reject': 'Rechazar',
    'review.delete': 'Eliminar',
    'review.deleteConfirm': '¿Eliminar esta ubicación del pool?',
    'review.note': 'Nota (opcional)',
    'review.notePlaceholder': 'ej. cámara sucia, no se ve nada…',
    'review.stats': 'Estadísticas',
    'review.total': 'Total',
    'review.reviewed': 'Revisadas',
    'review.approved': 'Aprobadas',
    'review.rejected': 'Rechazadas',
    'review.noLocations': 'No hay ubicaciones con estos filtros',
    'review.of': 'de',
    'review.loading': 'Cargando…',
  },
}
