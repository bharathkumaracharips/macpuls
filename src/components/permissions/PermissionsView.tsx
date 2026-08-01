'use client';

import React, { useEffect, useState } from 'react';
import { ShieldCheck, CheckCircle2, AlertCircle } from 'lucide-react';
import { PermissionStatus } from '@/types/tauri';
import { auditPermissions } from '@/lib/ipc';

export const PermissionsView: React.FC = () => {
  const [permissions, setPermissions] = useState<PermissionStatus[]>([]);

  useEffect(() => {
    auditPermissions().then(setPermissions);
  }, []);

  return (
    <div className="p-6 space-y-6 select-none font-sans">
      <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl flex items-center gap-3">
        <ShieldCheck className="w-6 h-6 text-teal-400" />
        <div>
          <h2 className="text-base font-bold text-white tracking-tight">macOS Permissions & Capabilities Audit</h2>
          <p className="text-xs text-slate-400">
            Audit privacy permissions required for full process file handles & system cache access.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {permissions.map((perm) => (
          <div key={perm.key} className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-3">
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-2">
                {perm.is_granted ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-amber-400" />
                )}
                <h3 className="text-sm font-bold text-white">{perm.name}</h3>
              </div>
              <span className={`text-[10px] px-2 py-0.5 rounded font-mono ${
                perm.is_granted ? 'bg-emerald-500/20 text-emerald-300' : 'bg-amber-500/20 text-amber-300'
              }`}>
                {perm.is_granted ? 'Granted' : 'Missing'}
              </span>
            </div>

            <p className="text-xs text-slate-400">{perm.description}</p>
            <p className="text-[11px] text-slate-500 font-mono bg-slate-950 p-2.5 rounded-xl border border-slate-800">
              {perm.fix_instructions}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};
