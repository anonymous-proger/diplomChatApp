export interface Message {
  id: string;
  text: string;
  time: string;
  isOutgoing: boolean;
  status?: 'sent' | 'delivered' | 'read';
  replyTo?: ReplyMessage;
  senderName?: string;
  avatar?: string;
}

export interface ReplyMessage {
  id: string;
  senderName: string;
  text: string;
  isOutgoing: boolean;
  preview?: string;
}

export interface Chat {
  id: string;
  name: string;
  lastMessage: string;
  time: string;
  unread: number;
  avatar: string;
  isOnline: boolean;
}