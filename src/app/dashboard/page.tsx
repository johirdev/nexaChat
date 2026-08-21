import type { Metadata } from "next";
import ChatWorkspace from "../components/Chat/ChatWorkspace";

export const metadata: Metadata = {
  title: "Chats",
};

export default function DashboardPage() {
  return <ChatWorkspace />;
}
