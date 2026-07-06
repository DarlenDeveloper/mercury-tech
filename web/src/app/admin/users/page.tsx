import { UserPlus, ShieldCheck, MoreHorizontal } from "lucide-react";
import AdminHeader from "@/components/admin/AdminHeader";
import { ROLE_CARDS, STAFF_USERS, type StaffRole } from "@/lib/adminData";

const ROLE_STYLES: Record<StaffRole, string> = {
  Owner: "bg-[#efeafc] text-[#5b21b6]",
  Admin: "bg-[#e8eefc] text-mercury",
  Manager: "bg-[#e7f6ee] text-[#16a34a]",
  Support: "bg-[#fff3dc] text-[#b45309]",
  Editor: "bg-surface-soft text-muted",
};

function initials(name: string) {
  return name.split(" ").map((n) => n[0]).slice(0, 2).join("");
}

export default function UsersPage() {
  return (
    <div className="px-5 py-6 lg:px-8 lg:py-7">
      <AdminHeader
        title="Users & Roles"
        subtitle="Manage staff access and permissions"
        action={
          <button className="flex items-center gap-2 rounded-full bg-ink px-4 py-2 text-sm font-semibold text-white transition hover:bg-black">
            <UserPlus size={16} />
            Invite User
          </button>
        }
      />

      {/* Role cards */}
      <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {ROLE_CARDS.map((r) => (
          <div key={r.role} className="admin-card p-5">
            <div className="flex items-center gap-2.5">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-surface-soft text-mercury">
                <ShieldCheck size={18} />
              </span>
              <p className="text-[15px] font-bold text-ink">{r.role}</p>
            </div>
            <p className="mt-3 text-xs text-muted">{r.desc}</p>
            <p className="mt-3 text-sm font-semibold text-ink">
              {r.members} {r.members === 1 ? "member" : "members"}
            </p>
          </div>
        ))}
      </div>

      {/* Staff table */}
      <section className="admin-card mt-6 p-5">
        <h3 className="mb-4 text-lg font-bold text-ink">Team Members</h3>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[680px] border-collapse text-left">
            <thead>
              <tr className="border-b border-line text-[12px] font-medium text-muted">
                <th className="pb-3 pl-1 font-medium">Member</th>
                <th className="pb-3 font-medium">Role</th>
                <th className="pb-3 font-medium">Status</th>
                <th className="pb-3 font-medium">Last Active</th>
                <th className="pb-3 font-medium"></th>
              </tr>
            </thead>
            <tbody>
              {STAFF_USERS.map((u) => (
                <tr
                  key={u.email}
                  className="border-b border-line/70 text-sm last:border-0"
                >
                  <td className="py-3 pl-1">
                    <div className="flex items-center gap-3">
                      <span
                        className="flex h-9 w-9 items-center justify-center rounded-full text-[11px] font-bold text-white"
                        style={{ backgroundColor: u.color }}
                      >
                        {initials(u.name)}
                      </span>
                      <div>
                        <p className="font-medium text-ink">{u.name}</p>
                        <p className="text-[11px] text-muted">{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3">
                    <span
                      className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${ROLE_STYLES[u.role]}`}
                    >
                      {u.role}
                    </span>
                  </td>
                  <td className="py-3">
                    <span className="flex items-center gap-1.5 text-sm text-ink">
                      <span
                        className={`h-2 w-2 rounded-full ${
                          u.active ? "bg-[#16a34a]" : "bg-line"
                        }`}
                      />
                      {u.active ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="py-3 text-muted">{u.lastActive}</td>
                  <td className="py-3 text-right">
                    <button className="rounded-lg p-1.5 text-muted transition hover:bg-surface-soft hover:text-ink">
                      <MoreHorizontal size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
