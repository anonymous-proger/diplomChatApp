import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Message } from '../models/chat.model';

export interface SearchResult {
  message: Message;
  index: number;
  matches: number;
}

export interface SearchState {
  isSearching: boolean;
  searchText: string;
  results: SearchResult[];
  currentIndex: number;
  totalMatches: number;
}

@Injectable({
  providedIn: 'root'
})
export class MessageSearchService {
  private defaultState: SearchState = {
    isSearching: false,
    searchText: '',
    results: [],
    currentIndex: -1,
    totalMatches: 0
  };

  private searchStateSubject = new BehaviorSubject<SearchState>(this.defaultState);
  searchState$: Observable<SearchState> = this.searchStateSubject.asObservable();

  startSearch(): void {
    const state: SearchState = {
      ...this.defaultState,
      isSearching: true
    };
    this.searchStateSubject.next(state);
  }

  stopSearch(): void {
    this.searchStateSubject.next(this.defaultState);
  }

  searchMessages(messages: Message[], searchText: string): void {
    if (!searchText.trim()) {
      const state: SearchState = {
        isSearching: true,
        searchText: '',
        results: [],
        currentIndex: -1,
        totalMatches: 0
      };
      this.searchStateSubject.next(state);
      return;
    }

    const results: SearchResult[] = [];
    let totalMatches = 0;
    const searchLower = searchText.toLowerCase();

    messages.forEach((message, index) => {
      if (message.text.toLowerCase().includes(searchLower)) {
        const matches = this.countMatches(message.text, searchLower);
        totalMatches += matches;
        results.push({
          message,
          index,
          matches
        });
      }
    });

    const state: SearchState = {
      isSearching: true,
      searchText,
      results,
      currentIndex: results.length > 0 ? 0 : -1,
      totalMatches
    };

    this.searchStateSubject.next(state);
  }

  goToNextResult(): void {
    const currentState = this.searchStateSubject.getValue();
    if (!currentState.results || currentState.results.length === 0) return;

    const nextIndex = (currentState.currentIndex + 1) % currentState.results.length;
    const state: SearchState = {
      ...currentState,
      currentIndex: nextIndex
    };
    this.searchStateSubject.next(state);
  }

  goToPrevResult(): void {
    const currentState = this.searchStateSubject.getValue();
    if (!currentState.results || currentState.results.length === 0) return;

    const prevIndex = currentState.currentIndex === 0 
      ? currentState.results.length - 1 
      : currentState.currentIndex - 1;
    
    const state: SearchState = {
      ...currentState,
      currentIndex: prevIndex
    };
    this.searchStateSubject.next(state);
  }

  getCurrentResult(): SearchResult | null {
    const state = this.searchStateSubject.getValue();
    if (!state.results || state.currentIndex < 0 || state.currentIndex >= state.results.length) {
      return null;
    }
    return state.results[state.currentIndex];
  }

  getCurrentState(): SearchState {
    return this.searchStateSubject.getValue();
  }

  private countMatches(text: string, searchTerm: string): number {
    const lowerText = text.toLowerCase();
    let count = 0;
    let index = lowerText.indexOf(searchTerm);
    
    while (index !== -1) {
      count++;
      index = lowerText.indexOf(searchTerm, index + 1);
    }
    
    return count;
  }
}