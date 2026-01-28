export interface Chat {
  id: string;
  name: string;
  lastMessage: string;
  time: string;
  unread: number;
  avatar: string;
  isOnline?: boolean;
}

export interface Message {
  id?: string;
  text: string;
  time: string;
  isOutgoing: boolean;
  senderName?: string;
  status?: 'sent' | 'delivered' | 'read';
}