import React, { useState, useEffect } from "react";
import "./Chat.css";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "../store/store";
import { onSetCurrentChat, onAddMessage } from "../reduser/reduser";
import { socket } from "../socket/socket";

const ChatGretting: React.FC = () => {
  return (
    <div className="gretting">
      <div className="empty_chat_message">
        Начните переписку с вашими друзьями
      </div>
    </div>
  );
};

const ChatWithUser: React.FC = () => {
  const chat = useSelector((state: RootState) => state.reduser.chat);
  const currentChatId = useSelector(
    (state: RootState) => state.reduser.currentChatId
  );
  const user = useSelector((state: RootState) => state.reduser.user);
  const dispatch = useDispatch();

  const [messageText, setMessageText] = useState("");
  const [chatUsers, setChatUsers] = useState<
    { _id: string; name: string; avatar: string }[]
  >([]);

  useEffect(() => {
    const loadChat = async () => {
      if (!currentChatId) return;

      try {
        const res = await fetch("http://localhost:5999/getChatById", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ chatId: currentChatId }),
        });

        if (!res.ok) return;

        const data = await res.json();

        dispatch(
          onSetCurrentChat({
            chatId: data.chatId,
            messages: data.messages.map((m: any) => ({
              ...m,
              id: m._id,
            })),
          })
        );

        setChatUsers(data.users || []);
      } catch (err) {
        console.error("Ошибка загрузки чата:", err);
      }
    };

    loadChat();
  }, [currentChatId, dispatch]);

  useEffect(() => {
    if (!currentChatId) return;

    const handleNewMessage = (message: any) => {
      if (message.chatId === currentChatId) {
        dispatch(onAddMessage(message));
      }
    };

    socket.on("newMessage", handleNewMessage);
    return () => {
      socket.off("newMessage", handleNewMessage);
    };
  }, [currentChatId, dispatch]);

  const sendMessage = async () => {
    if (!messageText.trim() || !currentChatId) {
      alert("Введите сообщение!");
      return;
    }

    try {
      await fetch("http://localhost:5999/addMessage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          text: messageText,
          currentChatId,
        }),
      });

      setMessageText("");
    } catch (err) {
      console.error("Ошибка при отправке сообщения:", err);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const showChat = () => {
    if (!chat || chat.length === 0) {
      return (
        <div className="gretting">
          <div className="empty_chat_message">Здесь пока нет сообщений :/</div>
        </div>
      );
    }

    return chat.map((msg) => {
      const senderUser = chatUsers.find((u) => u._id === msg.sender);
      const whoseAvatar = senderUser?.avatar || "?";
      const isMe = msg.sender === user.id;

      return (
        <div
          className={`userMessage ${isMe ? "myMessage" : "otherMessage"}`}
          key={msg.id}
        >
          <div className="userAvatar">{whoseAvatar}</div>
          <p className="userText">{msg.text}</p>
        </div>
      );
    });
  };

  return (
    <div className="placeForChat">
      <div className="chatWithUser">{showChat()}</div>
      <div className="writeMessagePlace">
        <textarea
          className="writeMessageInput"
          placeholder="Введите сообщение..."
          value={messageText}
          onChange={(e) => setMessageText(e.target.value)}
          onKeyDown={handleKeyPress}
        />
      </div>
    </div>
  );
};

const Chat: React.FC = () => {
  const currentChatId = useSelector(
    (state: RootState) => state.reduser.currentChatId
  );
  return (
    <div className="main">
      {!currentChatId ? <ChatGretting /> : <ChatWithUser />}
    </div>
  );
};

export default Chat;
