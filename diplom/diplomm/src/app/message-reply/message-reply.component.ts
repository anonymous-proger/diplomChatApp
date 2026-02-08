import { Component, Input, Output, EventEmitter } from '@angular/core';
import { ReplyMessage } from '../models/chat.model';

@Component({
  selector: 'app-message-reply',
  templateUrl: './message-reply.component.html',
  styleUrls: ['./message-reply.component.css']
})
export class MessageReplyComponent {
  @Input() replyTo: ReplyMessage | null = null;
  @Output() replyClicked = new EventEmitter<string>();

  getReplyIcon(): string {
    if (!this.replyTo) return '↩️';
    
    return this.replyTo.isOutgoing ? '↪️' : '↩️';
  }
  
  getBorderColor(): string {
    if (!this.replyTo) return '#4a6cf7';
    
    return this.replyTo.isOutgoing ? '#4a6cf7' : '#718096';
  }
  
  getReplyTitle(): string {
    if (!this.replyTo) return '';
    
    if (this.replyTo.isOutgoing) {
      return 'You';
    } else {
      return this.replyTo.senderName || 'Unknown';
    }
  }

  onReplyClick(): void {
    if (this.replyTo?.id) {
      this.replyClicked.emit(this.replyTo.id);
    }
  }
}