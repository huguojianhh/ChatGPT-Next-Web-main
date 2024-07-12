import styles from "./auth.module.scss";
import { IconButton } from "./button";

import { useNavigate } from "react-router-dom";
import { Path } from "../constant";
import { useAccessStore } from "../store";
import Locale from "../locales";

import BotIcon from "../icons/bot.svg";
import { useEffect, useState } from "react";
import { getClientConfig } from "../config/client";
import {
  Input,
  List,
  ListItem,
  Modal,
  PasswordInput,
  Popover,
  Select,
  showConfirm,
  showToast,
} from "./ui-lib";

export function AuthPage() {
  const navigate = useNavigate();
  const accessStore = useAccessStore();

  const [errorText, setErrorText] = useState<string>("");

  const goHome = () => navigate(Path.Home);
  const goChat = () => navigate(Path.Chat);
  const resetAccessCode = () => {
    accessStore.update((access) => {
      access.openaiApiKey = "";
      access.accessUserName = "";
      access.accessCode = "";
    });
  }; // Reset access code to empty string

  const checkSubmit = async () => {
    setErrorText("");
    let result = await accessStore.checkUserAndCodeFetch(
      accessStore.accessUserName,
      accessStore.accessCode,
    );
    if (result) {
      accessStore.update((access) => {
        access.isAuth = true;
      });
      navigate(Path.Chat);
    } else {
      accessStore.update((access) => {
        access.isAuth = false;
      });
      setErrorText("访问码错误！");
    }
  };

  useEffect(() => {
    if (getClientConfig()?.isApp) {
      navigate(Path.Settings);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className={styles["auth-page"]}>
      <div className={`no-dark ${styles["auth-logo"]}`}>
        <BotIcon />
      </div>
      <div className={styles["auth-title"]}>{Locale.Auth.Title}</div>
      {/* <div className={styles["auth-tips"]}>
        <span>
          {Locale.Auth.UserNameTitle}
        </span>
        <input
          className={styles["auth-input"]}
          type="text"
          placeholder={Locale.Auth.UserInput}
          value={accessStore.accessUserName}
          onChange={(e) => {
            accessStore.update(
              (access) => (access.accessUserName = e.currentTarget.value),
            );
          }}
        />
      </div> */}
      {!accessStore.hideUserApiKey ? (
        <>
          <div className={styles["auth-tips"]}>
            <span> {Locale.Auth.CodeTitle}</span>
            <input
              className={styles["auth-input"]}
              type="password"
              placeholder={Locale.Auth.Input}
              value={accessStore.accessCode}
              onChange={(e) => {
                accessStore.update(
                  (access) => (access.accessCode = e.currentTarget.value),
                );
              }}
            />
          </div>
          {/* <input
            className={styles["auth-input"]}
            type="password"
            placeholder={Locale.Settings.Access.Google.ApiKey.Placeholder}
            value={accessStore.googleApiKey}
            onChange={(e) => {
              accessStore.update(
                (access) => (access.googleApiKey = e.currentTarget.value),
              );
            }}
          /> */}
        </>
      ) : null}

      {errorText && (
        <div style={{ color: "red" }} className={styles["auth-error-tips"]}>
          {" "}
          {errorText}
        </div>
      )}

      <div className={styles["auth-actions"]}>
        <IconButton
          text={Locale.Auth.Confirm}
          type="primary"
          onClick={checkSubmit}
        />
        <IconButton
          text={Locale.Auth.Reset}
          onClick={() => {
            resetAccessCode();
            goHome();
          }}
        />
      </div>
    </div>
  );
}
