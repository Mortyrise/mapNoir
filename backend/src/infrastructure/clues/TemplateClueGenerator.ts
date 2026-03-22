import { Country } from '../../domain/geography';
import { Clue, ClueGenerator } from '../../domain/round';

const T: Record<string, string[]> = {
  // -- Auditory (by language code) --
  auditory_fr: ['Se escuchaba frances en el ambiente.', 'Una conversacion en frances. Inconfundible.', 'Alguien pedia algo en frances.'],
  auditory_es: ['La gente hablaba espanol a su alrededor.', 'Castellano. Con acento local.'],
  auditory_pt: ['El portugues resonaba en cada esquina.', 'Se escuchaba el cadencioso portugues.'],
  auditory_de: ['Conversaciones en aleman por todas partes.', 'El aleman marcaba el ritmo de la calle.'],
  auditory_it: ['El italiano fluia como musica desde los balcones.', 'Se escuchaba italiano por todas partes.'],
  auditory_nl: ['El neerlandes sonaba en las tiendas cercanas.', 'Conversaciones en neerlandes.'],
  auditory_pl: ['El polaco resonaba en las calles.', 'Alguien discutia en polaco.'],
  auditory_el: ['El griego llenaba el aire de la calle.', 'Se escuchaba griego a su alrededor.'],
  auditory_sv: ['El sueco sonaba claro en las conversaciones cercanas.'],
  auditory_no: ['El noruego se mezclaba con el viento.'],
  auditory_da: ['El danes flotaba en el ambiente.'],
  auditory_fi: ['El finlandes, inconfundible, resonaba a su alrededor.'],
  auditory_hr: ['El croata marcaba cada conversacion.'],
  auditory_cs: ['El checo sonaba en cada esquina.'],
  auditory_hu: ['El hungaro, complejo y melodico, llenaba el espacio.'],
  auditory_ro: ['El rumano resonaba en las calles.'],
  auditory_sk: ['El eslovaco se escuchaba en los comercios cercanos.'],
  auditory_sl: ['El esloveno sonaba en las conversaciones alrededor.'],
  auditory_bg: ['El bulgaro llenaba el ambiente.'],
  auditory_en: ['El ingles era el idioma de la calle.', 'Todo el mundo hablaba ingles a su alrededor.'],
  auditory_ga: ['Algo de gaelico irlandes se escuchaba a lo lejos.'],
  auditory_et: ['El estonio resonaba a su alrededor.'],
  auditory_lv: ['El leton sonaba en las conversaciones cercanas.'],
  auditory_lt: ['El lituano se escuchaba por todas partes.'],
  auditory_sq: ['El albanes resonaba en las calles.'],
  auditory_sr: ['El serbio marcaba las conversaciones de la calle.'],
  auditory_uk: ['El ucraniano llenaba el ambiente.'],

  // -- Driving --
  driving_right: ['Los coches circulaban por la derecha.', 'Trafico por la derecha. Como en la mayor parte de Europa.'],
  driving_left: ['Los coches circulaban por la izquierda. Inusual.', 'Trafico por la izquierda. Eso descartaba casi todo.'],

  // -- Currency --
  currency_EUR: ['Alguien pago con euros.', 'Los precios marcados en euros.', 'El euro era la moneda de cambio.'],
  currency_GBP: ['Las libras esterlinas marcaban los precios.', 'Todo se pagaba en libras.'],
  currency_CHF: ['Los francos suizos eran la moneda local.', 'Se pagaba en francos.'],
  currency_PLN: ['Los eslotis polacos circulaban en las transacciones.', 'Se pagaba en eslotis.'],
  currency_CZK: ['Las coronas checas marcaban los precios.'],
  currency_HUF: ['Los florines hungaros, en grandes cantidades.'],
  currency_RON: ['Los leus rumanos eran la moneda del lugar.'],
  currency_SEK: ['Las coronas suecas marcaban los precios.'],
  currency_NOK: ['Las coronas noruegas circulaban por alli.'],
  currency_DKK: ['Las coronas danesas marcaban los precios.'],
  currency_BGN: ['Los levs bulgaros marcaban las transacciones.'],
  currency_RSD: ['Los dinares serbios en las transacciones locales.'],
  currency_UAH: ['Las grivnas ucranianas marcaban los precios.'],
  currency_ALL: ['Los leks albaneses en los comercios locales.'],

  // -- Climate --
  climate_mediterranean: ['Verano seco y caluroso. Inviernos suaves.', 'Clima mediterraneo: sol intenso, sequia estival.', 'La vegetacion hablaba de un clima mediterraneo.'],
  climate_oceanic: ['Humedad atlantica. Cielos cambiantes.', 'Clima oceanico: templado pero nublado.', 'El olor a lluvia reciente era constante.'],
  climate_continental: ['Inviernos crudos, veranos calidos. Interior de Europa.', 'Clima continental: extremos estacionales marcados.'],
  climate_alpine: ['La montana marcaba el clima: frio y nieve posible.', 'Aire alpino, limpio y frio.'],
  climate_subarctic: ['Un frio persistente que no abandonaba la escena.', 'Clima subartico: oscuridad y temperaturas extremas.'],
  climate_semiarid: ['Vegetacion escasa. Tierra seca.', 'El paisaje semiarido era un dato claro.'],

  // -- Region --
  region_western: ['Europa occidental. Alta densidad urbana.', 'El testigo lo situaba en Europa occidental.'],
  region_southern: ['Europa del sur. Mediterraneo.', 'El calor y la arquitectura hablaban de Europa meridional.'],
  region_central: ['Europa central. Entre el este y el oeste.', 'El sospechoso se movia por el corazon de Europa.'],
  region_northern: ['Norte de Europa. Latitudes altas.', 'Europa septentrional, donde los dias pueden ser muy largos.'],
  region_eastern: ['Europa del este. Historia compleja.', 'El contexto apuntaba a Europa oriental.'],

  // -- Coastal --
  coastal_yes: ['El olor a sal y mar no estaba lejos.', 'Pais costero: podia estar cerca del mar.', 'La proximidad al mar era evidente en el ambiente.'],
  coastal_no: ['Sin costa. Pais completamente interior.', 'Tierra adentro. Sin acceso directo al mar.', 'El sospechoso estaba lejos del mar.'],

  // -- Negative --
  negative_no_russia: ['El sospechoso no cruzo hacia Rusia.', 'No habia frontera con Rusia en aquel lugar.'],
  negative_no_island: ['No era un pais insular.', 'Habia llegado por tierra. No era una isla.'],

  // -- Narrative (by tag) --
  narrative_high_tourist: ['La zona bullia de turistas con camaras.', 'Un destino muy visitado. Demasiado concurrido para ocultarse.'],
  narrative_low_tourist: ['Pocas senales turisticas. La gente era local.', 'Un lugar fuera de las rutas habituales.'],
  narrative_wine: ['Entre vinedos y bodegas. El vino era omnipresente.'],
  narrative_alps: ['Las montanas alpinas se intuian en el horizonte.', 'El sospechoso se movia cerca de los Alpes.'],
  narrative_fjords: ['Paisaje de fiordos. Agua y montana.'],
  narrative_islands: ['Las islas cercanas eran parte del contexto.'],
};

