import { getFunctions, httpsCallable } from "firebase/functions";
import { firebaseApp } from "./firebase";

const functions = getFunctions(firebaseApp);

export async function enhanceProductDescription(input: {
  name: string;
  brand: string;
  category: string;
  description: string;
  notes: string;
  specifications: Record<string, string>;
}): Promise<string> {
  const callable = httpsCallable<
    typeof input,
    { description: string }
  >(functions, "enhanceProductDescription");
  const result = await callable(input);
  return result.data.description;
}
