import React, { useState, useEffect, useRef } from "react";
import "./App.css";

const App = () => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [username, setUsername] = useState("");
  const [isUsernameSet, setIsUsernameSet] = useState(false);
  const ws = useRef(null); 

  useEffect(() => {
    if (!isUsernameSet) return;

    const connectWebSocket = () => {
      ws.current = new WebSocket("ws://localhost:5002");

      ws.current.onopen = () => {
        console.log("Connected to WebSocket server");
        ws.current.send(JSON.stringify({ event: "connection", username }));
      };

      ws.current.onmessage = (event) => {
        console.log("Получено сообщение:", event.data);
        const message = JSON.parse(event.data);
        setMessages((prev) => [...prev, message]);
      };

      ws.current.onmessage = async (event) => {
        console.log("Получено сообщение:", event.data);
      
        let messageText;
      
        if (event.data instanceof Blob) {
          // Если данные — Blob, конвертируем в текст
          messageText = await event.data.text();
        } else {
          messageText = event.data;
        }
      
        try {
          const message = JSON.parse(messageText);
          setMessages((prev) => [...prev, message]);
        } catch (error) {
          console.error("Ошибка парсинга JSON:", error);
        }
      };
      

      ws.current.onerror = (error) => {
        console.error("WebSocket error:", error);
      };

      ws.current.onclose = () => {
        console.log("WebSocket disconnected, trying to reconnect...");
      };
    };

    connectWebSocket();

    return () => {
      if (ws.current) {
        ws.current.close();
      }
    };
  }, [isUsernameSet, username]);

  const sendMessage = () => {
    if (newMessage.trim() !== "" && ws.current && ws.current.readyState === WebSocket.OPEN) {
      const messageData = {
        event: "message",
        username,
        message: newMessage,
      };

      ws.current.send(JSON.stringify(messageData));
      setMessages((prev) => [...prev, messageData]);
      setNewMessage("");
    }
  };

  return (
    <div>
      {!isUsernameSet ? (
        <div>
          <h2>Enter your name:</h2>
          <input
            type="text"
            placeholder="Your name..."
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <button onClick={() => setIsUsernameSet(true)}>Start Chat</button>
        </div>
      ) : (
        <div>
          <h1>WebSocket Chat</h1>
          <div>
            {messages.map((msg, index) => (
              <p key={index}>
                <strong>{msg.username}:</strong> {msg.message}
              </p>
            ))}
          </div>
          <input
            type="text"
            placeholder="Type a message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
          />
          <button onClick={sendMessage}>Send</button>
        </div>
      )}
    </div>
  );
};

export default App;
