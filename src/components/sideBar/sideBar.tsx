import React, { useState, useEffect } from "react";
import "./sideBar.css";
import { RootState, AppDispatch } from "../store/store";
import { useSelector, useDispatch } from "react-redux";
import submitSymbol from "../../assets/7117136-middle-no-bg-preview (carve.photos).png";
import { useEmojiModal } from "../emojiModal/useEmojiHook";
import { onSetCurrentChat, onAddChatToUser } from "../reduser/reduser";
import { socket } from "../socket/socket";

interface ChatsSideBarProps {}

const SideBar: React.FC<ChatsSideBarProps> = (): React.JSX.Element => {
  const [isCodePlaceOpen, setIsCodePlaceOpen] = useState<boolean>(false);
  const [friendCode, setFriendCode] = useState<string>("");

  const dispatch = useDispatch<AppDispatch>();
  const { showEmoji } = useEmojiModal();

  const user = useSelector((state: RootState) => state.reduser.user);
  const userId = user?.id || "";
  const userChats = user?.userChats || [];

  const handleOpenCodePlace = () => setIsCodePlaceOpen(!isCodePlaceOpen);

  useEffect(() => {
    const handleNewChat = (chatData: { chat: any; title: string }) => {
      const friendId = chatData.chat.participants.find(
        (id: string) => id !== userId
      );

      dispatch(
        onAddChatToUser({
          chatId: chatData.chat._id,
          title: chatData.title,
          friendId,
        })
      );

      showEmoji(":)", "green", `Новый чат с ${chatData.title}`);
    };

    socket.on("newChat", handleNewChat);
    return () => {
      socket.off("newChat", handleNewChat);
    };
  }, [dispatch, showEmoji, userId]);

  const addChatFc = async () => {
    if (!friendCode.trim() || !userId) {
      showEmoji(":(", "red", "Отсутствует код друга!");
      return;
    }

    try {
      const response = await fetch("http://localhost:5999/addChat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId, friendCode }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        showEmoji(":(", "red", data.message || "Ошибка");
        return;
      }

      showEmoji(":)", "green", "Чат добавлен");
      setFriendCode("");
    } catch (err) {
      console.error(err);
      showEmoji(":(", "red", "Ошибка сервера");
    }
  };

  const openChat = async (chatId: string) => {
    if (!chatId) return;

    try {
      const response = await fetch("http://localhost:5999/getChatById", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chatId }),
      });

      if (!response.ok) {
        const error = await response.json();
        showEmoji(":(", "red", error.message || "Ошибка загрузки чата");
        return;
      }

      const chatData = await response.json();

      dispatch(
        onSetCurrentChat({
          chatId: chatData.chatId,
          messages: chatData.messages.map((m: any) => ({
            ...m,
            id: m._id,
          })),
        })
      );
    } catch (err) {
      console.error(err);
      showEmoji(":(", "red", "Ошибка сервера");
    }
  };

  const returnChats = () => {
    if (!userChats || userChats.length === 0) {
      return <div className="noChatsMessage">У вас пока нет чатов:/</div>;
    }

    return userChats.map((item) => (
      <div
        className="singleChat"
        key={item.chatId}
        onClick={() => openChat(item.chatId)}
      >
        <div className="singleChatTitle">{item.title}</div>
      </div>
    ));
  };

  const returnCodePlace = () => {
    if (!isCodePlaceOpen) return null;

    return (
      <div className="enterUserCodePlace">
        <input
          className="codeInput"
          type="text"
          placeholder="Введите код пользователя..."
          value={friendCode}
          onChange={(e) => setFriendCode(e.target.value)}
        />
        <img
          className="submitImg"
          src={submitSymbol}
          alt="submit"
          onClick={addChatFc}
        />
      </div>
    );
  };

  return (
    <div className="sideBar">
      <div className="sideBarHeader">
        <div className="chatsSettings">
          <div className="chatsTitle">Чаты</div>
          <div className="addBtnPlace">
            <button className="addBtn" onClick={handleOpenCodePlace}>
              +
            </button>
          </div>
        </div>
        {returnCodePlace()}
      </div>
      <div className="chats">{returnChats()}</div>
    </div>
  );
};

export default SideBar;
