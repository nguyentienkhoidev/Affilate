import { Search, Filter, ArrowUpDown, RotateCcw } from 'lucide-react';

type TwoFactorFilter = 'all' | 'enabled' | 'disabled';
type StatusFilter = 'all' | 'active' | 'inactive';
type SortBy = 'name-asc' | 'name-desc' | 'created-desc' | 'role-asc';

interface UserFiltersBarProps {
  // State values
  search: string;
  roleFilter: string;
  twoFactorFilter: TwoFactorFilter;
  statusFilter: StatusFilter;
  sortBy: SortBy;
  // Counts for quick pills
  totalCount: number;
  activeCount: number;
  twoFactorCount: number;
  // Unique roles for dropdown
  uniqueRoles: string[];
  // Change handlers
  onSearchChange: (value: string) => void;
  onRoleFilterChange: (value: string) => void;
  onTwoFactorFilterChange: (value: TwoFactorFilter) => void;
  onStatusFilterChange: (value: StatusFilter) => void;
  onSortByChange: (value: SortBy) => void;
  onResetFilters: () => void;
}

const selectClass =
  'w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500';

export default function UserFiltersBar({
  search,
  roleFilter,
  twoFactorFilter,
  statusFilter,
  sortBy,
  totalCount,
  activeCount,
  twoFactorCount,
  uniqueRoles,
  onSearchChange,
  onRoleFilterChange,
  onTwoFactorFilterChange,
  onStatusFilterChange,
  onSortByChange,
  onResetFilters,
}: UserFiltersBarProps) {
  const hasActiveFilters =
    search.trim() !== '' ||
    roleFilter !== 'all' ||
    twoFactorFilter !== 'all' ||
    statusFilter !== 'all' ||
    sortBy !== 'name-asc';

  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-xs space-y-4">
      {/* Quick pills row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl overflow-x-auto">
          {/* All Staff pill */}
          <button
            onClick={() => {
              onStatusFilterChange('all');
              onTwoFactorFilterChange('all');
            }}
            className={`h-8 px-3.5 inline-flex items-center text-xs font-bold rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
              statusFilter === 'all' && twoFactorFilter === 'all'
                ? 'bg-white text-slate-900 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All Staff ({totalCount})
          </button>

          {/* Active pill */}
          <button
            onClick={() => onStatusFilterChange('active')}
            className={`h-8 px-3.5 inline-flex items-center text-xs font-bold rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
              statusFilter === 'active'
                ? 'bg-white text-emerald-700 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Active ({activeCount})
          </button>

          {/* 2FA Protected pill */}
          <button
            onClick={() => onTwoFactorFilterChange('enabled')}
            className={`h-8 px-3.5 inline-flex items-center text-xs font-bold rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
              twoFactorFilter === 'enabled'
                ? 'bg-white text-indigo-700 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            2FA Protected ({twoFactorCount})
          </button>
        </div>

        {hasActiveFilters && (
          <button
            onClick={onResetFilters}
            className="h-8 inline-flex items-center gap-1.5 text-xs font-bold text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100/80 px-3 rounded-lg transition-colors cursor-pointer whitespace-nowrap"
          >
            <RotateCcw size={13} /> Reset Filters
          </button>
        )}
      </div>

      {/* Inputs grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-1 border-t border-slate-100">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-2.5 text-slate-400" size={15} />
          <input
            type="text"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search by name or email..."
            className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
          />
        </div>

        {/* Role filter */}
        <div className="flex items-center gap-1.5">
          <Filter size={14} className="text-slate-400 shrink-0" />
          <select
            value={roleFilter}
            onChange={(e) => onRoleFilterChange(e.target.value)}
            className={selectClass}
          >
            <option value="all">All Roles</option>
            {uniqueRoles.map((role) => (
              <option key={role} value={role}>
                {role}
              </option>
            ))}
          </select>
        </div>

        {/* 2FA filter */}
        <select
          value={twoFactorFilter}
          onChange={(e) => onTwoFactorFilterChange(e.target.value as TwoFactorFilter)}
          className={selectClass}
        >
          <option value="all">2FA: All Security Tiers</option>
          <option value="enabled">2FA: Active Only</option>
          <option value="disabled">2FA: Not Configured</option>
        </select>

        {/* Sort by */}
        <div className="flex items-center gap-1.5">
          <ArrowUpDown size={14} className="text-slate-400 shrink-0" />
          <select
            value={sortBy}
            onChange={(e) => onSortByChange(e.target.value as SortBy)}
            className={selectClass}
          >
            <option value="name-asc">Full Name (A → Z)</option>
            <option value="name-desc">Full Name (Z → A)</option>
            <option value="created-desc">Created Date (Newest)</option>
            <option value="role-asc">Role Tier</option>
          </select>
        </div>
      </div>
    </div>
  );
}
