import { Message, AnalysisResult, AnalysisType, ChartDataPoint } from '../types';

// Constants for Text Analysis
const stopWords = new Set(["a","o","e","que","do","da","em","um","uma","de","é","para","por","não","na","no","se","com","os","as","dos","das","me","ele","ela","eu","voce","vc","pra","ta","tá","to","tô","pro","isso","aquilo","minha","seu","sua","te","tu","nós","nos","eles","elas","lhes","ao","aos","pelo","pela","num","numa","foi","ser","são","está","estou","mas","ou","então","ja","já","muito","agora","sobre","tudo","nada","depois","antes","hoje","aqui","lá","onde","como","quando","quem","qual","quais","ok","né","ah","eh","sim","não","entendi","kkk","kkkk","kkkkk","rs"]);

const sentimentDict = {
  positive: ["bom", "boa", "ótimo", "otimo", "ótima", "otima", "excelente", "legal", "feliz", "amo", "adoro", "parabéns", "parabens", "sucesso", "obrigado", "obrigada", "top", "show", "maravilha", "ganhamos", "lucro", "ajudou", "resolver", "venda", "perfeito"],
  negative: ["ruim", "péssimo", "pessimo", "horrível", "horrivel", "triste", "droga", "merda", "chato", "problema", "erro", "falha", "perda", "demora", "reclamar", "reclamação", "ódio", "raiva", "cancelei", "cancelar", "nada", "nunca", "ninguém", "decepção"],
  sales: ["preço", "valor", "custa", "pix", "transferência", "cartão", "boleto", "comprar", "vender", "promoção", "desconto", "frete", "entrega", "pedido"],
  doubts: ["dúvida", "duvida", "como", "onde", "qual", "quando", "funciona", "ajuda", "?", "pode", "consegue", "porquê"]
};

// Helper to sort and slice top N
const getTop = (map: Record<string, number>, topN = 10, ascending = false): ChartDataPoint[] => {
  return Object.entries(map)
    .sort(([, a], [, b]) => ascending ? a - b : b - a)
    .slice(0, topN)
    .map(([name, value]) => ({ name, value }));
};

const countByAuthor = (messages: Message[], condition: (msg: Message) => boolean): Record<string, number> => {
  const counts: Record<string, number> = {};
  messages.forEach(msg => {
    if (!msg.isSystem && condition(msg)) {
      counts[msg.author] = (counts[msg.author] || 0) + 1;
    }
  });
  return counts;
};

