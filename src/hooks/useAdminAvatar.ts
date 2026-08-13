import { useState, useEffect } from "react";
import camilaDefaultAvatar from "@/assets/camila-owner.jpg";

const STORAGE_KEY = "isafer_admin_avatar";
const EVENT_NAME = "isafer_admin_avatar_changed";

export function useAdminAvatar() {
  const [avatar, setAvatar] = useState<string>(() => {
    if (typeof window !== "undefined" && typeof localStorage !== "undefined") {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return saved;
    }
    return camilaDefaultAvatar;
  });

  useEffect(() => {
    const handleAvatarChange = () => {
      if (
        typeof window !== "undefined" &&
        typeof localStorage !== "undefined"
      ) {
        const saved = localStorage.getItem(STORAGE_KEY);
        setAvatar(saved || camilaDefaultAvatar);
      }
    };

    window.addEventListener(EVENT_NAME, handleAvatarChange);
    return () => {
      window.removeEventListener(EVENT_NAME, handleAvatarChange);
    };
  }, []);

  const updateAvatar = (newAvatarUrl: string) => {
    if (typeof window !== "undefined" && typeof localStorage !== "undefined") {
      localStorage.setItem(STORAGE_KEY, newAvatarUrl);
      setAvatar(newAvatarUrl);
      window.dispatchEvent(new Event(EVENT_NAME));
    }
  };

  const resetAvatar = () => {
    if (typeof window !== "undefined" && typeof localStorage !== "undefined") {
      localStorage.removeItem(STORAGE_KEY);
      setAvatar(camilaDefaultAvatar);
      window.dispatchEvent(new Event(EVENT_NAME));
    }
  };

  const isCustom =
    typeof window !== "undefined" &&
    typeof localStorage !== "undefined" &&
    !!localStorage.getItem(STORAGE_KEY);

  return {
    avatar,
    updateAvatar,
    resetAvatar,
    isCustom,
    defaultAvatar: camilaDefaultAvatar,
  };
}
