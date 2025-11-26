import React from 'react';
import { AnalysisType } from '../types';
import { 
  HelpCircle, MessageSquare, Mic, Smile, Link, Image, MessageCircle, Clock, 
  Calendar, Moon, Briefcase, AtSign, Zap, Video, FileText, Sun, AlertTriangle, 
  Repeat, Users, Heart, PieChart, Activity, Globe, Hash, List, TrendingUp, Tag, UserMinus,
  Ghost, Laugh, AlertOctagon, Volume2, Edit3, Trash2, Camera, Trophy, MapPin, EyeOff
} from 'lucide-react';

interface SidebarProps {
  currentAnalysis: AnalysisType;
  onSelect: (type: AnalysisType) => void;
  messageCount: number;
}

const MENU_GROUPS = [
    {
        label: 'Visão Geral & Estatísticas',
        items: [
            { type: AnalysisType.GENERAL_OVERVIEW, label: 'Visão Geral', icon: Hash },
            { type: AnalysisType.PARTICIPANTS_LIST, label: 'Lista de Participantes', icon: List },
            { type: AnalysisType.MOST_ACTIVE, label: 'Mais Ativos (Ranking)', icon: TrendingUp },
            { type: AnalysisType.LEAST_ACTIVE, label: 'Menos Ativos', icon: UserMinus },
            { type: AnalysisType.MSG_DISTRIBUTION, label: 'Distribuição (%)', icon: PieChart },
        ]
    },
    {
        label: 'Tempo & Frequência',
        items: [
            { type: AnalysisType.DAILY_VOLUME, label: 'Volume Diário (Linha do Tempo)', icon: Activity },
            { type: AnalysisType.HOURLY_VOLUME, label: 'Horários de Pico', icon: Clock },
            { type: AnalysisType.PERIOD_VOLUME, label: 'Volume por Período', icon: Sun },
            { type: AnalysisType.ACTIVITY_PEAKS, label: 'Dias Atípicos (Picos)', icon: AlertTriangle },
            { type: AnalysisType.DAILY_PARTICIPATION, label: 'Participação Diária', icon: Calendar },
        ]
    },
    {
        label: 'Conteúdo & Semântica',
        items: [
            { type: AnalysisType.TOP_WORDS, label: 'Palavras Mais Usadas', icon: FileText },
            { type: AnalysisType.SENTIMENT_ANALYSIS, label: 'Análise de Sentimento', icon: Heart },
            { type: AnalysisType.INTENT_CLASSIFICATION, label: 'Classificação de Intenção', icon: Tag },
            { type: AnalysisType.MOST_LAUGHTER, label: 'Quem ri mais', icon: Smile },
            { type: AnalysisType.PROFANITY, label: 'Uso de Palavrões', icon: AlertTriangle },
            { type: AnalysisType.MOTIVATIONAL, label: 'Mensagens Motivacionais', icon: Smile },
            { type: AnalysisType.GOOD_MORNING, label: 'Quem dá mais Bom Dia', icon: Sun },
        ]
    },
    {
        label: 'Comportamento & Interação',
        items: [
            { type: AnalysisType.QUESTIONS, label: 'Quem faz mais perguntas', icon: HelpCircle },
            { type: AnalysisType.FAST_REPLY, label: 'Quem responde mais rápido', icon: Zap },
            { type: AnalysisType.ENGAGEMENT, label: 'Quem engaja mais', icon: Users },
            { type: AnalysisType.INTERACTION, label: 'Quem interage com todos', icon: MessageSquare },
            { type: AnalysisType.START_CONVO, label: 'Quem inicia conversas', icon: MessageCircle },
            { type: AnalysisType.MENTIONS, label: 'Quem menciona mais', icon: AtSign },
            { type: AnalysisType.LATE_NIGHT, label: 'Madrugadores', icon: Moon },
            { type: AnalysisType.BUSINESS_HOURS, label: 'Horário Comercial', icon: Briefcase },
        ]
    },
    {
        label: 'Mídia & Links',
        items: [
            { type: AnalysisType.AUDIOS, label: 'Quem manda mais áudios', icon: Mic },
            { type: AnalysisType.VIDEOS, label: 'Quem envia mais vídeos', icon: Video },
            { type: AnalysisType.PHOTOS, label: 'Quem envia mais fotos', icon: Image },
            { type: AnalysisType.LINKS, label: 'Quem compartilha links', icon: Link },
            { type: AnalysisType.EXTRACTED_LINKS, label: 'Lista de Links', icon: List },
            { type: AnalysisType.TOP_DOMAINS, label: 'Top Domínios', icon: Globe },
            { type: AnalysisType.EMOJIS, label: 'Quem usa mais emojis', icon: Smile },
        ]
    },
    {
        label: 'Curiosidades & Humor',
        items: [
            { type: AnalysisType.LAUGHS_KING, label: 'Rei das Risadas', icon: Laugh },
            { type: AnalysisType.ONLY_LAUGHS, label: 'Só manda KKK', icon: Laugh },
            { type: AnalysisType.GHOST, label: 'Fantasma (Some e volta)', icon: Ghost },
            { type: AnalysisType.DISAPPEAR, label: 'Manda e Some', icon: Ghost },
            { type: AnalysisType.WRONG_TIME_MORNING, label: 'Bom dia às 15h', icon: Clock },
            { type: AnalysisType.QUICK_AUDIO, label: 'Áudio "Rapidinho"', icon: Mic },
            { type: AnalysisType.WHISPER, label: 'Áudio Sussurrando', icon: Volume2 },
            { type: AnalysisType.NOISY_AUDIO, label: 'Áudio de Panela', icon: AlertOctagon },
            { type: AnalysisType.UNFINISHED_SENTENCE, label: 'Não termina frase', icon: Edit3 },
            { type: AnalysisType.RANDOM_TOPIC, label: 'Muda de Assunto', icon: AlertOctagon },
            { type: AnalysisType.STICKERS, label: 'Stickers Aleatórios', icon: Smile },
            { type: AnalysisType.REGRET, label: 'Reclama e Volta Atrás', icon: AlertTriangle },
            { type: AnalysisType.DELETED_MSGS, label: 'Mensagens Apagadas', icon: Trash2 },
            { type: AnalysisType.REWRITE, label: 'Apaga e Reescreve', icon: Edit3 },
            { type: AnalysisType.PRINTS, label: 'Prints Desnecessários', icon: Camera },
            { type: AnalysisType.MEME_WAR, label: 'Guerra de Memes', icon: Image },
            { type: AnalysisType.HOPEFUL, label: 'Diz "Agora Vai"', icon: Trophy },
            { type: AnalysisType.FAKE_PROMISE, label: 'Vou ver e te aviso', icon: AlertTriangle },
            { type: AnalysisType.ANNOUNCER, label: 'Diz "Cheguei"', icon: MapPin },
            { type: AnalysisType.REPETITIVE_ASK, label: 'Mesma Pergunta', icon: Repeat },
            { type: AnalysisType.MIDNIGHT_MASTER, label: 'Mestre da Madrugada', icon: Moon },
            { type: AnalysisType.GHOST_RESPONDER, label: 'Fantasma que Responde', icon: Ghost },
            { type: AnalysisType.CAPS_LOCK, label: 'CAPS LOCK', icon: AlertTriangle },
            { type: AnalysisType.FULL_GREETING, label: 'Combo de Saudações', icon: Sun },
            { type: AnalysisType.INVISIBLE, label: 'Mensagens Invisíveis', icon: EyeOff },
        ]
    }
];

