import React from "react";
import "./start.css";
import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "../store/store";
import { onSetLogInModal, onSetLogOnModal } from "../reduser/reduser";
import sitePic from "../../assets/AlekseyLogo.png";
import UserProfile from "../userProfile/userProfile";

interface StartProps {}

const Start: React.FC<StartProps> = (): React.JSX.Element => {
  const isUserRegister = useSelector(
    (state: RootState) => state.reduser.isUserRegister
  );

  const dispatch = useDispatch<AppDispatch>();

  const showUserOrBtn = () => {
    if (isUserRegister) {
      return <UserProfile />;
    } else {
      return (
        <div className="btnsDiv">
          <button className="btn" onClick={() => dispatch(onSetLogOnModal())}>
            Войти
          </button>
          <button className="btn" onClick={() => dispatch(onSetLogInModal())}>
            Зарегестрироватся
          </button>
        </div>
      );
    }
  };

  return (
    <div className="start">
      <div className="menu">
        <div className="logoOfSite">
          <div className="siteName">FunChat</div>
          <img className="sitePic" src={sitePic} alt="" />
        </div>
        {showUserOrBtn()}
      </div>
    </div>
  );
};

export default Start;
