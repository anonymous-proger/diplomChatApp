import { Component, OnInit, OnDestroy, ElementRef, ViewChild, AfterViewChecked, HostListener } from '@angular/core';
import { Subscription } from 'rxjs';
import { ChatService } from '../services/chat.service';
import { ReplyService } from '../services/reply.service';
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
  
  private subscriptions: Subscription = new Subscription();
  private shouldScrollToBottom = false;

  constructor(
    private chatService: ChatService,
    private replyService: ReplyService
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
      }
    });

    const replySub = this.replyService.replyState$.subscribe(state => {
      this.replyState = state;
      
      if (state.isReplying && this.messageInput) {
        setTimeout(() => {
          this.messageInput.nativeElement.focus();
        }, 100);
      }
    });

    this.subscriptions.add(chatSub);
    this.subscriptions.add(replySub);
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
    
    const isEmojiButton = target.closest('.emoji-btn');
    const isEmojiPanel = target.closest('.emoji-panel');
    const isEmojiPanelButton = target.closest('[title="Emoji"]');
    
    if (!isEmojiButton && !isEmojiPanel && !isEmojiPanelButton) {
      this.closeEmojiPanel();
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
    this.closeEmojiPanel();
    this.replyService.completeReply();
  }

  onKeyPress(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.sendMessage();
    }
    
    if (event.key === 'Escape' && this.showEmojiPanel) {
      this.closeEmojiPanel();
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

  // НОВЫЙ МЕТОД: Прокрутка к определенному сообщению
  scrollToMessage(messageId: string): void {
    setTimeout(() => {
      try {
        const messageElement = document.getElementById(`message-${messageId}`);
        if (messageElement) {
          // Находим контейнер сообщений
          const container = this.messagesContainer.nativeElement;
          
          // Вычисляем позицию для прокрутки
          const elementTop = messageElement.offsetTop;
          const elementHeight = messageElement.offsetHeight;
          const containerHeight = container.clientHeight;
          
          // Прокручиваем так, чтобы сообщение было в середине контейнера
          const scrollTo = elementTop - (containerHeight / 2) + (elementHeight / 2);
          
          container.scrollTo({
            top: scrollTo,
            behavior: 'smooth'
          });
          
          // Подсвечиваем сообщение на которое перешли
          this.highlightMessage(messageId);
        } else {
          console.warn(`Message with id ${messageId} not found`);
        }
      } catch (err) {
        console.error('Scroll to message error:', err);
      }
    }, 100);
  }

  // НОВЫЙ МЕТОД: Подсветка сообщения
  private highlightMessage(messageId: string): void {
    // Сначала убираем подсветку со всех сообщений
    const highlightedElements = document.querySelectorAll('.message-highlight');
    highlightedElements.forEach(el => {
      el.classList.remove('message-highlight');
    });
    
    // Находим нужное сообщение и добавляем подсветку
    const messageElement = document.getElementById(`message-${messageId}`);
    if (messageElement) {
      const messageWrapper = messageElement.closest('.message-wrapper');
      if (messageWrapper) {
        messageWrapper.classList.add('message-highlight');
        
        // Автоматически убираем подсветку через 2 секунды
        setTimeout(() => {
          messageWrapper.classList.remove('message-highlight');
        }, 2000);
      }
    }
  }

  // НОВЫЙ МЕТОД: Обработчик клика на цитату
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
    
    this.closeEmojiPanel();
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
}