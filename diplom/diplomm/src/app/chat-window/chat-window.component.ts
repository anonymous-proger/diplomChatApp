import { Component, OnInit, OnDestroy, ElementRef, ViewChild, AfterViewChecked, HostListener } from '@angular/core';
import { Subscription } from 'rxjs';
import { ChatService } from '../services/chat.service';
import { ReplyService } from '../services/reply.service';
import { MessageSearchService, SearchState, SearchResult } from '../services/message-search.service';
import { Chat, Message, ReplyMessage } from '../models/chat.model';

@Component({
  selector: 'app-chat-window',
  templateUrl: './chat-window.component.html',
  styleUrls: ['./chat-window.component.css']
})
export class ChatWindowComponent implements OnInit, OnDestroy, AfterViewChecked {
  @ViewChild('messagesContainer') private messagesContainer!: ElementRef;
  @ViewChild('messageInput') private messageInput!: ElementRef;
  
  selectedChat: Chat | null = null;
  messages: Message[] = [];
  newMessage: string = '';
  
  activeMessageId: string | null = null;
  deletingMessageId: string | null = null;
  
  showEmojiPanel: boolean = false;
  
  replyState: any = null;
  searchState: SearchState | null = null;
  
  private subscriptions: Subscription = new Subscription();
  private shouldScrollToBottom = false;

  constructor(
    private chatService: ChatService,
    private replyService: ReplyService,
    private messageSearchService: MessageSearchService
  ) {}

  ngOnInit(): void {
    const chatSub = this.chatService.selectedChat$.subscribe(chat => {
      this.selectedChat = chat;
      if (chat) {
        this.messages = this.chatService.getMessages(chat.id);
        this.shouldScrollToBottom = true;
        this.resetMessageStates();
        this.closeEmojiPanel();
        this.replyService.cancelReply();
        this.messageSearchService.stopSearch();
      }
    });

    const replySub = this.replyService.replyState$.subscribe(state => {
      this.replyState = state;
    });

    const searchSub = this.messageSearchService.searchState$.subscribe(state => {
      this.searchState = state;
      if (state.currentIndex >= 0 && state.results.length > 0) {
        this.scrollToSearchResult(state.results[state.currentIndex]);
      }
    });

    this.subscriptions.add(chatSub);
    this.subscriptions.add(replySub);
    this.subscriptions.add(searchSub);
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
    const isActionButton = target.closest('.action-btn');
    
    if (!isMessageClick && !isActionButton) {
      this.activeMessageId = null;
    }
  }