function pick<V>(arr: V[]): V {
  return arr[Math.floor(Math.random() * arr.length)];
}

function template(key: string): string | null {
  const bucket = T[key];
  return bucket?.length ? pick(bucket) : null;
}

function buildPool(country: Country): Clue[] {
  const pool: Clue[] = [];

  for (const lang of country.languages) {
    const t = template(`auditory_${lang}`);
    if (t) pool.push({ type: 'auditory', text: t });
  }

  const drivT = template(`driving_${country.driving}`);
  if (drivT) pool.push({ type: 'geopolitical', text: drivT });

  const curT = template(`currency_${country.currency}`);
  if (curT) pool.push({ type: 'monetary', text: curT });

  const climKey = `climate_${pick(country.climate).replace('-', '')}`;
  const climT = template(climKey);
  if (climT) pool.push({ type: 'climatic', text: climT });

  const regKey = `region_${country.region.toLowerCase().split(' ')[0]}`;
  const regT = template(regKey);
  if (regT) pool.push({ type: 'regional', text: regT });

  const coastT = template(country.coastal ? 'coastal_yes' : 'coastal_no');
  if (coastT) pool.push({ type: 'coastal', text: coastT });

  if (!country.hasBorderWith('RU')) {
    const t = template('negative_no_russia');
    if (t) pool.push({ type: 'negative', text: t });
  }

  for (const tag of country.tags) {
    const t = template(`narrative_${tag}`);
    if (t) pool.push({ type: 'narrative', text: t });
  }

  const touristKey = `narrative_${country.touristLevel}_tourist`;
  const touristT = template(touristKey);
  if (touristT) pool.push({ type: 'narrative', text: touristT });

  return pool;
}

export class TemplateClueGenerator implements ClueGenerator {
  generate(country: Country, count: number): Clue[] {
    const pool = buildPool(country).sort(() => Math.random() - 0.5);
    return pool.slice(0, Math.min(count, pool.length));
  }

  generateExtra(country: Country, excludeTexts: string[]): Clue | null {
    const excluded = new Set(excludeTexts);
    const pool = buildPool(country).filter(c => !excluded.has(c.text));
    return pool.length ? pick(pool) : null;
  }
}
