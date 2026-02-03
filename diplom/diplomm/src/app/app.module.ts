import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';

import { AppComponent } from './app.component';
import { HeaderComponent } from './header/header.component';
import { ChatPanelComponent } from './chat-panel/chat-panel.component';
import { ChatWindowComponent } from './chat-window/chat-window.component';
import { EmojiPanelComponent } from './emoji-panel/emoji-panel.component';

@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    ChatPanelComponent,
    ChatWindowComponent,
    EmojiPanelComponent 
  ],
  imports: [
    BrowserModule,
    FormsModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }