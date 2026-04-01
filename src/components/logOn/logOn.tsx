import React, { useState } from "react";
import "./logOn.css";
import { useDispatch } from "react-redux";
import { AppDispatch } from "../store/store";
import {
  onSetUserStatus,
  onSetLogOnModal,
  onSetUser,
} from "../reduser/reduser";
import { useEmojiModal } from "../emojiModal/useEmojiHook";
import { socket } from "../socket/socket";

interface LogOnProps {}

const LogOn: React.FC<LogOnProps> = (): React.JSX.Element => {
  const [nameToLogOn, setNameToLogOn] = useState<string>("");

  const dispatch = useDispatch<AppDispatch>();
  const { showEmoji } = useEmojiModal();

  const getUser = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!nameToLogOn.trim()) {
      showEmoji(":(", "red", "Введите имя пользователя");
      return;
    }

    try {
      const response = await fetch("http://localhost:5999/getUserByName", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nameToLogOn }),
      });

      const correctUser = await response.json();

      if (!correctUser) {
        showEmoji(":(", "red", "Пользователь не найден");
        return;
      }

      dispatch(onSetUser({ ...correctUser, id: correctUser._id }));
      dispatch(onSetUserStatus(true));
      dispatch(onSetLogOnModal());

      socket.emit("register", correctUser._id);

      localStorage.setItem(
        "user",
        JSON.stringify({ ...correctUser, id: correctUser._id })
      );

      showEmoji(":)", "green", "Вход успешно выполнен");
    } catch (err) {
      console.error(err);
      showEmoji(":(", "red", "Что-то пошло не так!");
    }
  };

  return (
    <div className="logOn">
      <form className="userFormLogOn" onSubmit={getUser}>
        <div className="writeUserInfoDiv">
          <label className="writeUserInfoText">Введите имя пользователя</label>
          <input
            className="inputText"
            type="text"
            value={nameToLogOn}
            placeholder="текст..."
            onChange={(e) => setNameToLogOn(e.target.value)}
          />
        </div>
        <div className="submitBtnDiv">
          <button className="submitBtn" type="submit">
            Войти
          </button>
        </div>
      </form>
    </div>
  );
};

export default LogOn;
