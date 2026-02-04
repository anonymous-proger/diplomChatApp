import { Component, Input, Output, EventEmitter } from '@angular/core';
import { ReplyMessage } from '../models/chat.model';

@Component({
  selector: 'app-reply-preview',
  templateUrl: './reply-preview.component.html',
  styleUrls: ['./reply-preview.component.css']
})
export class ReplyPreviewComponent {
  @Input() replyTo: ReplyMessage | null = null;
  @Input() originalMessageId: string | null = null;
  
  @Output() cancel = new EventEmitter<void>();
  
  getReplyIcon(): string {
    if (!this.replyTo) return '↩️';
    
    return this.replyTo.isOutgoing ? '↪️' : '↩️';
  }
  
  getReplyTitle(): string {
    if (!this.replyTo) return 'Reply';
    
    if (this.replyTo.isOutgoing) {
      return `Replying to yourself`;
    } else {
      return `Replying to ${this.replyTo.senderName}`;
    }
  }
  
  onCancel(): void {
    this.cancel.emit();
  }
}