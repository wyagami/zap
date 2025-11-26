import { Message } from '../types';

export const parseChat = (text: string): Message[] => {
  const lines = text.split('\n');
  const messages: Message[] = [];
  
  // Regex to match: [DD/MM/YYYY HH:mm:ss] Author: Message OR DD/MM/YYYY HH:mm - Author: Message
  // This handles both iOS and Android export formats broadly found in PT-BR locales
  const regex = /^(\[?(\d{1,2}[\/.-]\d{1,2}[\/.-]\d{2,4})[,]?\s+(\d{1,2}:\d{2}(?::\d{2})?)\]?)[-]?\s*(.*?):\s*(.*)/;
  
  let currentMessage: Message | null = null;

  lines.forEach((line) => {
    // Remove invisible control characters
    const cleanLine = line.replace(/[\u200B-\u200D\uFEFF]/g, ''); 
    const match = cleanLine.match(regex);

    if (match) {
      if (currentMessage) {
        messages.push(currentMessage);
      }

      const dateStr = match[2];
      const timeStr = match[3];
      const author = match[4].trim();
      const content = match[5].trim();

      // Normalize Date
      // Assuming DD/MM/YYYY format for PT-BR
      const [day, month, year] = dateStr.split(/[\/.-]/).map(Number);
      const [hours, minutes, seconds] = timeStr.split(':').map(Number);
      
      const dateObj = new Date(
        year < 100 ? 2000 + year : year, 
        month - 1, 
        day, 
        hours, 
        minutes, 
        seconds || 0
      );

      currentMessage = {
        date: dateObj,
        author: author,
        content: content,
        isSystem: false
      };
    } else {
      // It's a continuation of the previous message or a system message
      if (currentMessage) {
        currentMessage.content += `\n${cleanLine}`;
      } else {
        // Attempt to detect system messages that don't match the standard chat format
        // e.g. "You added X", "Messages are encrypted"
        // This is a rough heuristic
        if (cleanLine.length > 5 && !cleanLine.includes(':')) {
             // System messages usually start with a date too, but no author
             // If we really want to capture them we need another regex. 
             // For now, we skip lines that don't start a valid message block 
             // unless we are inside a message block.
        }
      }
    }
  });

  if (currentMessage) {
    messages.push(currentMessage);
  }

  return messages;
};