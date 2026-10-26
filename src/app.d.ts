/// <reference types="vite/client" />

declare global {
  namespace App {
    // interface Error {}
    // interface Locals {}
    // interface PageData {}
    interface PageState {
      project?: number;
    }
    // interface Platform {}
  }
}

export {};
