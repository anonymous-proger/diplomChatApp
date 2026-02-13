import { Component } from '@angular/core';
import { UserProfile } from '../profile/profile.component';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent {
  showProfile = false;
  
  userProfile: UserProfile = {
    name: 'user',
    avatar: 'assets/images/friend.png',
    phone: '8 800 555 35 35',
    registeredAt: ' 15.01.23'
  };

  openProfile(): void {
    this.showProfile = true;
  }

  closeProfile(): void {
    this.showProfile = false;
  }
}