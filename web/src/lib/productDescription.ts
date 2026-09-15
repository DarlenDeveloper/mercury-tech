import { getFunctions, httpsCallable } from "firebase/functions";
import { firebaseApp } from "./firebase";

const functions = getFunctions(firebaseApp);

export type GeneratedProductContent = {
  description: string;
  specifications: Record<string, string>;
};

type ProductContentInput = {
  name: string;
  brand: string;
  category: string;
  description: string;
  notes: string;
  specifications: Record<string, string>;
};

export async function enhanceProductDescription(
  input: ProductContentInput
): Promise<GeneratedProductContent> {
  const callable = httpsCallable<ProductContentInput, GeneratedProductContent>(
    functions,
    "enhanceProductDescription"
  );

  try {
    const result = await callable(input);
    if (!result.data?.description) {
      throw new Error("AI returned an empty description. Please try again.");
    }
    return {
      description: result.data.description,
      specifications: result.data.specifications ?? {},
    };
  } catch (error: any) {
    const code = String(error?.code ?? "");
    if (code.includes("permission-denied") || code.includes("unauthenticated")) {
      throw new Error("AI Fix requires a signed-in administrator account.");
    }
    if (code.includes("failed-precondition")) {
      throw new Error("AI Fix is not configured. Add the Gemini API key and deploy the function.");
    }
    if (error?.message && !code.includes("internal")) throw error;
    throw new Error("AI generation is unavailable. Check the Gemini function configuration and try again.");
  }
}
