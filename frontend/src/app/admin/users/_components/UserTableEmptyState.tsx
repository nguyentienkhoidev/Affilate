import { Users } from 'lucide-react';

/** Displayed when the filtered users list is empty */
export default function UserTableEmptyState() {
  return (
    <tr>
      <td colSpan={6} className="py-12 text-center text-slate-400">
        <Users className="mx-auto text-slate-300 mb-2" size={32} />
        <p className="font-semibold text-slate-600">No staff accounts found</p>
        <p className="text-[11px] text-slate-400 mt-0.5">
          Try adjusting your keyword search or security filters.
        </p>
      </td>
    </tr>
  );
}
