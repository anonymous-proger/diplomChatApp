import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Chat, Message } from '../models/chat.model';

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  private chats: Chat[] = [
    {
      id: '1',
      name: 'user',
      lastMessage: 'Привет! Как дела?',
      time: '10:30',
      unread: 0,
      avatar: 'assets/images/user.png',
      isOnline: true
    },
    {
      id: '2',
      name: 'друг',
      lastMessage: 'жду тебя завтра',
      time: '09:15',
      unread: 0,
      avatar: 'assets/images/friend.png',
      isOnline: false
    },
    {
      id: '3',
      name: 'работа',
      lastMessage: 'почему опаздываем?',
      time: 'Вчера',
      unread: 0,
      avatar: 'assets/images/work.png',
      isOnline: true
    }
  ];

  private messages: { [chatId: string]: Message[] } = {
    '1': [
      { id: '1_1', text: 'Привет! Как дела?', time: '10:25', isOutgoing: false, senderName: 'user' },
       { id: '1_2', text: 'Привет! Как дела?', time: '10:25', isOutgoing: false, senderName: 'user' },
    ],
    '2': [
      { id: '2_1', text: 'жду тебя завтра', time: '09:10', isOutgoing: true },
    
    ],
    '3': [
      { id: '3_1', text: 'почему опаздываем?', time: 'Вчера, 10:00', isOutgoing: false, senderName: 'работа' },
    ]
  };

  private selectedChatSubject = new BehaviorSubject<Chat | null>(this.chats[0]);
  selectedChat$ = this.selectedChatSubject.asObservable();

  private chatsSubject = new BehaviorSubject<Chat[]>(this.chats);
  chats$ = this.chatsSubject.asObservable();

  constructor() {}

  getChats(): Chat[] {
    return this.chats;
  }

  getChatById(id: string): Chat | undefined {
    return this.chats.find(chat => chat.id === id);
  }

  selectChat(chatId: string): void {
    const chat = this.getChatById(chatId);
    if (chat) {
      this.selectedChatSubject.next(chat);
    }
  }

  getMessages(chatId: string): Message[] {
    return this.messages[chatId] || [];
  }

  sendMessage(chatId: string, text: string): void {
    if (!this.messages[chatId]) {
      this.messages[chatId] = [];
    }

    const newMessage: Message = {
      id: `${chatId}_${Date.now()}`,
      text,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isOutgoing: true,
      status: 'sent'
    };

    this.messages[chatId].push(newMessage);

    const chatIndex = this.chats.findIndex(chat => chat.id === chatId);
    if (chatIndex !== -1) {
      this.chats[chatIndex].lastMessage = text;
      this.chats[chatIndex].time = newMessage.time;
      this.chatsSubject.next([...this.chats]);
    }
  }

  // Удаление сообщения
  deleteMessage(chatId: string, messageId: string): void {
    if (!this.messages[chatId]) return;

    const messageIndex = this.messages[chatId].findIndex(msg => msg.id === messageId);
    if (messageIndex !== -1) {
      const isLastMessage = messageIndex === this.messages[chatId].length - 1;
      
      this.messages[chatId].splice(messageIndex, 1);
      
      if (isLastMessage && this.messages[chatId].length > 0) {
        const lastMessage = this.messages[chatId][this.messages[chatId].length - 1];
        const chatIndex = this.chats.findIndex(chat => chat.id === chatId);
        
        if (chatIndex !== -1) {
          this.chats[chatIndex].lastMessage = lastMessage.text;
          this.chats[chatIndex].time = lastMessage.time;
          this.chatsSubject.next([...this.chats]);
        }
      }
      
      if (this.messages[chatId].length === 0) {
        const chatIndex = this.chats.findIndex(chat => chat.id === chatId);
        if (chatIndex !== -1) {
          this.chats[chatIndex].lastMessage = 'Нет сообщений';
          this.chats[chatIndex].time = '';
          this.chatsSubject.next([...this.chats]);
        }
      }
    }
  }

  searchChats(searchTerm: string): Chat[] {
    if (!searchTerm.trim()) {
      return this.chats;
    }

    const term = searchTerm.toLowerCase();
    return this.chats.filter(chat => 
      chat.name.toLowerCase().includes(term) ||
      chat.lastMessage.toLowerCase().includes(term)
    );
  }
}