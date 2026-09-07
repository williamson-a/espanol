// Daily-routine prompts, A1 level, all answerable in the present tense.
// Hardcoded on purpose: no API call needed just to ask a question, so browsing
// prompts is free and instant. Only your answer costs anything.

export const QUESTIONS = [
  {
    q: "¿A qué hora te despiertas?",
    en: "What time do you wake up?",
    start: "Me despierto a las…",
    words: [
      { es: "despertarse", en: "to wake up" },
      { es: "me despierto", en: "I wake up" },
      { es: "a las cinco", en: "at five o'clock" },
      { es: "temprano", en: "early" },
      { es: "la mañana", en: "the morning" },
    ],
  },
  {
    q: "¿Qué desayunas?",
    en: "What do you have for breakfast?",
    start: "Desayuno…",
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
    start: "Voy al trabajo…",
    words: [
      { es: "ir", en: "to go" },
      { es: "voy", en: "I go" },
      { es: "el trabajo", en: "work" },
      { es: "en coche", en: "by car" },
      { es: "a pie", en: "on foot" },
      { es: "el autobús", en: "the bus" },
    ],
  },
  {
    q: "¿A qué hora empiezas a trabajar?",
    en: "What time do you start work?",
    start: "Empiezo a trabajar a las…",
    words: [
      { es: "empezar", en: "to start" },
      { es: "empiezo", en: "I start" },
      { es: "trabajar", en: "to work" },
      { es: "a las nueve", en: "at nine" },
      { es: "la hora", en: "the hour, the time" },
    ],
  },
  {
    q: "¿Qué haces por la mañana?",
    en: "What do you do in the morning?",
    start: "Por la mañana…",
    words: [
      { es: "hacer", en: "to do, to make" },
      { es: "hago", en: "I do" },
      { es: "por la mañana", en: "in the morning" },
      { es: "primero", en: "first" },
      { es: "luego", en: "then, later" },
    ],
  },
  {
    q: "¿Dónde comes normalmente?",
    en: "Where do you usually eat?",
    start: "Como en…",
    words: [
      { es: "comer", en: "to eat" },
      { es: "como", en: "I eat" },
      { es: "en casa", en: "at home" },
      { es: "normalmente", en: "usually" },
      { es: "el restaurante", en: "the restaurant" },
    ],
  },
  {
    q: "¿Bebes café o té?",
    en: "Do you drink coffee or tea?",
    start: "Bebo…",
    words: [
      { es: "beber", en: "to drink" },
      { es: "bebo", en: "I drink" },
      { es: "el café", en: "coffee" },
      { es: "el té", en: "tea" },
      { es: "el agua", en: "water" },
      { es: "o", en: "or" },
    ],
  },
  {
    q: "¿Qué haces por la tarde?",
    en: "What do you do in the afternoon?",
    start: "Por la tarde…",
    words: [
      { es: "por la tarde", en: "in the afternoon" },
      { es: "descansar", en: "to rest" },
      { es: "estudiar", en: "to study" },
      { es: "salir", en: "to go out" },
      { es: "salgo", en: "I go out" },
    ],
  },
  {
    q: "¿A qué hora cenas?",
    en: "What time do you have dinner?",
    start: "Ceno a las…",
    words: [
      { es: "cenar", en: "to have dinner" },
      { es: "ceno", en: "I have dinner" },
      { es: "la cena", en: "dinner" },
      { es: "a las ocho", en: "at eight" },
      { es: "la noche", en: "the night" },
    ],
  },
  {
    q: "¿Ves la televisión por la noche?",
    en: "Do you watch television at night?",
    start: "Veo la televisión…",
    words: [
      { es: "ver", en: "to see, to watch" },
      { es: "veo", en: "I watch" },
      { es: "la televisión", en: "television" },
      { es: "la serie", en: "the TV series" },
      { es: "a veces", en: "sometimes" },
    ],
  },
  {
    q: "¿A qué hora te acuestas?",
    en: "What time do you go to bed?",
    start: "Me acuesto a las…",
    words: [
      { es: "acostarse", en: "to go to bed" },
      { es: "me acuesto", en: "I go to bed" },
      { es: "dormir", en: "to sleep" },
      { es: "duermo", en: "I sleep" },
      { es: "tarde", en: "late" },
    ],
  },
  {
    q: "¿Haces ejercicio?",
    en: "Do you exercise?",
    start: "Hago ejercicio…",
    words: [
      { es: "el ejercicio", en: "exercise" },
      { es: "correr", en: "to run" },
      { es: "corro", en: "I run" },
      { es: "el gimnasio", en: "the gym" },
      { es: "nunca", en: "never" },
      { es: "siempre", en: "always" },
    ],
  },
  {
    q: "¿Escuchas música?",
    en: "Do you listen to music?",
    start: "Escucho música…",
    words: [
      { es: "escuchar", en: "to listen" },
      { es: "escucho", en: "I listen" },
      { es: "la música", en: "music" },
      { es: "la canción", en: "the song" },
      { es: "mucho", en: "a lot" },
    ],
  },
  {
    q: "¿Lees libros?",
    en: "Do you read books?",
    start: "Leo…",
    words: [
      { es: "leer", en: "to read" },
      { es: "leo", en: "I read" },
      { es: "el libro", en: "the book" },
      { es: "antes de dormir", en: "before sleeping" },
      { es: "poco", en: "a little" },
    ],
  },
  {
    q: "¿Cocinas en casa?",
    en: "Do you cook at home?",
    start: "Cocino…",
    words: [
      { es: "cocinar", en: "to cook" },
      { es: "cocino", en: "I cook" },
      { es: "la comida", en: "the food, the meal" },
      { es: "la cocina", en: "the kitchen" },
      { es: "todos los días", en: "every day" },
    ],
  },
  {
    q: "¿Hablas con tu familia?",
    en: "Do you talk with your family?",
    start: "Hablo con…",
    words: [
      { es: "hablar", en: "to talk, to speak" },
      { es: "hablo", en: "I talk" },
      { es: "la familia", en: "the family" },
      { es: "el teléfono", en: "the phone" },
      { es: "con", en: "with" },
    ],
  },
  {
    q: "¿Qué haces los sábados?",
    en: "What do you do on Saturdays?",
    start: "Los sábados…",
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
    start: "No trabajo…",
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
    start: "Camino…",
    words: [
      { es: "caminar", en: "to walk" },
      { es: "camino", en: "I walk" },
      { es: "el parque", en: "the park" },
      { es: "cada día", en: "each day" },
      { es: "mucho", en: "a lot" },
    ],
  },
  {
    q: "¿Tienes animales en casa?",
    en: "Do you have pets at home?",
    start: "Tengo…",
    words: [
      { es: "tener", en: "to have" },
      { es: "tengo", en: "I have" },
      { es: "el perro", en: "the dog" },
      { es: "el gato", en: "the cat" },
      { es: "en casa", en: "at home" },
    ],
  },
  {
    q: "¿Qué tiempo hace hoy?",
    en: "What's the weather like today?",
    start: "Hoy hace…",
    words: [
      { es: "hace sol", en: "it is sunny" },
      { es: "hace frío", en: "it is cold" },
      { es: "hace calor", en: "it is hot" },
      { es: "llueve", en: "it rains, it is raining" },
      { es: "hoy", en: "today" },
    ],
  },
  {
    q: "¿Estudias español todos los días?",
    en: "Do you study Spanish every day?",
    start: "Estudio español…",
    words: [
      { es: "estudiar", en: "to study" },
      { es: "estudio", en: "I study" },
      { es: "el español", en: "Spanish" },
      { es: "todos los días", en: "every day" },
      { es: "un poco", en: "a little" },
    ],
  },
  {
    q: "¿Cuándo miras el fútbol?",
    en: "When do you watch football?",
    start: "Miro el fútbol…",
    words: [
      { es: "mirar", en: "to watch" },
      { es: "miro", en: "I watch" },
      { es: "el fútbol", en: "football" },
      { es: "el partido", en: "the match" },
      { es: "cuándo", en: "when" },
    ],
  },
  {
    q: "¿Qué haces antes de dormir?",
    en: "What do you do before sleeping?",
    start: "Antes de dormir…",
    words: [
      { es: "antes de", en: "before" },
      { es: "dormir", en: "to sleep" },
      { es: "ducharse", en: "to shower" },
      { es: "me ducho", en: "I shower" },
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
