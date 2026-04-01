import React, { useEffect } from "react";
import "./app.css";
import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "../store/store";
import {
  onSetUserStatus,
  onSetUser,
  onSetLogInModal,
  onSetLogOnModal,
} from "../reduser/reduser";
import Start from "../start/start";
import LogIn from "../logIn/logIn";
import LogOn from "../logOn/logOn";
import MainContent from "../mainContent/mainContent";
import { EmojiModal } from "../emojiModal/emojiModal";
import { socket } from "../socket/socket";

const App: React.FC = (): React.JSX.Element => {
  const dispatch = useDispatch<AppDispatch>();

  const emojiModal = useSelector(
    (state: RootState) => state.reduser.emojiModal
  );
  const isLoginInModalOpen = useSelector(
    (state: RootState) => state.reduser.isLogInModalOpen
  );
  const isLogOnModalOpen = useSelector(
    (state: RootState) => state.reduser.isLogOnModalOpen
  );
  const user = useSelector((state: RootState) => state.reduser.user);

  useEffect(() => {
    const savedUser = localStorage.getItem("user");

    if (savedUser) {
      const parsedUser = JSON.parse(savedUser);
      dispatch(onSetUser(parsedUser));
      dispatch(onSetUserStatus(true));

      socket.emit("register", parsedUser._id || parsedUser.id);
      console.log("🟢 User registered on socket:", parsedUser);
    }
  }, [dispatch]);

  useEffect(() => {
    if (user.id || user.id) {
      localStorage.setItem("user", JSON.stringify(user));
      socket.emit("register", user.id || user.id);
    }
  }, [user]);

  useEffect(() => {
    socket.on("newMessage", (message) => {
      console.log("📩 New message received:", message);
    });

    socket.on("newChat", (chatData) => {
      console.log("🆕 New chat created:", chatData);
    });

    socket.on("userDeleted", (data) => {
      console.log("❌ User deleted:", data);
    });

    return () => {
      socket.off("newMessage");
      socket.off("newChat");
      socket.off("userDeleted");
    };
  }, []);

  const handleModalClick1 = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      dispatch(onSetLogInModal());
    }
  };

  const handleModalClick2 = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      dispatch(onSetLogOnModal());
    }
  };

  return (
    <div className="app">
      <div className="startPlace">
        <Start />
        {emojiModal.isOpen && (
          <EmojiModal
            emoji={emojiModal.emoji}
            color={emojiModal.color}
            text={emojiModal.text}
          />
        )}
      </div>

      {isLoginInModalOpen ? (
        <div className="placeForModal" onClick={handleModalClick1}>
          <LogIn />
        </div>
      ) : isLogOnModalOpen ? (
        <div className="placeForModal" onClick={handleModalClick2}>
          <LogOn />
        </div>
      ) : null}

      <MainContent />
    </div>
  );
};

export default App;
