<script lang="ts">
  import type { Chat } from "../../types/types";
  import { onMount } from "svelte";
  import { io } from "socket.io-client"; // Import Socket.IO client

  // Using Svelte 5 runes syntax for all reactive state
  let query = $state(""); 
  let chatHistory = $state<Chat[]>([
    // {
    //   message: "Hey there! I'm here on behalf of Nirjal. How can I assist you?",
    //   type: "answer",
    // },
  ]);
  let inputElement: HTMLInputElement;
  let isTyping = $state(false);
  let currentTypingMessage = $state("");

  // Initialize Socket.IO connection
  let socket: ReturnType<typeof io>;
  onMount(() => {
    // Autofocus the input when component mounts
    if (inputElement) {
      inputElement.focus();
    }

    // Connect to the Socket.IO server
    socket = io("http://localhost:3000"); // Match your server URL and port

    // Handle incoming messages from the server
    socket.on("message", (data) => {
      console.log("Received message from server:", data);
      if (data.sender === "Chatbot" && data.text) {
        // Add the server response to chat history with typing effect
        const responseIndex = chatHistory.length;
        chatHistory.push({
          message: "",
          type: "answer",
        });

        typeMessage(data.text).then((finalMessage) => {
          chatHistory[responseIndex].message = finalMessage;
        });
      }
    });

    // Handle errors from the server
    socket.on("error", (data) => {
      console.error("Error from server:", data);
      chatHistory.push({
        message: data.text || "An error occurred. Please try again.",
        type: "answer",
      });
    });

    // Handle disconnection
    socket.on("disconnect", () => {
      console.log("Disconnected from server");
      chatHistory.push({
        message: "Lost connection to the server. Please refresh the page.",
        type: "answer",
      });
    });

    // Handle connection errors
    socket.on("connect_error", (error) => {
      console.error("Connection error:", error);
      chatHistory.push({
        message: "Failed to connect to the server. Please check your network.",
        type: "answer",
      });
    });
  });

  // Cleanup on unmount
  $effect(() => {
    return () => {
      if (socket) {
        socket.disconnect();
      }
    };
  });

  async function typeMessage(fullMessage: string, delay = 30) {
    isTyping = true;
    currentTypingMessage = "";

    for (let i = 0; i < fullMessage.length; i++) {
      currentTypingMessage += fullMessage[i];
      await new Promise((resolve) => setTimeout(resolve, delay));
    }

    isTyping = false;
    return currentTypingMessage;
  }

  function handleKeyDown(event: KeyboardEvent) {
    if (event.key === "Enter" && query.trim() !== "") {
      console.log("Enter pressed with query:", query);

      // Add user message to chat history
      chatHistory.push({
        message: query,
        type: "query",
      });

      // Emit the query to the server via Socket.IO
      socket.emit("message", {
        text: query,
      });

      // Clear the input
      query = "";

      // Refocus the input after sending
      if (inputElement) {
        inputElement.focus();
      }
    }
  }
</script>

<section class="flex flex-col gap-2">
  {#each chatHistory as chat, i (i)}
    <div class="flex gap-1">
      {#if chat.type === "query"}
        <span>?</span>
      {:else}
        <span>-</span>
      {/if}
      <div>
        {#if i === chatHistory.length - 1 && chat.type === "answer" && isTyping}
          {currentTypingMessage}
        {:else}
          {chat.message}
        {/if}
      </div>
    </div>
  {/each}

  <div class="flex items-center gap-1">
    <span>?</span>
    <input
      class="bg-transparent outline-none w-full"
      bind:value={query}
      bind:this={inputElement}
      on:keydown={handleKeyDown}
      disabled={isTyping}
    />
  </div>
</section>