import React, { useState } from "react";
import "./logIn.css";
import { useDispatch } from "react-redux";
import { AppDispatch } from "../store/store";
import {
  onSetLogInModal,
  onSetUser,
  onSetUserStatus,
} from "../reduser/reduser";
import { useEmojiModal } from "../emojiModal/useEmojiHook";
import { socket } from "../socket/socket";

interface LogInProps {}

const LogIn: React.FC<LogInProps> = (): React.JSX.Element => {
  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");

  const dispatch = useDispatch<AppDispatch>();
  const { showEmoji } = useEmojiModal();

  const sendData = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!username.trim()) {
      showEmoji(":(", "red", "Отсутствует имя пользователя");
      return;
    }

    if (username.trim().length > 10) {
      showEmoji(":(", "red", "Имя пользователя больше 10 символов");
      return;
    }

    if (password.trim().length < 5) {
      showEmoji(":(", "red", "Пароль слишком короткий");
      return;
    }

    try {
      const response = await fetch("https://chat-api-y8is.onrender.com/addUser", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: username.trim(),
          password: password.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        showEmoji(":(", "red", data.message || "Ошибка при регистрации");
        return;
      }

      dispatch(
        onSetUser({
          id: data.user._id,
          name: data.user.name,
          password: data.user.password,
          avatar: data.user.avatar,
          friendCode: data.user.friendCode,
          userChats: data.user.userChats,
          friends: data.user.friends,
        })
      );

      dispatch(onSetUserStatus(true));

      socket.emit("register", data.user._id);

      localStorage.setItem(
        "user",
        JSON.stringify({
          id: data.user._id,
          name: data.user.name,
          password: data.user.password,
          avatar: data.user.avatar,
          friendCode: data.user.friendCode,
          userChats: data.user.userChats,
          friends: data.user.friends,
        })
      );

      showEmoji(":)", "green", "Регистрация успешна");
      dispatch(onSetLogInModal());
    } catch (err) {
      console.error(err);
      showEmoji(":(", "red", "Ошибка сервера");
    }
  };

  return (
    <div className="logIn">
      <form className="userFormLogIn" onSubmit={sendData}>
        <div className="writeUserInfoDiv">
          <label className="writeUserInfoText">Введите имя пользователя</label>
          <input
            className="inputText"
            type="text"
            placeholder="текст..."
            onChange={(e) => setUsername(e.target.value)}
          />
        </div>
        <div className="writeUserInfoDiv">
          <label className="writeUserInfoText">Введите пароль</label>
          <input
            className="inputText"
            type="password"
            placeholder="текст..."
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <div className="submitBtnDiv">
          <button className="submitBtn" type="submit">
            Зарегистрироваться
          </button>
        </div>
      </form>
    </div>
  );
};

export default LogIn;