  sendMessage(): void {
    if (!this.newMessage.trim() || !this.selectedChat) return;

    const replyState = this.replyService.getCurrentState();
    let replyTo: ReplyMessage | undefined = undefined;
    
    if (replyState.isReplying && replyState.replyTo) {
      replyTo = {
        id: replyState.originalMessageId || '',
        senderName: replyState.replyTo.senderName,
        text: replyState.replyTo.text,
        isOutgoing: replyState.replyTo.isOutgoing,
        preview: replyState.replyTo.preview || this.getTextPreview(replyState.replyTo.text)
      };
    }

    this.chatService.sendMessage(this.selectedChat.id, this.newMessage, replyTo);
    this.messages = this.chatService.getMessages(this.selectedChat.id);
    this.newMessage = '';
    this.shouldScrollToBottom = true;
    this.resetMessageStates();
    this.replyService.completeReply();
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

  scrollToMessage(messageId: string): void {
    setTimeout(() => {
      try {
        const messageElement = document.getElementById(`message-${messageId}`);
        if (messageElement) {
          const container = this.messagesContainer.nativeElement;
          const elementTop = messageElement.offsetTop;
          const elementHeight = messageElement.offsetHeight;
          const containerHeight = container.clientHeight;
          const scrollTo = elementTop - (containerHeight / 2) + (elementHeight / 2);
          
          container.scrollTo({
            top: scrollTo,
            behavior: 'smooth'
          });
          
          this.highlightMessage(messageId);
        }
      } catch (err) {
        console.error('Scroll to message error:', err);
      }
    }, 100);
  }

  private scrollToSearchResult(result: SearchResult): void {
    setTimeout(() => {
      try {
        const messageElement = document.getElementById(`message-${result.message.id}`);
        if (messageElement) {
          const container = this.messagesContainer.nativeElement;
          const elementTop = messageElement.offsetTop;
          const elementHeight = messageElement.offsetHeight;
          const containerHeight = container.clientHeight;
          const scrollTo = elementTop - (containerHeight / 2) + (elementHeight / 2);
          
          container.scrollTo({
            top: scrollTo,
            behavior: 'smooth'
          });
          
          this.highlightMessage(result.message.id || '');
        }
      } catch (err) {
        console.error('Scroll to search result error:', err);
      }
    }, 100);
  }

  private highlightMessage(messageId: string): void {
    const highlightedElements = document.querySelectorAll('.message-highlight');
    highlightedElements.forEach(el => {
      el.classList.remove('message-highlight');
    });
    
    const messageElement = document.getElementById(`message-${messageId}`);
    if (messageElement) {
      const messageWrapper = messageElement.closest('.message-wrapper');
      if (messageWrapper) {
        messageWrapper.classList.add('message-highlight');
        
        setTimeout(() => {
          messageWrapper.classList.remove('message-highlight');
        }, 2000);
      }
    }
  }

  onReplyClick(messageId: string): void {
    this.scrollToMessage(messageId);
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
    
    if (this.activeMessageId === messageId) {
      this.activeMessageId = null;
    } else {
      this.activeMessageId = messageId;
    }
  }

  shouldShowActions(messageId: string): boolean {
    return this.activeMessageId === messageId && this.deletingMessageId !== messageId;
  }

  deleteMessage(messageId: string, event: MouseEvent): void {
    event.stopPropagation();
    
    if (!this.selectedChat) return;
    
    this.deletingMessageId = messageId;
    
    setTimeout(() => {
      this.chatService.deleteMessage(this.selectedChat!.id, messageId);
      this.messages = this.chatService.getMessages(this.selectedChat!.id);
      this.deletingMessageId = null;
      this.activeMessageId = null;
    }, 300);
  }

  startReply(message: Message, event: MouseEvent): void {
    event.stopPropagation();
    
    if (!message.id) return;
    
    const replyTo: ReplyMessage = {
      id: message.id,
      senderName: message.senderName || this.selectedChat?.name || 'Unknown',
      text: message.text,
      isOutgoing: message.isOutgoing,
      preview: this.getTextPreview(message.text)
    };
    
    this.replyService.startReply(replyTo, message.id);
    this.activeMessageId = null;
    
    setTimeout(() => {
      if (this.messageInput) {
        this.messageInput.nativeElement.focus();
      }
    }, 100);
  }

  cancelReply(): void {
    this.replyService.cancelReply();
  }

  private resetMessageStates(): void {
    this.activeMessageId = null;
    this.deletingMessageId = null;
  }

  getMessageClass(messageId: string): string {
    if (this.deletingMessageId === messageId) {
      return 'deleting';
    }
    return '';
  }

  isMessageActive(messageId: string): boolean {
    return this.activeMessageId === messageId;
  }

  toggleEmojiPanel(event: MouseEvent): void {
    event.stopPropagation();
    
    if (this.showEmojiPanel) {
      this.closeEmojiPanel();
    } else {
      this.openEmojiPanel();
    }
  }

  openEmojiPanel(): void {
    this.showEmojiPanel = true;
    setTimeout(() => {
      if (this.messageInput) {
        this.messageInput.nativeElement.focus();
      }
    }, 100);
  }

  closeEmojiPanel(): void {
    this.showEmojiPanel = false;
  }

  onEmojiSelected(emoji: string): void {
    if (this.messageInput) {
      this.newMessage += emoji;
      this.messageInput.nativeElement.focus();
    }
  }

  private getTextPreview(text: string, maxLength: number = 100): string {
    if (text.length <= maxLength) {
      return text;
    }
    return text.substring(0, maxLength) + '...';
  }

  // Методы для поиска
  toggleSearch(): void {
    if (this.searchState?.isSearching) {
      this.messageSearchService.stopSearch();
    } else {
      this.messageSearchService.startSearch();
    }
  }

  onSearchTextChanged(searchText: string): void {
    this.messageSearchService.searchMessages(this.messages, searchText);
  }

  onNextSearchResult(): void {
    this.messageSearchService.goToNextResult();
  }

  onPrevSearchResult(): void {
    this.messageSearchService.goToPrevResult();
  }

  onCloseSearch(): void {
    this.messageSearchService.stopSearch();
  }

  isSearchResult(messageId: string, index: number): boolean {
    if (!this.searchState?.results.length) return false;
    
    return this.searchState.results.some(result => 
      result.message.id === messageId || result.index === index
    );
  }

  isCurrentSearchResult(messageId: string, index: number): boolean {
    if (!this.searchState?.results.length || this.searchState.currentIndex < 0) return false;
    
    const currentResult = this.searchState.results[this.searchState.currentIndex];
    return currentResult.message.id === messageId || currentResult.index === index;
  }
}