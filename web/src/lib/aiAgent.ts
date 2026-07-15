import { getFunctions, httpsCallable } from "firebase/functions";
import { firebaseApp } from "./firebase";

const functions = getFunctions(firebaseApp);

export type AiHistoryItem = {
  role: "user" | "assistant";
  content: string;
};

type AiResponse = { reply: string };

/**
 * Calls the Gemini-backed `aiAgent` Cloud Function.
 * The user must be authenticated (enforced server-side).
 */
export async function askAiAgent(
  message: string,
  history: AiHistoryItem[] = []
): Promise<string> {
  const callable = httpsCallable<
    { message: string; history: AiHistoryItem[] },
    AiResponse
  >(functions, "aiAgent");

  const result = await callable({ message, history });
  return result.data.reply;
}
