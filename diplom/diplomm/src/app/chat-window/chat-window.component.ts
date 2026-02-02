import { Component, OnInit, OnDestroy, ElementRef, ViewChild, AfterViewChecked, HostListener } from '@angular/core';
import { Subscription } from 'rxjs';
import { ChatService } from '../services/chat.service';
import { Chat, Message } from '../models/chat.model';

@Component({
  selector: 'app-chat-window',
  templateUrl: './chat-window.component.html',
  styleUrls: ['./chat-window.component.css']
})
export class ChatWindowComponent implements OnInit, OnDestroy, AfterViewChecked {
  @ViewChild('messagesContainer') private messagesContainer!: ElementRef;
  
  selectedChat: Chat | null = null;
  messages: Message[] = [];
  newMessage: string = '';
  
  clickedMessageId: string | null = null;
  deletingMessageId: string | null = null;
  
  private subscriptions: Subscription = new Subscription();
  private shouldScrollToBottom = false;

  constructor(private chatService: ChatService) {}

  ngOnInit(): void {
    const chatSub = this.chatService.selectedChat$.subscribe(chat => {
      this.selectedChat = chat;
      if (chat) {
        this.messages = this.chatService.getMessages(chat.id);
        this.shouldScrollToBottom = true;
        this.resetMessageStates();
      }
    });

    this.subscriptions.add(chatSub);
  }

  ngAfterViewChecked(): void {
    if (this.shouldScrollToBottom) {
      this.scrollToBottom();
      this.shouldScrollToBottom = false;
    }
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    const isMessageClick = target.closest('.message-wrapper');
    const isDeleteButton = target.closest('.delete-btn');
    
    if (!isMessageClick && !isDeleteButton) {
      this.clickedMessageId = null;
    }
  }

  sendMessage(): void {
    if (!this.newMessage.trim() || !this.selectedChat) return;

    this.chatService.sendMessage(this.selectedChat.id, this.newMessage);
    this.messages = this.chatService.getMessages(this.selectedChat.id);
    this.newMessage = '';
    this.shouldScrollToBottom = true;
    this.resetMessageStates();
  }

  onKeyPress(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.sendMessage();
    }
  }

  scrollToBottom(): void {
    try {
      this.messagesContainer.nativeElement.scrollTop = 
        this.messagesContainer.nativeElement.scrollHeight;
    } catch (err) {
      console.error('Scroll error:', err);
    }
  }

  getMessageTime(time: string): string {
    return time;
  }

  isTodayMessage(time: string): boolean {
    return !time.includes('Yesterday');
  }

  shouldShowAvatar(index: number): boolean {
    if (this.messages[index].isOutgoing) return false;
    
    if (index === 0) return true;
    
    const currentMessage = this.messages[index];
    const previousMessage = this.messages[index - 1];
    
    return !currentMessage.isOutgoing && 
           (previousMessage.isOutgoing || 
            previousMessage.senderName !== currentMessage.senderName ||
            this.isDifferentTimeGroup(currentMessage.time, previousMessage.time));
  }

  private isDifferentTimeGroup(time1: string, time2: string): boolean {
    return time1 !== time2;
  }

  onMessageClick(messageId: string, event: MouseEvent): void {
    event.stopPropagation(); 
    
    if (this.deletingMessageId === messageId) {
      return; 
    }
    
    if (this.clickedMessageId === messageId) {
      this.clickedMessageId = null;
    } else {
      this.clickedMessageId = messageId;
    }
  }

  deleteMessage(messageId: string, event: MouseEvent): void {
    event.stopPropagation(); 
    
    if (!this.selectedChat) return;
    
    this.deletingMessageId = messageId;
    
    setTimeout(() => {
      this.chatService.deleteMessage(this.selectedChat!.id, messageId);
      this.messages = this.chatService.getMessages(this.selectedChat!.id);
      this.deletingMessageId = null;
      this.clickedMessageId = null;
    }, 300); 
  }

  private resetMessageStates(): void {
    this.clickedMessageId = null;
    this.deletingMessageId = null;
  }

  shouldShowDeleteButton(messageId: string): boolean {
    return this.clickedMessageId === messageId && this.deletingMessageId !== messageId;
  }

  getMessageClass(messageId: string): string {
    if (this.deletingMessageId === messageId) {
      return 'deleting';
    }
    return '';
  }

  isMessageActive(messageId: string): boolean {
    return this.clickedMessageId === messageId;
  }
}