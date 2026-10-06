import type { StaffRole } from "./adminAccess";

export type RepairAssignee = { email: string; name: string; role: StaffRole };
export type AssignmentFields = { technician: string; assigneeEmail: string; assigneeRole: StaffRole | "" };

// Empty selection explicitly clears every assignment field, including legacy names.
export function assignmentFields(person: RepairAssignee | null): AssignmentFields {
  return {
    technician: person?.name || person?.email || "",
    assigneeEmail: person?.email.toLowerCase() || "",
    assigneeRole: person?.role || "",
  };
}
