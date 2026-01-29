import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Chat, Message } from '../models/chat.model';

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  private chats: Chat[] = [
    {
      id: '1',
      name: 'user',
      lastMessage: 'привет',
      time: '10:30',
      unread: 0,
      avatar: "assets/images/user.png",
      isOnline: true
    },
    {
      id: '2',
      name: 'друг',
      lastMessage: 'как дела?',
      time: '09:15',
      unread: 0,
      avatar: 'assets/images/friend.png',
      isOnline: false
    },
    {
      id: '3',
      name: 'работа',
      lastMessage: 'почему опаздваем?',
      time: '10:10',
      unread: 0,
      avatar: 'assets/images/work.png',
      isOnline: true
    }
  ];

  private messages: { [chatId: string]: Message[] } = {
    '1': [
       { text: 'Привет! Как дела?', time: '10:25', isOutgoing: false, senderName: 'User' },
    ],
    '2': [
      
    ],
    '3': [
      
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