export const Sidebar: React.FC<SidebarProps> = ({ currentAnalysis, onSelect, messageCount }) => {
  return (
    <aside className="w-full md:w-80 bg-white border-r border-gray-200 h-full flex flex-col">
      <div className="p-6 border-b border-gray-100">
        <h1 className="text-xl font-bold text-whatsapp-primary flex items-center">
          <Zap className="w-6 h-6 mr-2 fill-current" />
          ZapAnalytics
        </h1>
        <p className="text-xs text-gray-500 mt-1">
          {messageCount.toLocaleString()} mensagens carregadas
        </p>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-6 scrollbar-thin scrollbar-thumb-gray-200">
        {MENU_GROUPS.map((group, idx) => (
            <div key={idx}>
                <p className="px-3 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
                    {group.label}
                </p>
                <div className="space-y-1">
                    {group.items.map((item) => (
                    <button
                        key={item.type}
                        onClick={() => onSelect(item.type)}
                        className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                        currentAnalysis === item.type
                            ? 'bg-whatsapp-chat text-whatsapp-secondary font-medium'
                            : 'text-gray-600 hover:bg-gray-50'
                        }`}
                    >
                        <item.icon className={`w-4 h-4 ${currentAnalysis === item.type ? 'text-whatsapp-primary' : 'text-gray-400'}`} />
                        <span className="truncate">{item.label}</span>
                    </button>
                    ))}
                </div>
            </div>
        ))}
      </div>
      
      <div className="p-4 border-t border-gray-100 text-center text-xs text-gray-400">
        v1.3 • Privacy First
      </div>
    </aside>
  );
};