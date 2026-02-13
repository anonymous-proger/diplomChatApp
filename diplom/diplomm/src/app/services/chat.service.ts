import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Chat, Message, ReplyMessage } from '../models/chat.model';
import { UserProfile } from '../profile/profile.component';

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  private currentUser: UserProfile = {
    name: 'John Doe',
    avatar: 'assets/images/user.png',
    phone: '+1 (555) 123-4567',
    registeredAt: 'March 15, 2023'
  };

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
      lastMessage: 'ты где?',
      time: '09:15',
      unread: 0,
      avatar: 'assets/images/friend.png',
      isOnline: false
    },
    {
      id: '3',
      name: 'Работа',
      lastMessage: 'почему опаздываем?',
      time: 'Вчера',
      unread: 0,
      avatar: 'assets/images/work.png',
      isOnline: true
    }
  ];

  private messages: { [chatId: string]: Message[] } = {
    '1': [
      { 
        id: '1_1', 
        text: 'Привет! Как дела?', 
        time: '10:25', 
        isOutgoing: false, 
        senderName: 'User',
        avatar: 'assets/images/user.png'
      },
      {
        id: '1_2',
        text: 'Привет! Всё отлично, а у тебя?',
        time: '10:26',
        isOutgoing: true,
        status: 'read',
        senderName: 'User',
        avatar: 'assets/images/user.png'
      },
      {
        id: '1_3',
        text: 'Тоже хорошо! Чем занимаешься?',
        time: '10:27',
        isOutgoing: false,
        senderName: 'User',
        avatar: 'assets/images/user.png'
      }
    ],
    '2': [
      {
        id: '2_1',
        text: 'ты где?',
        time: '09:15',
        isOutgoing: false,
        senderName: 'друг',
        avatar: 'assets/images/friend.png'
      }
    ],
    '3': [
      {
        id: '3_1',
        text: 'почему опаздываем?',
        time: 'Вчера',
        isOutgoing: false,
        senderName: 'Работа',
        avatar: 'assets/images/work.png'
      }
    ]
  };

  private selectedChatSubject = new BehaviorSubject<Chat | null>(this.chats[0]);
  selectedChat$ = this.selectedChatSubject.asObservable();

  private chatsSubject = new BehaviorSubject<Chat[]>(this.chats);
  chats$ = this.chatsSubject.asObservable();

  private currentUserSubject = new BehaviorSubject<UserProfile>(this.currentUser);
  currentUser$ = this.currentUserSubject.asObservable();

  constructor() {}

  getCurrentUser(): UserProfile {
    return this.currentUser;
  }

  updateCurrentUser(user: Partial<UserProfile>): void {
    this.currentUser = { ...this.currentUser, ...user };
    this.currentUserSubject.next(this.currentUser);
  }

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

  sendMessage(chatId: string, text: string, replyTo?: ReplyMessage): void {
    if (!this.messages[chatId]) {
      this.messages[chatId] = [];
    }

    const newMessage: Message = {
      id: `${chatId}_${Date.now()}`,
      text,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isOutgoing: true,
      status: 'sent',
      replyTo: replyTo,
      senderName: this.currentUser.name,
      avatar: this.currentUser.avatar
    };

    this.messages[chatId].push(newMessage);

    const chatIndex = this.chats.findIndex(chat => chat.id === chatId);
    if (chatIndex !== -1) {
      this.chats[chatIndex].lastMessage = text;
      this.chats[chatIndex].time = newMessage.time;
      this.chatsSubject.next([...this.chats]);
    }
  }

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