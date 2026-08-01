'use client';

import React, { useEffect, useState } from 'react';
import { Network, RefreshCw, Shield, Wifi, Terminal, CheckCircle2, Zap } from 'lucide-react';
import { NetworkDetails } from '@/types/tauri';
import { getNetworkDetails, renewDhcpIp, spoofMacAddress, flushDnsCache } from '@/lib/ipc';

export const NetworkToolsView: React.FC = () => {
  const [details, setDetails] = useState<NetworkDetails | null>(null);
  const [isRenewingIp, setIsRenewingIp] = useState(false);
  const [isSpoofingMac, setIsSpoofingMac] = useState(false);
  const [isFlushingDns, setIsFlushingDns] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const fetchDetails = async () => {
    const d = await getNetworkDetails();
    setDetails(d);
  };

  useEffect(() => {
    let isMounted = true;
    getNetworkDetails().then((d) => {
      if (isMounted) setDetails(d);
    });
    return () => {
      isMounted = false;
    };
  }, []);

  const handleRenewIp = async () => {
    setIsRenewingIp(true);
    setStatusMessage(null);
    const msg = await renewDhcpIp(details?.interface_name || 'en0');
    setStatusMessage(msg);
    await fetchDetails();
    setIsRenewingIp(false);
  };

  const handleSpoofMac = async () => {
    setIsSpoofingMac(true);
    setStatusMessage(null);
    const msg = await spoofMacAddress(details?.interface_name || 'en0');
    setStatusMessage(msg);
    await fetchDetails();
    setIsSpoofingMac(false);
  };

  const handleFlushDns = async () => {
    setIsFlushingDns(true);
    setStatusMessage(null);
    const msg = await flushDnsCache();
    setStatusMessage(msg);
    setIsFlushingDns(false);
  };

  return (
    <div className="p-6 space-y-6 select-none font-sans">
      {/* Banner */}
      <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Network className="w-6 h-6 text-indigo-400" />
          <div>
            <h2 className="text-base font-bold text-white tracking-tight">IP & MAC Address Randomizer & DHCP Manager</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Change local IP addresses, spoof hardware MAC interfaces, and trigger instant DHCP lease renewals on macOS without disconnecting from Wi-Fi.
            </p>
          </div>
        </div>

        <button
          onClick={fetchDetails}
          className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-1.5 rounded-xl text-xs font-mono border border-slate-700 transition"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Details</span>
        </button>
      </div>

      {/* Action Notification Banner */}
      {statusMessage && (
        <div className="bg-emerald-950/60 border border-emerald-500/40 p-4 rounded-xl flex items-center gap-3 text-emerald-300 text-xs font-mono">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{statusMessage}</span>
        </div>
      )}

      {/* Live Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* IPv4 Address */}
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl space-y-2">
          <div className="flex justify-between items-center text-xs text-slate-400">
            <span>IPv4 Address</span>
            <Wifi className="w-3.5 h-3.5 text-indigo-400" />
          </div>
          <p className="text-lg font-mono font-bold text-emerald-400">{details?.ipv4_address || '192.168.1.105'}</p>
          <span className="text-[10px] text-slate-500 font-mono">Subnet: {details?.subnet_mask || '255.255.255.0'}</span>
        </div>

        {/* Hardware MAC Address */}
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl space-y-2">
          <div className="flex justify-between items-center text-xs text-slate-400">
            <span>MAC Address</span>
            <Shield className="w-3.5 h-3.5 text-purple-400" />
          </div>
          <p className="text-lg font-mono font-bold text-purple-300 truncate" title={details?.mac_address}>
            {details?.mac_address || '7c:d1:c3:8a:b2:94'}
          </p>
          <span className="text-[10px] text-slate-500 font-mono">Interface: {details?.interface_name || 'en0'}</span>
        </div>

        {/* Gateway IP */}
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl space-y-2">
          <div className="flex justify-between items-center text-xs text-slate-400">
            <span>Gateway / Router</span>
            <Network className="w-3.5 h-3.5 text-cyan-400" />
          </div>
          <p className="text-lg font-mono font-bold text-cyan-300">{details?.gateway_ip || '192.168.1.1'}</p>
          <span className="text-[10px] text-slate-500 font-mono">SSID: {details?.wifi_ssid || 'Wi-Fi Network'}</span>
        </div>

        {/* DNS Servers */}
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl space-y-2">
          <div className="flex justify-between items-center text-xs text-slate-400">
            <span>DNS Servers</span>
            <Zap className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <p className="text-base font-mono font-bold text-amber-300">
            {details?.dns_servers?.join(', ') || '8.8.8.8, 1.1.1.1'}
          </p>
          <span className="text-[10px] text-slate-500 font-mono">Status: Connected</span>
        </div>
      </div>

      {/* Action Control Panel */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* 1. Instant DHCP IP Renewal */}
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-4">
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-indigo-400" />
            <h3 className="text-sm font-bold text-white">Instant DHCP IP Renewal</h3>
          </div>
          <p className="text-xs text-slate-400">
            Sends a `DHCPREQUEST` packet to your router/AP to issue a new local IP address without breaking or disconnecting your active Wi-Fi link.
          </p>
          <button
            onClick={handleRenewIp}
            disabled={isRenewingIp}
            className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white py-2.5 rounded-xl text-xs font-semibold shadow-lg shadow-indigo-600/20 transition disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isRenewingIp ? 'animate-spin' : ''}`} />
            <span>{isRenewingIp ? 'Renewing IP...' : 'Renew IP Address (No Disconnect)'}</span>
          </button>
        </div>

        {/* 2. Spoof Random MAC Address */}
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-4">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-purple-400" />
            <h3 className="text-sm font-bold text-white">Randomize MAC & Auto-Renew IP</h3>
          </div>
          <p className="text-xs text-slate-400">
            Generates a new random unicast MAC address, sets `ifconfig en0 ether`, and immediately requests a new IP address bound to the new MAC.
          </p>
          <button
            onClick={handleSpoofMac}
            disabled={isSpoofingMac}
            className="w-full flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-500 text-white py-2.5 rounded-xl text-xs font-semibold shadow-lg shadow-purple-600/20 transition disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isSpoofingMac ? 'animate-spin' : ''}`} />
            <span>{isSpoofingMac ? 'Spoofing MAC...' : 'Spoof MAC & Acquire New IP'}</span>
          </button>
        </div>

        {/* 3. Flush macOS DNS Cache */}
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-4">
          <div className="flex items-center gap-2">
            <Terminal className="w-5 h-5 text-cyan-400" />
            <h3 className="text-sm font-bold text-white">Flush macOS DNS Cache</h3>
          </div>
          <p className="text-xs text-slate-400">
            Clears macOS mDNSResponder DNS resolver cache (`dscacheutil -flushcache`) to resolve stale domain records instantly.
          </p>
          <button
            onClick={handleFlushDns}
            disabled={isFlushingDns}
            className="w-full flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-200 py-2.5 rounded-xl text-xs font-semibold border border-slate-700 transition disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isFlushingDns ? 'animate-spin' : ''}`} />
            <span>{isFlushingDns ? 'Flushing...' : 'Flush DNS Cache'}</span>
          </button>
        </div>
      </div>

      {/* Terminal Manual Helper */}
      <div className="bg-slate-950 border border-slate-800/80 p-4 rounded-xl space-y-2 text-xs font-mono">
        <div className="flex items-center gap-2 text-slate-400">
          <Terminal className="w-4 h-4 text-emerald-400" />
          <span>Manual Terminal Commands Reference for macOS:</span>
        </div>
        <div className="text-slate-500 space-y-1 text-[11px]">
          <p>• Check IP: <code className="text-emerald-400">ipconfig getifaddr en0</code></p>
          <p>• Renew DHCP IP without Wi-Fi drop: <code className="text-indigo-300">ipconfig set en0 DHCP</code></p>
          <p>• Spoof MAC Address: <code className="text-purple-300">sudo ifconfig en0 ether 02:a1:b2:c3:d4:e5 && sudo ipconfig set en0 DHCP</code></p>
        </div>
      </div>
    </div>
  );
};
