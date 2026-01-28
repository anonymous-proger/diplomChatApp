import { Component, OnInit } from '@angular/core';
import { ChatService } from '../services/chat.service';
import { Chat } from '../models/chat.model';

@Component({
  selector: 'app-chat-panel',
  templateUrl: './chat-panel.component.html',
  styleUrls: ['./chat-panel.component.css']
})
export class ChatPanelComponent implements OnInit {
  searchQuery: string = '';
  chats: Chat[] = [];
  filteredChats: Chat[] = [];
  selectedChatId: string | null = null;

  constructor(private chatService: ChatService) {}

  ngOnInit(): void {
    this.chats = this.chatService.getChats();
    this.filteredChats = [...this.chats];

    this.chatService.selectedChat$.subscribe(chat => {
      this.selectedChatId = chat?.id || null;
    });

    if (this.chats.length > 0) {
      this.selectChat(this.chats[0].id);
    }
  }

  selectChat(chatId: string): void {
    this.chatService.selectChat(chatId);
  }

  onSearch(): void {
    if (!this.searchQuery.trim()) {
      this.filteredChats = [...this.chats];
      return;
    }

    this.filteredChats = this.chatService.searchChats(this.searchQuery);
  }

  clearSearch(): void {
    this.searchQuery = '';
    this.filteredChats = [...this.chats];
  }

  getStatusText(chat: Chat): string {
    return chat.isOnline ? 'Online' : 'Offline';
  }
}