// Main Analysis Runner
export const runAnalysis = (messages: Message[], type: AnalysisType): AnalysisResult => {
  const totalMsgs = messages.length;

  switch (type) {
    // --- Original Statistical Prompts ---

    case AnalysisType.GENERAL_OVERVIEW: {
        const uniqueAuthors = new Set(messages.map(m => m.author)).size;
        const uniqueDays = new Set(messages.map(m => m.date.toDateString())).size;
        
        return {
            title: 'Visão Geral e Estatísticas Chave',
            description: 'Resumo estatístico de todo o histórico do chat.',
            type: 'metric', // Changed to metric for Big Cards layout
            data: [
                { name: 'Total de Mensagens', value: totalMsgs },
                { name: 'Total de Participantes', value: uniqueAuthors },
                { name: 'Dias Ativos', value: uniqueDays },
                { name: 'Média de Msgs/Dia', value: Math.round(totalMsgs / (uniqueDays || 1)) }
            ],
            unit: ''
        };
    }

    case AnalysisType.PARTICIPANTS_LIST: {
        // Calculate message count per author instead of just listing them
        const counts: Record<string, number> = {};
        messages.forEach(m => { counts[m.author] = (counts[m.author] || 0) + 1; });
        const authors = Object.keys(counts).sort(); // Alphabetical sort
        
        return {
            title: 'Lista de participantes do grupo',
            description: 'Lista alfabética de participantes e total de mensagens enviadas.',
            type: 'list',
            data: authors.map(a => ({ name: a, value: counts[a] })),
            unit: 'msgs'
        };
    }

    case AnalysisType.MOST_ACTIVE: {
        const counts: Record<string, number> = {};
        messages.forEach(m => { counts[m.author] = (counts[m.author] || 0) + 1; });
        return {
            title: 'Participantes mais ativos',
            description: 'Ranking por volume total de mensagens enviadas.',
            type: 'bar',
            data: getTop(counts, 15),
            unit: 'msgs'
        };
    }

    case AnalysisType.MSG_DISTRIBUTION: {
        const counts: Record<string, number> = {};
        messages.forEach(m => { counts[m.author] = (counts[m.author] || 0) + 1; });
        return {
            title: 'Distribuição de mensagens por usuário',
            description: 'Proporção de mensagens enviadas (Top 7).',
            type: 'pie',
            data: getTop(counts, 7),
            unit: 'msgs'
        };
    }

    case AnalysisType.LEAST_ACTIVE: {
        const counts: Record<string, number> = {};
        messages.forEach(m => { counts[m.author] = (counts[m.author] || 0) + 1; });
        return {
            title: 'Participantes menos ativos',
            description: 'Usuários com menor volume de mensagens (Ghost readers).',
            type: 'list',
            data: getTop(counts, 50, true), // Ascending sort
            unit: 'msgs'
        };
    }

    case AnalysisType.DAILY_AVERAGE: {
        const days = new Set(messages.map(m => m.date.toDateString())).size;
        return {
            title: 'Média de mensagens por dia',
            description: 'Média aritmética simples (Total / Dias).',
            type: 'metric',
            data: [{ name: 'Média Diária', value: parseFloat((totalMsgs / (days || 1)).toFixed(2)) }],
            unit: 'msgs/dia'
        };
    }

    case AnalysisType.ACTIVITY_PEAKS: {
        const dateCounts: Record<string, number> = {};
        messages.forEach(m => {
            const date = m.date.toISOString().split('T')[0];
            dateCounts[date] = (dateCounts[date] || 0) + 1;
        });
        
        const values = Object.values(dateCounts);
        const mean = values.reduce((a,b) => a+b, 0) / values.length;
        const stdDev = Math.sqrt(values.map(x => Math.pow(x - mean, 2)).reduce((a,b) => a+b, 0) / values.length);
        const threshold = mean + (2 * stdDev);

        const anomalies = Object.entries(dateCounts)
            .filter(([, v]) => v > threshold)
            .sort(([, a], [, b]) => b - a)
            .map(([d, v]) => ({ name: d, value: v }));

        return {
            title: 'Picos de atividade (dias atípicos)',
            description: `Dias com volume acima de ${Math.round(threshold)} mensagens (Média + 2x Desvio Padrão).`,
            type: 'bar',
            data: anomalies,
            unit: 'msgs'
        };
    }

    case AnalysisType.DAILY_VOLUME: {
        const dateCounts: Record<string, number> = {};
        messages.forEach(m => {
            const date = m.date.toISOString().split('T')[0];
            dateCounts[date] = (dateCounts[date] || 0) + 1;
        });
        // Sort by date
        const sortedData = Object.entries(dateCounts)
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([name, value]) => ({ name, value }));

        return {
            title: 'Evolução do volume diário',
            description: 'Histórico de mensagens por dia ao longo do tempo.',
            type: 'line',
            data: sortedData,
            unit: 'msgs'
        };
    }

    case AnalysisType.HOURLY_VOLUME: {
        const hours = new Array(24).fill(0);
        messages.forEach(m => hours[m.date.getHours()]++);
        return {
            title: 'Horários com maior volume',
            description: 'Atividade acumulada por hora do dia (0-23h).',
            type: 'line', // Line or Bar works, Line shows trend better
            data: hours.map((v, i) => ({ name: `${i}h`, value: v })),
            unit: 'msgs'
        };
    }

    case AnalysisType.PERIOD_VOLUME: {
        const periods = { "00h-06h (Madrugada)": 0, "06h-12h (Manhã)": 0, "12h-18h (Tarde)": 0, "18h-24h (Noite)": 0 };
        messages.forEach(m => {
            const h = m.date.getHours();
            if(h < 6) periods["00h-06h (Madrugada)"]++;
            else if(h < 12) periods["06h-12h (Manhã)"]++;
            else if(h < 18) periods["12h-18h (Tarde)"]++;
            else periods["18h-24h (Noite)"]++;
        });
        return {
            title: 'Volume de mensagens por período',
            description: 'Distribuição do volume por turnos do dia.',
            type: 'pie',
            data: Object.entries(periods).map(([name, value]) => ({ name, value })),
            unit: 'msgs'
        };
    }

    case AnalysisType.TOP_WORDS: {
        const counts: Record<string, number> = {};
        messages.forEach(row => {
            const words = row.content.toLowerCase().replace(/[.,/#!$%^&*;:{}=\-_`~()?"']|[\u200B-\u200D\uFEFF]/g,"").split(/\s+/);
            words.forEach(w => {
                if(w.length > 3 && !stopWords.has(w) && !/^\d+$/.test(w)) {
                    counts[w] = (counts[w] || 0) + 1;
                }
            });
        });
        return {
            title: 'Palavras mais usadas',
            description: 'Termos mais frequentes (excluindo palavras comuns/stopwords).',
            type: 'bar',
            data: getTop(counts, 20),
            unit: 'ocorrências'
        };
    }

    case AnalysisType.INTENT_CLASSIFICATION: {
        const counts = { "Vendas/Financeiro": 0, "Dúvidas/Perguntas": 0, "Sentimento Negativo": 0, "Outros": 0 };
        messages.forEach(r => {
            const m = r.content.toLowerCase();
            if(sentimentDict.sales.some(k => m.includes(k))) counts["Vendas/Financeiro"]++;
            else if(sentimentDict.doubts.some(k => m.includes(k))) counts["Dúvidas/Perguntas"]++;
            else if(sentimentDict.negative.some(k => m.includes(k))) counts["Sentimento Negativo"]++;
            else counts["Outros"]++;
        });
        return {
            title: 'Classificação Heurística',
            description: 'Categorização básica baseada em palavras-chave.',
            type: 'bar',
            data: getTop(counts, 4), // There are only 4 categories
            unit: 'msgs'
        };
    }

    case AnalysisType.SENTIMENT_ANALYSIS: {
        const counts = { Positivo: 0, Negativo: 0, Neutro: 0 };
        messages.forEach(r => {
            const m = r.content.toLowerCase();
            const isPositive = sentimentDict.positive.some(k => m.includes(k));
            const isNegative = sentimentDict.negative.some(k => m.includes(k));

            if (isPositive && !isNegative) counts.Positivo++;
            else if (isNegative && !isPositive) counts.Negativo++;
            else counts.Neutro++;
        });
        return {
            title: 'Detecção de Sentimentos (Heurística)',
            description: 'Estimativa baseada em dicionário de palavras positivas/negativas.',
            type: 'pie',
            data: Object.entries(counts).map(([name, value]) => ({ name, value })),
            unit: 'msgs'
        };
    }

    case AnalysisType.EXTRACTED_LINKS: {
        const linksSet = new Set<string>();
        const regex = /(https?:\/\/[^\s]+)/g;
        messages.forEach(m => {
            const matches = m.content.match(regex);
            if (matches) matches.forEach(l => linksSet.add(l));
        });
        return {
            title: 'Extração de links',
            description: 'Lista de todos os links compartilhados no grupo.',
            type: 'list',
            data: Array.from(linksSet).map((l, i) => ({ name: l, value: 1 })), // value dummy
            unit: ''
        };
    }

    case AnalysisType.TOP_DOMAINS: {
        const domains: Record<string, number> = {};
        const regex = /https?:\/\/(?:www\.)?([-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6})\b/g;
        messages.forEach(r => {
            const matches = r.content.match(regex);
            if(matches) {
                matches.forEach(m => {
                    try {
                        const url = new URL(m);
                        domains[url.hostname] = (domains[url.hostname] || 0) + 1;
                    } catch(e){}
                });
            }
        });
        return {
            title: 'Domínios mais compartilhados',
            description: 'Sites externos mais frequentes nas conversas.',
            type: 'bar',
            data: getTop(domains, 10),
            unit: 'links'
        };
    }

    case AnalysisType.SYSTEM_MESSAGES: {
        // Simple heuristic for system messages
        const sysMsgs = messages.filter(m => {
            const txt = m.content.toLowerCase();
            return (
                m.author === 'System' || 
                txt.includes('as mensagens e as chamadas são protegidas') ||
                txt.includes('adicionou') ||
                txt.includes('removeu') ||
                txt.includes('saiu do grupo') ||
                txt.includes('criou o grupo') ||
                txt.includes('mudou o nome do grupo') ||
                txt.includes('mudou a imagem do grupo') ||
                txt.includes('entrou usando o link')
            );
        }).map(m => ({ name: `${m.date.toLocaleDateString()} - ${m.content}`, value: 1 }));
        
        return {
            title: 'Mensagens de sistema',
            description: 'Entradas, saídas e alterações no grupo.',
            type: 'list',
            data: sysMsgs,
            unit: ''
        };
    }

    // --- Existing Behavioral Prompts ---

    case AnalysisType.QUESTIONS:
      return {
        title: 'Quem faz mais perguntas?',
        description: 'Contagem de mensagens contendo ponto de interrogação "?".',
        type: 'bar',
        data: getTop(countByAuthor(messages, m => m.content.includes('?'))),
        unit: 'perguntas'
      };

    case AnalysisType.LONG_MESSAGES: {
      const charCounts: Record<string, number> = {};
      const msgCounts: Record<string, number> = {};
      messages.forEach(m => {
        if (m.content.length > 0 && !m.content.includes('omitid')) {
          charCounts[m.author] = (charCounts[m.author] || 0) + m.content.length;
          msgCounts[m.author] = (msgCounts[m.author] || 0) + 1;
        }
      });
      const avg: Record<string, number> = {};
      Object.keys(charCounts).forEach(author => {
        if (msgCounts[author] > 5) { // Filter out low sample size
          avg[author] = Math.round(charCounts[author] / msgCounts[author]);
        }
      });
      return {
        title: 'Quem escreve os maiores textos?',
        description: 'Média de caracteres por mensagem (mínimo 5 mensagens enviadas).',
        type: 'bar',
        data: getTop(avg),
        unit: 'caracteres/msg'
      };
    }

    case AnalysisType.AUDIOS:
      return {
        title: 'Quem manda mais áudios?',
        description: 'Baseado em mensagens marcadas como "áudio omitido" ou arquivos .opus/.mp3.',
        type: 'pie',
        data: getTop(countByAuthor(messages, m => 
          m.content.toLowerCase().includes('áudio omitido') || 
          m.content.toLowerCase().includes('audio omitted') || 
          m.content.endsWith('.opus')
        )),
        unit: 'áudios'
      };

    case AnalysisType.EMOJIS:
      return {
        title: 'Quem usa mais emojis?',
        description: 'Contagem total de mensagens contendo emojis.',
        type: 'bar',
        data: getTop(countByAuthor(messages, m => /\p{Emoji}/u.test(m.content))),
        unit: 'mensagens c/ emoji'
      };

    case AnalysisType.LINKS:
      return {
        title: 'Quem compartilha mais links?',
        description: 'Usuários que mais enviam URLs nas mensagens.',
        type: 'bar',
        data: getTop(countByAuthor(messages, m => /https?:\/\//.test(m.content))),
        unit: 'links'
      };

    case AnalysisType.PHOTOS:
      return {
        title: 'Quem envia mais fotos?',
        description: 'Baseado em mensagens marcadas como "imagem omitida" ou "image omitted".',
        type: 'pie',
        data: getTop(countByAuthor(messages, m => 
          m.content.toLowerCase().includes('imagem omitida') || 
          m.content.toLowerCase().includes('image omitted') ||
          m.content.toLowerCase().includes('foto omitida')
        )),
        unit: 'fotos'
      };

    case AnalysisType.START_CONVO: {
      const starts: Record<string, number> = {};
      for (let i = 1; i < messages.length; i++) {
        const diff = messages[i].date.getTime() - messages[i-1].date.getTime();
        // If more than 4 hours passed, consider it a new conversation start
        if (diff > 4 * 60 * 60 * 1000) {
          starts[messages[i].author] = (starts[messages[i].author] || 0) + 1;
        }
      }
      return {
        title: 'Quem inicia mais conversas?',
        description: 'Usuário que envia a primeira mensagem após um silêncio de 4 horas.',
        type: 'bar',
        data: getTop(starts),
        unit: 'inícios'
      };
    }

    case AnalysisType.FAST_REPLY: {
      const replyTimes: Record<string, number[]> = {};
      for (let i = 1; i < messages.length; i++) {
        const prev = messages[i-1];
        const curr = messages[i];
        if (prev.author !== curr.author) {
            const diffSeconds = (curr.date.getTime() - prev.date.getTime()) / 1000;
            // Only count replies within 1 hour to exclude "starts conversation"
            if (diffSeconds < 3600 && diffSeconds > 0) {
                if (!replyTimes[curr.author]) replyTimes[curr.author] = [];
                replyTimes[curr.author].push(diffSeconds);
            }
        }
      }
      const avgReply: Record<string, number> = {};
      Object.keys(replyTimes).forEach(author => {
          const times = replyTimes[author];
          if (times.length > 10) {
            const avg = times.reduce((a, b) => a + b, 0) / times.length;
            avgReply[author] = Math.round(avg);
          }
      });
      // Sort ascending (faster is better)
      const sorted = Object.entries(avgReply).sort(([, a], [, b]) => a - b).slice(0, 10).map(([n, v]) => ({ name: n, value: v }));
      return {
        title: 'Quem responde mais rápido?',
        description: 'Tempo médio de resposta (em segundos) a outro participante.',
        type: 'list',
        data: sorted,
        unit: 'segundos'
      };
    }

    case AnalysisType.DAILY_PARTICIPATION: {
        const daysActive: Record<string, Set<string>> = {};
        messages.forEach(m => {
            const day = m.date.toDateString();
            if (!daysActive[m.author]) daysActive[m.author] = new Set();
            daysActive[m.author].add(day);
        });
        const counts: Record<string, number> = {};
        Object.keys(daysActive).forEach(a => counts[a] = daysActive[a].size);
        return {
            title: 'Quem participa todos os dias?',
            description: 'Número de dias únicos em que o usuário enviou pelo menos uma mensagem.',
            type: 'bar',
            data: getTop(counts),
            unit: 'dias'
        };
    }

    case AnalysisType.LATE_NIGHT:
        return {
            title: 'Quem envia mais mensagens de madrugada?',
            description: 'Mensagens enviadas entre 00:00 e 06:00.',
            type: 'bar',
            data: getTop(countByAuthor(messages, m => {
                const h = m.date.getHours();
                return h >= 0 && h < 6;
            })),
            unit: 'msgs'
        };

    case AnalysisType.BUSINESS_HOURS:
        return {
            title: 'Quem envia mais mensagens no horário comercial?',
            description: 'Mensagens enviadas seg-sex entre 09:00 e 18:00.',
            type: 'bar',
            data: getTop(countByAuthor(messages, m => {
                const h = m.date.getHours();
                const d = m.date.getDay(); // 0 is sun, 6 is sat
                return h >= 9 && h < 18 && d !== 0 && d !== 6;
            })),
            unit: 'msgs'
        };

    case AnalysisType.MENTIONS:
        return {
            title: 'Quem menciona mais pessoas?',
            description: 'Mensagens contendo o caractere "@".',
            type: 'bar',
            data: getTop(countByAuthor(messages, m => m.content.includes('@'))),
            unit: 'menções'
        };

    case AnalysisType.ENGAGEMENT: {
        // Simple metric: How many messages follow this user's message within 2 minutes?
        const engagement: Record<string, number> = {};
        for(let i=0; i<messages.length - 1; i++) {
            const curr = messages[i];
            const next = messages[i+1];
            if (curr.author !== next.author) {
                const diff = next.date.getTime() - curr.date.getTime();
                if (diff < 2 * 60 * 1000) { // Reply within 2 mins
                    engagement[curr.author] = (engagement[curr.author] || 0) + 1;
                }
            }
        }
        return {
            title: 'Quem provoca mais engajamento?',
            description: 'Total de vezes que alguém respondeu ao usuário em menos de 2 minutos.',
            type: 'bar',
            data: getTop(engagement),
            unit: 'respostas rápidas'
        };
    }

    case AnalysisType.VIDEOS:
        return {
            title: 'Quem envia mais vídeos?',
            description: 'Baseado em "vídeo omitido" ou "video omitted".',
            type: 'pie',
            data: getTop(countByAuthor(messages, m => 
                m.content.toLowerCase().includes('vídeo omitido') || 
                m.content.toLowerCase().includes('video omitted') || 
                m.content.endsWith('.mp4')
            )),
            unit: 'vídeos'
        };

    case AnalysisType.DOCUMENTS:
        return {
            title: 'Quem envia mais documentos?',
            description: 'Baseado em "documento omitido" ou extensões PDF/DOCX.',
            type: 'pie',
            data: getTop(countByAuthor(messages, m => 
                m.content.toLowerCase().includes('documento omitido') || 
                m.content.toLowerCase().includes('document omitted') || 
                m.content.endsWith('.pdf') ||
                m.content.endsWith('.docx')
            )),
            unit: 'docs'
        };

    case AnalysisType.GOOD_MORNING:
        return {
            title: 'Quem mais escreve "Bom Dia"?',
            description: 'Contagem exata da frase "bom dia" (case insensitive).',
            type: 'bar',
            data: getTop(countByAuthor(messages, m => m.content.toLowerCase().includes('bom dia'))),
            unit: 'bom dias'
        };

    case AnalysisType.PROFANITY:
        // Basic list, kept illustrative
        const badWords = ['merda', 'caralho', 'porra', 'bosta', 'pqp', 'foda', 'puta', 'carai'];
        return {
            title: 'Quem mais usa palavrões?',
            description: 'Baseado em uma lista básica de palavras de baixo calão.',
            type: 'bar',
            data: getTop(countByAuthor(messages, m => {
                const words = m.content.toLowerCase().split(/\s+/);
                return words.some(w => badWords.includes(w));
            })),
            unit: 'msgs com palavrão'
        };

    case AnalysisType.REPEATED: {
        // This is computationally heavy, simple approximation: exact duplicate content by same author
        const counts: Record<string, number> = {};
        const history: Set<string> = new Set();
        messages.forEach(m => {
            if (m.content.length > 5 && !m.content.includes('omitid')) {
                const key = `${m.author}:${m.content}`;
                if (history.has(key)) {
                    counts[m.author] = (counts[m.author] || 0) + 1;
                } else {
                    history.add(key);
                }
            }
        });
        return {
            title: 'Quem mais envia mensagens repetidas?',
            description: 'Mensagens idênticas enviadas pelo mesmo autor (spam/copypasta).',
            type: 'bar',
            data: getTop(counts),
            unit: 'repetições'
        };
    }

    case AnalysisType.INTERACTION: {
        // Who talks after the most unique people?
        const interactions: Record<string, Set<string>> = {};
        for (let i = 1; i < messages.length; i++) {
            const prev = messages[i-1];
            const curr = messages[i];
            if (prev.author !== curr.author) {
                if (!interactions[curr.author]) interactions[curr.author] = new Set();
                interactions[curr.author].add(prev.author);
            }
        }
        const counts: Record<string, number> = {};
        Object.keys(interactions).forEach(a => counts[a] = interactions[a].size);
        return {
            title: 'Quem mais interage com todos?',
            description: 'Número de participantes únicos que o usuário respondeu diretamente.',
            type: 'bar',
            data: getTop(counts),
            unit: 'interações únicas'
        };
    }

    case AnalysisType.MOTIVATIONAL:
        const words = ['fé', 'deus', 'acredite', 'sucesso', 'bênção', 'gratidão', 'amém', 'força'];
        return {
            title: 'Quem envia mais mensagens motivacionais?',
            description: 'Baseado em palavras como: fé, deus, sucesso, gratidão, etc.',
            type: 'bar',
            data: getTop(countByAuthor(messages, m => {
                 const content = m.content.toLowerCase();
                 return words.some(w => content.includes(w));
            })),
            unit: 'mensagens'
        };

    case AnalysisType.MOST_LAUGHTER:
        return {
            title: 'Quem ri mais?',
            description: 'Contagem de mensagens com "kkk", "rsrs", "haha" ou emojis de risada.',
            type: 'bar',
            data: getTop(countByAuthor(messages, m => {
                const txt = m.content.toLowerCase();
                const textLaugh = /k{3,}|rs{1,}|ha{3,}|hue{3,}/.test(txt);
                const emojiLaugh = /[\u{1F602}\u{1F923}\u{1F639}\u{1F606}\u{1F604}\u{1F605}]/u.test(m.content);
                return textLaugh || emojiLaugh;
            })),
            unit: 'risadas'
        };

    // --- Fun & Specific Prompts ---

    case AnalysisType.LAUGHS_KING:
      return {
        title: 'Quem é o rei das risadas histéricas?',
        description: 'Usuários com mais mensagens contendo kkkk, hahaha ou rsrsrs longos (5+ letras).',
        type: 'bar',
        data: getTop(countByAuthor(messages, m => {
          const content = m.content.toLowerCase();
          return /(k{5,}|ha{5,}|rs{5,})/.test(content);
        })),
        unit: 'risadas longas'
      };

    case AnalysisType.GHOST: {
      const lastSeen: Record<string, Date> = {};
      const maxGap: Record<string, number> = {};
      
      messages.forEach(m => {
        if (!lastSeen[m.author]) {
          lastSeen[m.author] = m.date;
        } else {
          const diff = m.date.getTime() - lastSeen[m.author].getTime();
          if (diff > (maxGap[m.author] || 0)) {
            maxGap[m.author] = diff;
          }
          lastSeen[m.author] = m.date;
        }
      });
      
      const data = Object.entries(maxGap)
        .map(([name, ms]) => ({ name, value: Math.round(ms / (1000 * 60 * 60 * 24)) })) // Days
        .sort((a, b) => b.value - a.value)
        .slice(0, 10);

      return {
        title: 'Quem some e reaparece como fantasma?',
        description: 'Maior intervalo de tempo (em dias) entre duas mensagens consecutivas do mesmo usuário.',
        type: 'list',
        data,
        unit: 'dias sumido'
      };
    }

    case AnalysisType.WRONG_TIME_MORNING:
      return {
        title: 'Quem fala “bom dia” às 15h?',
        description: 'Mensagens contendo "bom dia" enviadas entre 12h e 18h.',
        type: 'bar',
        data: getTop(countByAuthor(messages, m => {
          const h = m.date.getHours();
          return m.content.toLowerCase().includes('bom dia') && h >= 12 && h < 18;
        })),
        unit: 'bom dias atrasados'
      };

    case AnalysisType.QUICK_AUDIO:
      return {
        title: 'Quem manda áudio de 5 minutos dizendo “rapidinho”?',
        description: 'Contagem de mensagens com "rapidinho" ou "falar rápido" (proxy para áudio longo).',
        type: 'bar',
        data: getTop(countByAuthor(messages, m => /rapidinho|falar r[aá]pido/.test(m.content.toLowerCase()))),
        unit: 'mensagens'
      };

    case AnalysisType.UNFINISHED_SENTENCE:
      return {
        title: 'Quem nunca termina uma frase',
        description: 'Mensagens que terminam com reticências (...) ou sem pontuação final (texto > 10 chars).',
        type: 'bar',
        data: getTop(countByAuthor(messages, m => {
          const txt = m.content.trim();
          return txt.length > 10 && (txt.endsWith('...') || !/[.!?]$/.test(txt));
        })),
        unit: 'frases'
      };

    case AnalysisType.ONLY_LAUGHS:
      return {
        title: 'Quem manda “kkk” até sem motivo',
        description: 'Mensagens que consistem APENAS em risadas (kkk, hahaha, rsrs).',
        type: 'bar',
        data: getTop(countByAuthor(messages, m => {
          return /^(k+|ha+|rs+|hue+)+$/i.test(m.content.trim().replace(/[^a-z]/gi, ''));
        })),
        unit: 'msgs só kkk'
      };

    case AnalysisType.RANDOM_TOPIC:
      return {
        title: 'Quem sempre muda de assunto do nada',
        description: 'Uso de expressões como "mudando de assunto", "nada a ver", "aleatório".',
        type: 'bar',
        data: getTop(countByAuthor(messages, m => {
          const c = m.content.toLowerCase();
          return c.includes('mudando de assunto') || c.includes('nada a ver') || c.includes('aleatório') || c.includes('falando nisso');
        })),
        unit: 'mudanças'
      };

    case AnalysisType.STICKERS:
      return {
        title: 'Quem manda mais stickers aleatórios',
        description: 'Contagem de mensagens marcadas como Sticker/Figurinha.',
        type: 'bar',
        data: getTop(countByAuthor(messages, m => {
          const c = m.content.toLowerCase();
          return c.includes('sticker omitted') || c.includes('figurinha omitida');
        })),
        unit: 'stickers'
      };

    case AnalysisType.NOISY_AUDIO:
      return {
        title: 'Quem manda áudio com barulho de panela no fundo',
        description: 'Proxy: Áudios enviados durante horários de refeição (11h-14h e 19h-21h).',
        type: 'bar',
        data: getTop(countByAuthor(messages, m => {
          const h = m.date.getHours();
          const isMealTime = (h >= 11 && h <= 13) || (h >= 19 && h <= 20);
          const isAudio = m.content.toLowerCase().includes('áudio') || m.content.endsWith('.opus');
          return isMealTime && isAudio;
        })),
        unit: 'áudios "de panela"'
      };

    case AnalysisType.REGRET:
      return {
        title: 'Quem mais reclama e depois volta atrás',
        description: 'Mensagens contendo "esquece", "deixa quieto", "ignora" ou "disfarça".',
        type: 'bar',
        data: getTop(countByAuthor(messages, m => {
          const c = m.content.toLowerCase();
          return c.includes('esquece') || c.includes('deixa quieto') || c.includes('ignora') || c.includes('disfarça');
        })),
        unit: 'voltas atrás'
      };

    case AnalysisType.DELETED_MSGS:
      return {
        title: 'Quem mais manda mensagem apagada',
        description: 'Mensagens marcadas como "apagou esta mensagem" ou "deleted this message".',
        type: 'bar',
        data: getTop(countByAuthor(messages, m => {
          const c = m.content.toLowerCase();
          return c.includes('apagou esta mensagem') || c.includes('deleted this message');
        })),
        unit: 'msgs apagadas'
      };

    case AnalysisType.REWRITE: {
      const rewrites: Record<string, number> = {};
      for (let i = 0; i < messages.length - 1; i++) {
        const curr = messages[i];
        const next = messages[i+1];
        const isDeleted = curr.content.toLowerCase().includes('apagou esta mensagem');
        if (isDeleted && curr.author === next.author) {
          rewrites[curr.author] = (rewrites[curr.author] || 0) + 1;
        }
      }
      return {
        title: 'Quem apaga e escreve de novo 10 vezes',
        description: 'Mensagem apagada seguida imediatamente por outra mensagem do mesmo autor.',
        type: 'bar',
        data: getTop(rewrites),
        unit: 'reescritas'
      };
    }

    case AnalysisType.PRINTS:
      return {
        title: 'Quem mais manda print desnecessário',
        description: 'Imagens enviadas com texto "olha isso", "print", "veja".',
        type: 'pie',
        data: getTop(countByAuthor(messages, m => {
          return m.content.toLowerCase().includes('print') || (m.content.includes('imagem') && m.content.toLowerCase().includes('olha'));
        })),
        unit: 'menções a print'
      };

    case AnalysisType.HOPEFUL:
      return {
        title: 'Quem sempre diz “agora vai” e não vai',
        description: 'Contagem da expressão "agora vai".',
        type: 'bar',
        data: getTop(countByAuthor(messages, m => m.content.toLowerCase().includes('agora vai'))),
        unit: 'agora vai'
      };

    case AnalysisType.MEME_WAR: {
      const wars: Record<string, number> = {};
      for (let i = 0; i < messages.length - 1; i++) {
        const curr = messages[i];
        const next = messages[i+1];
        const isImg = (m: Message) => m.content.toLowerCase().includes('imagem omitida');
        if (isImg(curr) && isImg(next) && curr.author !== next.author) {
          wars[curr.author] = (wars[curr.author] || 0) + 1;
          wars[next.author] = (wars[next.author] || 0) + 1;
        }
      }
      return {
        title: 'Quem responde memes com memes',
        description: 'Sequência de imagens (imagem seguida de outra imagem por pessoa diferente).',
        type: 'bar',
        data: getTop(wars),
        unit: 'batalhas'
      };
    }

    case AnalysisType.DISAPPEAR: {
      const counts: Record<string, number> = {};
      for (let i = 0; i < messages.length - 1; i++) {
        const curr = messages[i];
        const next = messages[i+1];
        if (curr.author !== next.author) {
          // Find next message by curr.author
          let nextBySame = null;
          for (let j = i + 1; j < messages.length; j++) {
            if (messages[j].author === curr.author) {
              nextBySame = messages[j];
              break;
            }
          }
          if (nextBySame) {
            const diff = nextBySame.date.getTime() - curr.date.getTime();
            if (diff > 24 * 60 * 60 * 1000) { // 24 hours
              counts[curr.author] = (counts[curr.author] || 0) + 1;
            }
          }
        }
      }
      return {
        title: 'Quem manda mensagem e some quando pedem explicação',
        description: 'Vezes em que o usuário enviou algo e demorou mais de 24h para mandar outra mensagem.',
        type: 'bar',
        data: getTop(counts),
        unit: 'sumiços'
      };
    }

    case AnalysisType.WHISPER:
      return {
        title: 'Quem manda áudio sussurrando como se fosse segredo',
        description: 'Áudios enviados entre 01:00 e 05:00 da manhã.',
        type: 'bar',
        data: getTop(countByAuthor(messages, m => {
          const h = m.date.getHours();
          const isAudio = m.content.toLowerCase().includes('áudio') || m.content.endsWith('.opus');
          return isAudio && h >= 1 && h <= 5;
        })),
        unit: 'áudios madrugada'
      };

    case AnalysisType.FAKE_PROMISE:
      return {
        title: 'Quem manda “vou ver e te aviso” e nunca avisa',
        description: 'Contagem da frase "vou ver e te aviso" ou "te falo".',
        type: 'bar',
        data: getTop(countByAuthor(messages, m => /vou ver e (te aviso|te falo)|vejo e te falo/.test(m.content.toLowerCase()))),
        unit: 'promessas'
      };

    case AnalysisType.ANNOUNCER:
      return {
        title: 'Quem mais diz “cheguei” quando ninguém perguntou',
        description: 'Contagem da palavra "cheguei" isolada ou em destaque.',
        type: 'bar',
        data: getTop(countByAuthor(messages, m => /\bcheguei\b/.test(m.content.toLowerCase()))),
        unit: 'chegadas'
      };

    case AnalysisType.REPETITIVE_ASK: {
       const questionsSeen = new Set<string>();
       const counts: Record<string, number> = {};
       messages.forEach(m => {
         if (m.content.includes('?')) {
           const key = m.content.toLowerCase().trim();
           if (key.length > 5 && questionsSeen.has(key)) {
             counts[m.author] = (counts[m.author] || 0) + 1;
           } else {
             questionsSeen.add(key);
           }
         }
       });
       return {
         title: 'Quem faz a mesma pergunta que já foi respondida',
         description: 'Perguntas repetidas (conteúdo idêntico) no histórico.',
         type: 'bar',
         data: getTop(counts),
         unit: 'repetições'
       };
    }

    case AnalysisType.MIDNIGHT_MASTER:
        return {
            title: 'Quem é o mestre das conversas de madrugada',
            description: 'Volume total de mensagens entre 02:00 e 05:00.',
            type: 'bar',
            data: getTop(countByAuthor(messages, m => {
                const h = m.date.getHours();
                return h >= 2 && h <= 5;
            })),
            unit: 'msgs'
        };

    case AnalysisType.GHOST_RESPONDER: {
        // Users with low total messages but high reply percentage (fast replies)
        const replies: Record<string, number> = {};
        const totals: Record<string, number> = {};
        messages.forEach(m => totals[m.author] = (totals[m.author] || 0) + 1);
        
        for (let i = 1; i < messages.length; i++) {
           if (messages[i].author !== messages[i-1].author) {
             const diff = messages[i].date.getTime() - messages[i-1].date.getTime();
             if (diff < 60000) { // 1 min
               replies[messages[i].author] = (replies[messages[i].author] || 0) + 1;
             }
           }
        }
        
        const ratios: Record<string, number> = {};
        Object.keys(totals).forEach(u => {
           if (totals[u] > 5) { // Minimum sample
             ratios[u] = Math.round(((replies[u] || 0) / totals[u]) * 100);
           }
        });

        return {
            title: 'Quem nunca está online mas aparece respondendo',
            description: '% de mensagens que são respostas imediatas (<1min) a outra pessoa.',
            type: 'bar',
            data: getTop(ratios),
            unit: '% resposta rápida'
        };
    }

    case AnalysisType.CAPS_LOCK:
        return {
            title: 'Quem mais usa caps lock como se estivesse gritando',
            description: 'Mensagens com mais de 70% de letras maiúsculas (mín. 5 letras).',
            type: 'bar',
            data: getTop(countByAuthor(messages, m => {
                const letters = m.content.replace(/[^a-zA-Z]/g, '');
                if (letters.length < 5) return false;
                const upper = letters.replace(/[^A-Z]/g, '').length;
                return (upper / letters.length) > 0.7;
            })),
            unit: 'gritos'
        };

    case AnalysisType.FULL_GREETING:
        return {
            title: 'Quem mais dá bom dia, boa tarde e boa noite na mesma hora',
            description: 'Mensagens contendo pelo menos duas saudações diferentes.',
            type: 'bar',
            data: getTop(countByAuthor(messages, m => {
                const c = m.content.toLowerCase();
                let count = 0;
                if (c.includes('bom dia')) count++;
                if (c.includes('boa tarde')) count++;
                if (c.includes('boa noite')) count++;
                return count >= 2;
            })),
            unit: 'saudações combo'
        };

    case AnalysisType.INVISIBLE:
        return {
            title: 'Quem manda mais mensagens invisíveis',
            description: 'Mensagens que contêm apenas emojis ou espaços em branco.',
            type: 'bar',
            data: getTop(countByAuthor(messages, m => {
                const alpha = m.content.replace(/[^a-zA-Z0-9]/g, '');
                return m.content.length > 0 && alpha.length === 0;
            })),
            unit: 'msgs'
        };

    default:
      return { title: '', description: '', type: 'metric', data: [] };
  }
};