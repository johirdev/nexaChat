"use client";

import { useContext, useState } from "react";
import { X, Pencil, Check, X as XIcon } from "lucide-react";
import { AuthContext } from "@/src/app/AuthProvider";
import UserAvatar from "@/src/app/components/Users/UserAvatar";
import "./my-profile.css";

interface MyProfilePageProps {
  onClose: () => void;
}

export default function MyProfilePage({ onClose }: MyProfilePageProps) {
  const { user } = useContext(AuthContext);

  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(user?.name ?? "");
  const [phone, setPhone] = useState(user?.phone ?? "");
  const [about, setAbout] = useState("");
  const [savedProfile, setSavedProfile] = useState({
    name: user?.name ?? "",
    phone: user?.phone ?? "",
    about: "",
  });

  const startEdit = () => {
    setName(savedProfile.name);
    setPhone(savedProfile.phone);
    setAbout(savedProfile.about);
    setIsEditing(true);
  };

  const cancelEdit = () => setIsEditing(false);

  const saveEdit = () => {
    setSavedProfile({ name, phone, about });
    setIsEditing(false);
  };

  if (!user) return null;

  return (
    <div className="pf-overlay">
      <div className="pf-card">
        <div className="pf-head">
          <h2>My profile</h2>
          <button
            type="button"
            className="pf-close"
            onClick={onClose}
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        <div className="pf-body">
          <div className="pf-avatar-row">
            <UserAvatar id={user._id} name={user.name} showPresence />
          </div>

          <div className="pf-field">
            <span className="pf-label">Name</span>
            {isEditing ? (
              <input
                className="pf-input"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
              />
            ) : (
              <span className="pf-value">{savedProfile.name}</span>
            )}
          </div>

          <div className="pf-field">
            <span className="pf-label">Phone</span>
            {isEditing ? (
              <input
                className="pf-input"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+1 555 000 1000"
              />
            ) : (
              <span className="pf-value">{savedProfile.phone || "—"}</span>
            )}
          </div>

          <div className="pf-field">
            <span className="pf-label">About</span>
            {isEditing ? (
              <textarea
                className="pf-input pf-textarea"
                value={about}
                onChange={(e) => setAbout(e.target.value)}
                placeholder="Say something about yourself"
                rows={3}
              />
            ) : (
              <span className="pf-value pf-muted">
                {savedProfile.about || "No bio yet."}
              </span>
            )}
          </div>
        </div>

        <div className="pf-foot">
          {isEditing ? (
            <>
              <button
                type="button"
                className="pf-btn pf-btn-outline"
                onClick={cancelEdit}
              >
                <XIcon size={15} /> Cancel
              </button>
              <button
                type="button"
                className="pf-btn pf-btn-primary"
                onClick={saveEdit}
              >
                  <Check size={15} /> Save preview
              </button>
            </>
          ) : (
            <button
              type="button"
              className="pf-btn pf-btn-primary pf-btn-wide"
              onClick={startEdit}
            >
              <Pencil size={15} /> Edit profile
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
