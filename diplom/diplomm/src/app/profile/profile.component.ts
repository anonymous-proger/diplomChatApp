import { Component, Output, EventEmitter, HostListener } from '@angular/core';

export interface UserProfile {
  name: string;
  avatar: string;
  phone: string;
  registeredAt: string;
}

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfilePopupComponent {
  @Output() close = new EventEmitter<void>();

  user: UserProfile = {
    name: 'user',
    avatar: 'assets/images/friend.png',
    phone: '8 800 555 35 35',
    registeredAt: ' 15.01.23'
  };

  onClose(): void {
    this.close.emit();
  }

  onOverlayClick(event: MouseEvent): void {
    if ((event.target as HTMLElement).classList.contains('profile-overlay')) {
      this.onClose();
    }
  }

  @HostListener('document:keydown.escape')
  onEscapePress(): void {
    this.onClose();
  }
}