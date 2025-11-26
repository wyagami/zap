export interface Message {
  date: Date;
  author: string;
  content: string;
  isSystem: boolean;
}

export interface ChartDataPoint {
  name: string;
  value: number;
  secondaryValue?: number;
}

export interface AnalysisResult {
  title: string;
  description: string;
  type: 'bar' | 'list' | 'pie' | 'metric' | 'line';
  data: ChartDataPoint[];
  unit?: string;
}

export enum AnalysisType {
  // --- Original Statistical Prompts ---
  GENERAL_OVERVIEW = 'GENERAL_OVERVIEW',
  PARTICIPANTS_LIST = 'PARTICIPANTS_LIST',
  MOST_ACTIVE = 'MOST_ACTIVE',
  MSG_DISTRIBUTION = 'MSG_DISTRIBUTION',
  LEAST_ACTIVE = 'LEAST_ACTIVE',
  DAILY_AVERAGE = 'DAILY_AVERAGE',
  ACTIVITY_PEAKS = 'ACTIVITY_PEAKS',
  DAILY_VOLUME = 'DAILY_VOLUME',
  HOURLY_VOLUME = 'HOURLY_VOLUME',
  PERIOD_VOLUME = 'PERIOD_VOLUME',
  TOP_WORDS = 'TOP_WORDS',
  INTENT_CLASSIFICATION = 'INTENT_CLASSIFICATION',
  SENTIMENT_ANALYSIS = 'SENTIMENT_ANALYSIS',
  EXTRACTED_LINKS = 'EXTRACTED_LINKS',
  TOP_DOMAINS = 'TOP_DOMAINS',
  SYSTEM_MESSAGES = 'SYSTEM_MESSAGES',

  // --- Behavioral Prompts ---
  QUESTIONS = 'QUESTIONS',
  LONG_MESSAGES = 'LONG_MESSAGES',
  AUDIOS = 'AUDIOS',
  EMOJIS = 'EMOJIS',
  LINKS = 'LINKS',
  PHOTOS = 'PHOTOS',
  START_CONVO = 'START_CONVO',
  FAST_REPLY = 'FAST_REPLY',
  DAILY_PARTICIPATION = 'DAILY_PARTICIPATION',
  LATE_NIGHT = 'LATE_NIGHT',
  BUSINESS_HOURS = 'BUSINESS_HOURS',
  MENTIONS = 'MENTIONS',
  ENGAGEMENT = 'ENGAGEMENT',
  VIDEOS = 'VIDEOS',
  DOCUMENTS = 'DOCUMENTS',
  GOOD_MORNING = 'GOOD_MORNING',
  PROFANITY = 'PROFANITY',
  REPEATED = 'REPEATED',
  INTERACTION = 'INTERACTION',
  MOTIVATIONAL = 'MOTIVATIONAL',
  MOST_LAUGHTER = 'MOST_LAUGHTER',

  // --- Fun & Specific Prompts ---
  LAUGHS_KING = 'LAUGHS_KING', // Rei das risadas
  GHOST = 'GHOST', // Some e reaparece
  WRONG_TIME_MORNING = 'WRONG_TIME_MORNING', // Bom dia às 15h
  QUICK_AUDIO = 'QUICK_AUDIO', // Audio de 5min "rapidinho"
  UNFINISHED_SENTENCE = 'UNFINISHED_SENTENCE', // Nunca termina frase
  ONLY_LAUGHS = 'ONLY_LAUGHS', // Kkk sem motivo
  RANDOM_TOPIC = 'RANDOM_TOPIC', // Muda de assunto do nada
  STICKERS = 'STICKERS', // Stickers aleatórios
  NOISY_AUDIO = 'NOISY_AUDIO', // Audio de panela (proxy: almoço/jantar)
  REGRET = 'REGRET', // Reclama e volta atrás
  DELETED_MSGS = 'DELETED_MSGS', // Mensagem apagada
  REWRITE = 'REWRITE', // Apaga e escreve de novo
  PRINTS = 'PRINTS', // Print desnecessário
  HOPEFUL = 'HOPEFUL', // Agora vai
  MEME_WAR = 'MEME_WAR', // Memes com memes
  DISAPPEAR = 'DISAPPEAR', // Manda e some
  WHISPER = 'WHISPER', // Audio sussurrando (proxy: madrugada)
  FAKE_PROMISE = 'FAKE_PROMISE', // Vou ver e te aviso
  ANNOUNCER = 'ANNOUNCER', // Cheguei
  REPETITIVE_ASK = 'REPETITIVE_ASK', // Mesma pergunta
  MIDNIGHT_MASTER = 'MIDNIGHT_MASTER', // Mestre da madrugada (Specific)
  GHOST_RESPONDER = 'GHOST_RESPONDER', // Nunca online mas responde
  CAPS_LOCK = 'CAPS_LOCK', // Caps lock gritando
  FULL_GREETING = 'FULL_GREETING', // Bom dia/tarde/noite juntos
  INVISIBLE = 'INVISIBLE' // Mensagens invisíveis/emojis
}