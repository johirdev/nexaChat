"use client";

import { useMemo, useState } from "react";
import { Check, Search, X } from "lucide-react";
import UserAvatar from "@/src/app/components/Users/UserAvatar";
import useUserDirectory from "@/src/hooks/useUserDirectory";
import type { User } from "@/src/types/user";

interface UserPickerProps {
  selected: User[];
  onChange: (next: User[]) => void;
  /** Ids already in the group — hidden from the list. */
  excludeIds?: string[];
  label?: string;
}

/**
 * Multi-select over the people directory, reusing the same merge-and-filter
 * search as the sidebar so results behave identically in both places.
 */
export default function UserPicker({
  selected,
  onChange,
  excludeIds = [],
  label = "Add people",
}: UserPickerProps) {
  const [query, setQuery] = useState("");
  const { users, isInitialLoading, isSearching } = useUserDirectory(query);

  const excluded = useMemo(() => new Set(excludeIds), [excludeIds]);
  const selectedIds = useMemo(
    () => new Set(selected.map((user) => user._id)),
    [selected],
  );

  const options = useMemo(
    () => users.filter((user) => !excluded.has(user._id)),
    [users, excluded],
  );

  const toggle = (user: User) => {
    onChange(
      selectedIds.has(user._id)
        ? selected.filter((item) => item._id !== user._id)
        : [...selected, user],
    );
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <div>
        <span className="cw-field-label">
          {label}
          {selected.length > 0 && ` · ${selected.length} selected`}
        </span>

        <div className="ul-field">
          <Search className="ul-field-icon" size={15} aria-hidden="true" />
          <input
            className="ul-input"
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search by name or phone"
            aria-label="Search people to add"
            autoComplete="off"
          />
          {query && (
            <button
              type="button"
              className="ul-clear"
              onClick={() => setQuery("")}
              aria-label="Clear search"
            >
              <X size={13} />
            </button>
          )}
        </div>
      </div>

      {selected.length > 0 && (
        <div className="cw-picked">
          {selected.map((user) => (
            <span key={user._id} className="cw-pick">
              {user.name}
              <button
                type="button"
                onClick={() => toggle(user)}
                aria-label={`Remove ${user.name}`}
              >
                <X size={11} />
              </button>
            </span>
          ))}
        </div>
      )}

      <div className="cw-picker">
        {isInitialLoading || (isSearching && options.length === 0) ? (
          <p
            style={{
              padding: 16,
              textAlign: "center",
              fontSize: "0.78rem",
              color: "var(--cw-ink-faint)",
            }}
          >
            Loading people…
          </p>
        ) : options.length === 0 ? (
          <p
            style={{
              padding: 16,
              textAlign: "center",
              fontSize: "0.78rem",
              color: "var(--cw-ink-faint)",
            }}
          >
            {query.trim() ? "No one matches that search." : "No one else to add."}
          </p>
        ) : (
          options.map((user) => {
            const picked = selectedIds.has(user._id);
            return (
              <button
                key={user._id}
                type="button"
                className={`cw-pick-row${picked ? " is-picked" : ""}`}
                onClick={() => toggle(user)}
                aria-pressed={picked}
              >
                <UserAvatar id={user._id} name={user.name} />
                <span className="cw-pick-body">
                  <span className="cw-pick-name">{user.name}</span>
                  <span className="cw-pick-phone">{user.phone}</span>
                </span>
                <span className="cw-check" aria-hidden="true">
                  <Check size={12} />
                </span>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}
