"use client";

import { useMemo, useState } from "react";
import {
  Check,
  LoaderCircle,
  LogOut,
  Pencil,
  ShieldPlus,
  UserMinus,
  UserPlus,
  X,
} from "lucide-react";
import UserAvatar from "@/src/app/components/Users/UserAvatar";
import useGroupMutations from "@/src/hooks/useGroupMutations";
import { formatFullTimestamp } from "@/src/lib/format";
import { isGroupAdmin, type Conversation } from "@/src/types/chat";
import type { User } from "@/src/types/user";
import Modal from "./Modal";
import UserPicker from "./UserPicker";

interface GroupInfoPanelProps {
  conversation: Conversation;
  currentUserId: string | undefined;
  onClose: () => void;
  onLeft: (conversationId: string) => void;
}

export default function GroupInfoPanel({
  conversation,
  currentUserId,
  onClose,
  onLeft,
}: GroupInfoPanelProps) {
  const { rename, addMembers, removeMember, promote, leave, isBusy, error } =
    useGroupMutations(conversation.id);

  const [isRenaming, setIsRenaming] = useState(false);
  const [draftName, setDraftName] = useState(conversation.title);
  const [isAdding, setIsAdding] = useState(false);
  const [picked, setPicked] = useState<User[]>([]);
  const [confirmLeave, setConfirmLeave] = useState(false);

  const viewerIsAdmin = isGroupAdmin(conversation, currentUserId);
  const isDirect = conversation.type === "direct";

  // Admins first, then alphabetical — the order people expect to read.
  const members = useMemo(() => {
    const adminSet = new Set(conversation.admins);
    return [...conversation.participants].sort((a, b) => {
      const aAdmin = adminSet.has(a._id) ? 0 : 1;
      const bAdmin = adminSet.has(b._id) ? 0 : 1;
      if (aAdmin !== bAdmin) return aAdmin - bAdmin;
      return a.name.localeCompare(b.name);
    });
  }, [conversation.participants, conversation.admins]);

  const submitRename = async () => {
    const next = draftName.trim();
    if (!next || next === conversation.title) {
      setIsRenaming(false);
      return;
    }
    try {
      await rename.mutateAsync(next);
      setIsRenaming(false);
    } catch {
      // Message rendered from `error` below.
    }
  };

  const submitAdd = async () => {
    if (picked.length === 0) return;
    try {
      await addMembers.mutateAsync(picked.map((user) => user._id));
      setPicked([]);
      setIsAdding(false);
    } catch {
      /* handled below */
    }
  };

  const submitLeave = async () => {
    try {
      await leave.mutateAsync();
      onLeft(conversation.id);
    } catch {
      /* handled below */
    }
  };

  return (
    <aside className="cw-panel" aria-label="Conversation details">
      <div className="cw-panel-head">
        <h2>{isDirect ? "Contact" : "Group info"}</h2>
        <button
          type="button"
          className="cw-icon-btn"
          onClick={onClose}
          aria-label="Close details"
        >
          <X size={17} />
        </button>
      </div>

      <div className="cw-panel-scroll">
        <div className="cw-panel-hero">
          <UserAvatar
            id={conversation.avatarSeed}
            name={conversation.title}
          />

          {isRenaming ? (
            <div className="cw-inline-form" style={{ width: "100%" }}>
              <input
                className="cw-input"
                value={draftName}
                onChange={(event) => setDraftName(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") submitRename();
                  if (event.key === "Escape") setIsRenaming(false);
                }}
                maxLength={60}
                aria-label="Group name"
                autoFocus
              />
              <button
                type="button"
                className="cw-mini-btn"
                onClick={submitRename}
                disabled={rename.isPending}
                aria-label="Save name"
              >
                {rename.isPending ? (
                  <LoaderCircle className="animate-spin" size={14} />
                ) : (
                  <Check size={15} />
                )}
              </button>
              <button
                type="button"
                className="cw-mini-btn"
                onClick={() => {
                  setDraftName(conversation.title);
                  setIsRenaming(false);
                }}
                aria-label="Cancel rename"
              >
                <X size={15} />
              </button>
            </div>
          ) : (
            <>
              <span className="cw-panel-name">{conversation.title}</span>
              {viewerIsAdmin && (
                <button
                  type="button"
                  className="cw-btn"
                  onClick={() => {
                    setDraftName(conversation.title);
                    setIsRenaming(true);
                  }}
                >
                  <Pencil size={13} /> Rename
                </button>
              )}
            </>
          )}

          <span className="cw-panel-note">
            {isDirect
              ? conversation.otherUser?.phone
              : `${conversation.participants.length} members · ${conversation.admins.length} admin${
                  conversation.admins.length === 1 ? "" : "s"
                }`}
          </span>

          {conversation.lastMessage?.createdAt && (
            <span className="cw-panel-note">
              Last active {formatFullTimestamp(conversation.lastMessage.createdAt)}
            </span>
          )}
        </div>

        {error && (
          <p className="cw-error-text" role="alert">
            {error}
          </p>
        )}

        {!isDirect && (
          <>
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              <p className="cw-section-label">
                Members
                {viewerIsAdmin && (
                  <button
                    type="button"
                    className="cw-mini-btn"
                    onClick={() => setIsAdding(true)}
                    aria-label="Add members"
                    title="Add members"
                  >
                    <UserPlus size={15} />
                  </button>
                )}
              </p>

              {members.map((member) => {
                const memberIsAdmin = conversation.admins.includes(member._id);
                const isSelf = member._id === currentUserId;

                return (
                  <div key={member._id} className="cw-member">
                    <UserAvatar id={member._id} name={member.name} />
                    <span className="cw-member-body">
                      <span className="cw-member-name">
                        {member.name}
                        {isSelf && " (you)"}
                      </span>
                      <span className="cw-member-role">{member.phone}</span>
                    </span>

                    {memberIsAdmin && <span className="cw-chip-admin">Admin</span>}

                    {viewerIsAdmin && !isSelf && (
                      <span className="cw-member-menu">
                        {!memberIsAdmin && (
                          <button
                            type="button"
                            className="cw-mini-btn"
                            onClick={() => promote.mutate(member._id)}
                            disabled={isBusy}
                            title={`Make ${member.name} an admin`}
                            aria-label={`Make ${member.name} an admin`}
                          >
                            <ShieldPlus size={14} />
                          </button>
                        )}
                        <button
                          type="button"
                          className="cw-mini-btn is-danger"
                          onClick={() => removeMember.mutate(member._id)}
                          disabled={isBusy}
                          title={`Remove ${member.name}`}
                          aria-label={`Remove ${member.name}`}
                        >
                          <UserMinus size={14} />
                        </button>
                      </span>
                    )}
                  </div>
                );
              })}
            </div>

            <button
              type="button"
              className="cw-btn is-danger is-block"
              onClick={() => setConfirmLeave(true)}
              disabled={isBusy}
            >
              <LogOut size={14} /> Leave group
            </button>
          </>
        )}
      </div>

      {isAdding && (
        <Modal
          title="Add members"
          onClose={() => {
            setPicked([]);
            setIsAdding(false);
          }}
          footer={
            <>
              <button
                type="button"
                className="cw-btn"
                onClick={() => {
                  setPicked([]);
                  setIsAdding(false);
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                className="cw-btn is-primary"
                onClick={submitAdd}
                disabled={picked.length === 0 || addMembers.isPending}
              >
                {addMembers.isPending ? (
                  <LoaderCircle className="animate-spin" size={15} />
                ) : (
                  `Add ${picked.length || ""}`.trim()
                )}
              </button>
            </>
          }
        >
          <UserPicker
            selected={picked}
            onChange={setPicked}
            excludeIds={conversation.participants.map((p) => p._id)}
            label="People"
          />
          {error && (
            <p className="cw-error-text" role="alert">
              {error}
            </p>
          )}
        </Modal>
      )}

      {confirmLeave && (
        <Modal
          title="Leave group?"
          onClose={() => setConfirmLeave(false)}
          footer={
            <>
              <button
                type="button"
                className="cw-btn"
                onClick={() => setConfirmLeave(false)}
              >
                Stay
              </button>
              <button
                type="button"
                className="cw-btn is-danger"
                onClick={submitLeave}
                disabled={leave.isPending}
              >
                {leave.isPending ? (
                  <LoaderCircle className="animate-spin" size={15} />
                ) : (
                  "Leave group"
                )}
              </button>
            </>
          }
        >
          <p style={{ fontSize: "0.85rem", lineHeight: 1.6, margin: 0 }}>
            You will stop receiving messages from{" "}
            <strong>{conversation.title}</strong> and it will disappear from your
            chat list. An admin has to add you back to rejoin.
          </p>
        </Modal>
      )}
    </aside>
  );
}
