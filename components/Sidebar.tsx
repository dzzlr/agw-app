"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

const NAV_LINKS = [
  { name: "Dashboard", href: "/dashboard" },
  { name: "Audit Findings", href: "/audit-findings" },
  { name: "Governance Tasks", href: "/governance-tasks" },
  { name: "Change Management", href: "/change-management" },
  { name: "Admin Config", href: "/admin-config" },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { user } = useAuth();

  return (
    <div className="w-1/5 flex flex-col">
      <nav className="min-h-screen text-slate-400">
        <div className="py-2 px-5 flex flex-col gap-2">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`p-1.5 w-full rounded font-semibold hover:bg-blue-100 hover:text-blue-600 transition ease-in-out ${
                pathname === link.href ? "bg-blue-100 text-blue-600 pl-2 border border-l-4 border-l-blue-600" : ""
              }`}
            >
              {link.name}
            </Link>
          ))}
        </div>
      </nav>
    </div>
  );
}
