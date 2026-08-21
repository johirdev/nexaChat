"use client";

import { useState } from "react";
import { LoaderCircle } from "lucide-react";
import { useCreateGroup } from "@/src/hooks/useConversations";
import { getApiErrorMessage } from "@/src/lib/errors";
import type { User } from "@/src/types/user";
import Modal from "./Modal";
import UserPicker from "./UserPicker";

/** The API needs at least one other member; a group of one is just a note to self. */
const MIN_MEMBERS = 1;

interface NewGroupDialogProps {
  currentUserId: string | undefined;
  onClose: () => void;
  onCreated: (conversationId: string) => void;
}

export default function NewGroupDialog({
  currentUserId,
  onClose,
  onCreated,
}: NewGroupDialogProps) {
  const [name, setName] = useState("");
  const [members, setMembers] = useState<User[]>([]);
  const createGroup = useCreateGroup();

  const trimmedName = name.trim();
  const canSubmit =
    trimmedName.length > 0 &&
    members.length >= MIN_MEMBERS &&
    !createGroup.isPending;

  const submit = async () => {
    if (!canSubmit) return;
    try {
      const group = await createGroup.mutateAsync({
        name: trimmedName,
        participantIds: members.map((member) => member._id),
      });
      onCreated(group._id);
    } catch {
      // Surfaced below via createGroup.error.
    }
  };

  return (
    <Modal
      title="New group"
      onClose={onClose}
      footer={
        <>
          <button type="button" className="cw-btn" onClick={onClose}>
            Cancel
          </button>
          <button
            type="button"
            className="cw-btn is-primary"
            onClick={submit}
            disabled={!canSubmit}
          >
            {createGroup.isPending ? (
              <LoaderCircle className="animate-spin" size={15} />
            ) : (
              `Create group${members.length ? ` · ${members.length + 1}` : ""}`
            )}
          </button>
        </>
      }
    >
      <div>
        <label className="cw-field-label" htmlFor="group-name">
          Group name
        </label>
        <input
          id="group-name"
          className="cw-input"
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="Design circle"
          maxLength={60}
          autoComplete="off"
        />
      </div>

      <UserPicker
        selected={members}
        onChange={setMembers}
        excludeIds={currentUserId ? [currentUserId] : []}
        label="Members"
      />

      {createGroup.error && (
        <p className="cw-error-text" role="alert">
          {getApiErrorMessage(createGroup.error)}
        </p>
      )}

      {!createGroup.error && members.length < MIN_MEMBERS && (
        <p
          style={{ fontSize: "0.73rem", color: "var(--cw-ink-faint)" }}
        >
          Pick at least one other person. You are added automatically as the
          group&apos;s first admin.
        </p>
      )}
    </Modal>
  );
}
