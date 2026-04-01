import React, { useState, useEffect } from "react";
import "./userProfile.css";
import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "../store/store";
import { onSetUserStatus, onUserDeleted } from "../reduser/reduser";
import { useEmojiModal } from "../emojiModal/useEmojiHook";
import { socket } from "../socket/socket";

interface UserProfileProps {}

const UserProfile: React.FC<UserProfileProps> = (): React.JSX.Element => {
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);

  const user = useSelector((state: RootState) => state.reduser.user || {});
  const userId = useSelector(
    (state: RootState) => state.reduser.user?.id || ""
  );

  const dispatch = useDispatch<AppDispatch>();
  const { showEmoji } = useEmojiModal();

  const handleOpenSettings = () => {
    setIsSettingsOpen(!isSettingsOpen);
  };

  const quitFromProfile = () => {
    localStorage.removeItem("user");
    dispatch(onSetUserStatus(false));

    showEmoji(":)", "green", "Выход успешно выполнен");

    socket.disconnect();
  };

  const deleteUserFc = async () => {
    if (!userId) return;

    try {
      const response = await fetch("http://localhost:5999/deleteProfile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });

      if (response.ok) {
        // Удаляем локально
        localStorage.removeItem("user");
        dispatch(onSetUserStatus(false));

        // Отключаем сокет после удаления
        socket.disconnect();

        // Можно показать сообщение
        showEmoji(":(", "red", "Профиль удалён");
      } else {
        showEmoji(":(", "red", "Ошибка при удалении профиля");
      }
    } catch (error) {
      console.error(error);
      showEmoji(":(", "red", "Ошибка сервера");
    }
  };

  const returnProfileSettings = () => {
    if (!isSettingsOpen) return null;

    return (
      <div className="profileSettings">
        <div className="userFriendCode">{user.friendCode}</div>

        <button className="quitBtn" onClick={quitFromProfile}>
          Выйти
        </button>

        <button className="deleteBtn" onClick={deleteUserFc}>
          Удалить
        </button>
      </div>
    );
  };

  useEffect(() => {
    socket.on(
      "userDeleted",
      (data: { deletedUserId: string; chatIds: string[] }) => {
        dispatch(onUserDeleted(data.deletedUserId));
      }
    );

    return () => {
      socket.off("userDeleted");
    };
  }, [dispatch]);

  return (
    <div className="userProfile">
      <div className="profile" onClick={handleOpenSettings}>
        <div className="username">{user.name}</div>

        <div className="profileAvatar">{user.avatar}</div>
      </div>

      {returnProfileSettings()}
    </div>
  );
};

export default UserProfile;
