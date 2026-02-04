export interface Chat {
  id: string;
  name: string;
  lastMessage: string;
  time: string;
  unread: number;
  avatar: string;
  isOnline?: boolean;
}

export interface ReplyMessage {
  id: string;
  senderName: string;
  text: string;
  preview?: string; 
  isOutgoing?: boolean;
}

export interface Message {
  id?: string;
  text: string;
  time: string;
  isOutgoing: boolean;
  senderName?: string;
  status?: 'sent' | 'delivered' | 'read';
  isDeleting?: boolean;
  replyTo?: ReplyMessage; 
}