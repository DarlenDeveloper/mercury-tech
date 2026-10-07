import { getFunctions, httpsCallable } from "firebase/functions";
import { firebaseApp } from "./firebase";

export type ReminderOutcome = "completed" | "failed" | "pending";

export type CustomerReminder = {
  id: string;
  ticketId: string;
  trackingReference: string;
  customerName: string;
  customerPhone: string;
  device: string;
  repairStatus: string;
  provider: string;
  providerStatus: string;
  outcome: ReminderOutcome;
  messageId: string;
  kacyberReference: string;
  fee: number | null;
  currency: string;
  failureReason: string;
  httpStatus: number | null;
  retryable: boolean | null;
  acceptedAt: Date | null;
  updatedAt: Date | null;
};

export type ReminderSummary = {
  all: number;
  completed: number;
  failed: number;
  pending: number;
};

type ReminderWire = Omit<CustomerReminder, "acceptedAt" | "updatedAt"> & {
  acceptedAt: string | null;
  updatedAt: string | null;
};

type ReminderResponse = {
  summary: ReminderSummary;
  reminders: ReminderWire[];
};

const callable = () => httpsCallable<{ summaryOnly?: boolean }, ReminderResponse>(
  getFunctions(firebaseApp),
  "listRepairReminders",
);

export async function fetchCustomerReminders(): Promise<{ summary: ReminderSummary; reminders: CustomerReminder[] }> {
  const response = await callable()({});
  return {
    summary: response.data.summary,
    reminders: response.data.reminders.map(reminder => ({
      ...reminder,
      acceptedAt: reminder.acceptedAt ? new Date(reminder.acceptedAt) : null,
      updatedAt: reminder.updatedAt ? new Date(reminder.updatedAt) : null,
    })),
  };
}

export async function fetchCustomerReminderSummary(): Promise<ReminderSummary> {
  const response = await callable()({ summaryOnly: true });
  return response.data.summary;
}
