import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { ReplyMessage } from '../models/chat.model';

export interface ReplyState {
  isReplying: boolean;
  replyTo: ReplyMessage | null;
  originalMessageId: string | null;
}

@Injectable({
  providedIn: 'root'
})
export class ReplyService {
  private defaultState: ReplyState = {
    isReplying: false,
    replyTo: null,
    originalMessageId: null
  };

  private replyStateSubject = new BehaviorSubject<ReplyState>(this.defaultState);
  replyState$: Observable<ReplyState> = this.replyStateSubject.asObservable();

  startReply(replyTo: ReplyMessage, originalMessageId: string): void {
    const state: ReplyState = {
      isReplying: true,
      replyTo: {
        ...replyTo,
        preview: this.getTextPreview(replyTo.text)
      },
      originalMessageId
    };
    
    this.replyStateSubject.next(state);
  }

  cancelReply(): void {
    this.replyStateSubject.next(this.defaultState);
  }

  completeReply(): void {
    this.replyStateSubject.next(this.defaultState);
  }

  getCurrentState(): ReplyState {
    return this.replyStateSubject.getValue();
  }

  isCurrentlyReplying(): boolean {
    return this.replyStateSubject.getValue().isReplying;
  }

  private getTextPreview(text: string, maxLength: number = 100): string {
    if (text.length <= maxLength) {
      return text;
    }
    
    return text.substring(0, maxLength) + '...';
  }
}