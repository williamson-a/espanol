// Daily-routine prompts, A1 level, all answerable in the present tense.
// Hardcoded on purpose: no API call needed just to ask a question, so browsing
// prompts is free and instant. Only your answer costs anything.
//
// Word banks list INFINITIVES only — never a conjugated form. Conjugating is the
// exercise; handing over "me despierto" next to "¿A qué hora te despiertas?"
// turns it into copying. `hint` states the rule you need without applying it.

export const QUESTIONS = [
  {
    q: "¿A qué hora te despiertas?",
    en: "What time do you wake up?",
    hint: "despertarse is reflexive AND stem-changing (e → ie). You need a pronoun before the verb.",
    words: [
      { es: "despertarse", en: "to wake up" },
      { es: "la mañana", en: "the morning" },
      { es: "temprano", en: "early" },
      { es: "a las…", en: "at … o'clock" },
      { es: "siempre", en: "always" },
    ],
  },
  {
    q: "¿Qué desayunas?",
    en: "What do you have for breakfast?",
    hint: "desayunar is a regular -ar verb. Regular -ar yo forms end in -o.",
    words: [
      { es: "desayunar", en: "to have breakfast" },
      { es: "el desayuno", en: "breakfast" },
      { es: "el café", en: "coffee" },
      { es: "el pan", en: "bread" },
      { es: "la fruta", en: "fruit" },
      { es: "el huevo", en: "the egg" },
    ],
  },
  {
    q: "¿Cómo vas al trabajo?",
    en: "How do you get to work?",
    hint: "ir is irregular — its yo form is only three letters and starts with v.",
    words: [
      { es: "ir", en: "to go" },
      { es: "el trabajo", en: "work" },
      { es: "el coche", en: "the car" },
      { es: "a pie", en: "on foot" },
      { es: "el autobús", en: "the bus" },
      { es: "el tren", en: "the train" },
    ],
  },
  {
    q: "¿A qué hora empiezas a trabajar?",
    en: "What time do you start work?",
    hint: "empezar is stem-changing (e → ie). The stem changes but the ending is regular.",
    words: [
      { es: "empezar", en: "to start" },
      { es: "trabajar", en: "to work" },
      { es: "a las…", en: "at … o'clock" },
      { es: "la hora", en: "the hour, the time" },
      { es: "y media", en: "half past" },
    ],
  },
  {
    q: "¿Qué haces por la mañana?",
    en: "What do you do in the morning?",
    hint: "hacer is irregular in the yo form — it ends in -go.",
    words: [
      { es: "hacer", en: "to do, to make" },
      { es: "por la mañana", en: "in the morning" },
      { es: "primero", en: "first" },
      { es: "luego", en: "then, later" },
      { es: "ducharse", en: "to shower" },
    ],
  },
  {
    q: "¿Dónde comes normalmente?",
    en: "Where do you usually eat?",
    hint: "comer is a regular -er verb. Regular -er yo forms also end in -o.",
    words: [
      { es: "comer", en: "to eat" },
      { es: "en casa", en: "at home" },
      { es: "normalmente", en: "usually" },
      { es: "el restaurante", en: "the restaurant" },
      { es: "la oficina", en: "the office" },
    ],
  },
  {
    q: "¿Bebes café o té?",
    en: "Do you drink coffee or tea?",
    hint: "beber is a regular -er verb.",
    words: [
      { es: "beber", en: "to drink" },
      { es: "el café", en: "coffee" },
      { es: "el té", en: "tea" },
      { es: "el agua", en: "water" },
      { es: "o", en: "or" },
      { es: "por la mañana", en: "in the morning" },
    ],
  },
  {
    q: "¿Qué haces por la tarde?",
    en: "What do you do in the afternoon?",
    hint: "salir is irregular in the yo form — like hacer, it ends in -go.",
    words: [
      { es: "por la tarde", en: "in the afternoon" },
      { es: "descansar", en: "to rest" },
      { es: "estudiar", en: "to study" },
      { es: "salir", en: "to go out" },
      { es: "trabajar", en: "to work" },
    ],
  },
  {
    q: "¿A qué hora cenas?",
    en: "What time do you have dinner?",
    hint: "cenar is a regular -ar verb.",
    words: [
      { es: "cenar", en: "to have dinner" },
      { es: "la cena", en: "dinner" },
      { es: "a las…", en: "at … o'clock" },
      { es: "la noche", en: "the night" },
      { es: "tarde", en: "late" },
    ],
  },
  {
    q: "¿Ves la televisión por la noche?",
    en: "Do you watch television at night?",
    hint: "ver is irregular in the yo form — it keeps the e from the infinitive.",
    words: [
      { es: "ver", en: "to see, to watch" },
      { es: "la televisión", en: "television" },
      { es: "la serie", en: "the TV series" },
      { es: "a veces", en: "sometimes" },
      { es: "por la noche", en: "at night" },
    ],
  },
  {
    q: "¿A qué hora te acuestas?",
    en: "What time do you go to bed?",
    hint: "acostarse is reflexive AND stem-changing (o → ue).",
    words: [
      { es: "acostarse", en: "to go to bed" },
      { es: "dormir", en: "to sleep" },
      { es: "la cama", en: "the bed" },
      { es: "tarde", en: "late" },
      { es: "a las…", en: "at … o'clock" },
    ],
  },
  {
    q: "¿Haces ejercicio?",
    en: "Do you exercise?",
    hint: "correr and caminar are both regular. hacer is the irregular one here.",
    words: [
      { es: "el ejercicio", en: "exercise" },
      { es: "correr", en: "to run" },
      { es: "caminar", en: "to walk" },
      { es: "el gimnasio", en: "the gym" },
      { es: "nunca", en: "never" },
      { es: "siempre", en: "always" },
    ],
  },
  {
    q: "¿Escuchas música?",
    en: "Do you listen to music?",
    hint: "escuchar is regular -ar. Note it needs no word for 'to' — escuchar música.",
    words: [
      { es: "escuchar", en: "to listen" },
      { es: "la música", en: "music" },
      { es: "la canción", en: "the song" },
      { es: "mucho", en: "a lot" },
      { es: "en el coche", en: "in the car" },
    ],
  },
  {
    q: "¿Lees libros?",
    en: "Do you read books?",
    hint: "leer is regular -er in the yo form.",
    words: [
      { es: "leer", en: "to read" },
      { es: "el libro", en: "the book" },
      { es: "antes de dormir", en: "before sleeping" },
      { es: "poco", en: "a little" },
      { es: "la noche", en: "the night" },
    ],
  },
  {
    q: "¿Cocinas en casa?",
    en: "Do you cook at home?",
    hint: "cocinar is regular -ar.",
    words: [
      { es: "cocinar", en: "to cook" },
      { es: "la comida", en: "the food, the meal" },
      { es: "la cocina", en: "the kitchen" },
      { es: "todos los días", en: "every day" },
      { es: "la cena", en: "dinner" },
    ],
  },
  {
    q: "¿Hablas con tu familia?",
    en: "Do you talk with your family?",
    hint: "hablar is regular -ar — the textbook example.",
    words: [
      { es: "hablar", en: "to talk, to speak" },
      { es: "la familia", en: "the family" },
      { es: "el teléfono", en: "the phone" },
      { es: "con", en: "with" },
      { es: "cada día", en: "each day" },
    ],
  },
  {
    q: "¿Qué haces los sábados?",
    en: "What do you do on Saturdays?",
    hint: "'On Saturdays' is los sábados — no word for 'on'.",
    words: [
      { es: "el sábado", en: "Saturday" },
      { es: "el fin de semana", en: "the weekend" },
      { es: "descansar", en: "to rest" },
      { es: "los amigos", en: "friends" },
      { es: "visitar", en: "to visit" },
    ],
  },
  {
    q: "¿Trabajas los fines de semana?",
    en: "Do you work on weekends?",
    hint: "To say no, put no directly before the verb.",
    words: [
      { es: "trabajar", en: "to work" },
      { es: "el fin de semana", en: "the weekend" },
      { es: "no", en: "not" },
      { es: "a veces", en: "sometimes" },
      { es: "el domingo", en: "Sunday" },
    ],
  },
  {
    q: "¿Caminas mucho?",
    en: "Do you walk a lot?",
    hint: "caminar is regular -ar.",
    words: [
      { es: "caminar", en: "to walk" },
      { es: "el parque", en: "the park" },
      { es: "cada día", en: "each day" },
      { es: "mucho", en: "a lot" },
      { es: "el perro", en: "the dog" },
    ],
  },
  {
    q: "¿Tienes animales en casa?",
    en: "Do you have pets at home?",
    hint: "tener is irregular in the yo form — it ends in -go, like hacer and salir.",
    words: [
      { es: "tener", en: "to have" },
      { es: "el perro", en: "the dog" },
      { es: "el gato", en: "the cat" },
      { es: "en casa", en: "at home" },
      { es: "el animal", en: "the animal" },
    ],
  },
  {
    q: "¿Qué tiempo hace hoy?",
    en: "What's the weather like today?",
    hint: "Weather uses hacer in the third person plus a noun: hace + sol / frío / calor.",
    words: [
      { es: "hacer", en: "to do, to make" },
      { es: "el sol", en: "the sun" },
      { es: "el frío", en: "the cold" },
      { es: "el calor", en: "the heat" },
      { es: "llover", en: "to rain" },
      { es: "hoy", en: "today" },
    ],
  },
  {
    q: "¿Estudias español todos los días?",
    en: "Do you study Spanish every day?",
    hint: "estudiar is regular -ar. Languages are lowercase in Spanish: español.",
    words: [
      { es: "estudiar", en: "to study" },
      { es: "el español", en: "Spanish" },
      { es: "todos los días", en: "every day" },
      { es: "un poco", en: "a little" },
      { es: "aprender", en: "to learn" },
    ],
  },
  {
    q: "¿Cuándo miras el fútbol?",
    en: "When do you watch football?",
    hint: "mirar is regular -ar.",
    words: [
      { es: "mirar", en: "to watch" },
      { es: "el fútbol", en: "football" },
      { es: "el partido", en: "the match" },
      { es: "el domingo", en: "Sunday" },
      { es: "con", en: "with" },
    ],
  },
  {
    q: "¿Qué haces antes de dormir?",
    en: "What do you do before sleeping?",
    hint: "After antes de, the verb stays in the infinitive — don't conjugate that one.",
    words: [
      { es: "antes de", en: "before" },
      { es: "dormir", en: "to sleep" },
      { es: "ducharse", en: "to shower" },
      { es: "leer", en: "to read" },
      { es: "la cama", en: "the bed" },
    ],
  },
];

// Deterministic question-of-the-day, so opening the page twice in one morning
// shows the same prompt. Rotates through the whole list before repeating.
export function questionIndexForToday(date = new Date()) {
  const days = Math.floor(date.getTime() / 86400000);
  return days % QUESTIONS.length;
}
