import { useState, useRef, useEffect, useMemo, type KeyboardEvent } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useMonitoring } from '../context/MonitoringContext';
import { evaluate, LIMITS, clockTime } from '../lib/status';
import type { Status } from '../types';

interface SearchResultItem {
  id: string;
  category: 'Pages' | 'Sensors' | 'Alerts' | 'Equipment' | 'Actions';
  title: string;
  subtitle?: string;
  badge?: {
    text: string;
    variant: 'blue' | 'emerald' | 'amber' | 'red' | 'purple' | 'slate';
  };
  icon: 'page' | 'sensor' | 'alert' | 'tool' | 'action';
  onSelect: () => void;
}

export default function SearchBar() {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  const navigate = useNavigate();
  const location = useLocation();
  const { telemetry, alerts, setScenario } = useMonitoring();

  // Listen for Ctrl+K or Cmd+K to focus search bar
  useEffect(() => {
    const handleKeyDown = (e: globalThis.KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
        setIsOpen(true);
      } else if (e.key === '/' && document.activeElement?.tagName !== 'INPUT' && document.activeElement?.tagName !== 'TEXTAREA') {
        e.preventDefault();
        inputRef.current?.focus();
        setIsOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Reset selected index when query changes
  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  const scrollToSensor = (sensorKey: string) => {
    if (location.pathname !== '/') {
      navigate(`/?scroll=sensor-${sensorKey}`);
    } else {
      const el = document.getElementById(`sensor-${sensorKey}`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        el.classList.add('ring-2', 'ring-[#0b4ea2]', 'ring-offset-2');
        setTimeout(() => {
          el.classList.remove('ring-2', 'ring-[#0b4ea2]', 'ring-offset-2');
        }, 2000);
      }
    }
  };

  const statusVariant = (status: Status | null): 'emerald' | 'amber' | 'red' | 'slate' => {
    if (!status) return 'slate';
    if (status === 'CRITICAL') return 'red';
    if (status === 'WARNING') return 'amber';
    return 'emerald';
  };

  // Build searchable items
  const results = useMemo<SearchResultItem[]>(() => {
    const q = query.trim().toLowerCase();
    const items: SearchResultItem[] = [];

    // 1. Pages
    const pages = [
      {
        id: 'page-feed',
        title: 'Feed / Overview Dashboard',
        subtitle: 'Live conveyor telemetry, camera feeds & sensor cards',
        path: '/',
        keywords: ['feed', 'overview', 'dashboard', 'home', 'live', 'realtime'],
      },
      {
        id: 'page-alerts',
        title: 'Alerts & Defect Incidents',
        subtitle: 'Historical alerts, incident response and anomaly log',
        path: '/alerts',
        keywords: ['alert', 'alerts', 'incident', 'defect', 'warning', 'critical', 'log', 'history'],
      },
      {
        id: 'page-inspection',
        title: 'AI Camera Inspection',
        subtitle: 'Dual high-resolution line camera belt surface analysis',
        path: '/inspection',
        keywords: ['inspect', 'inspection', 'camera', 'ai', 'vision', 'surface', 'crack', 'tear', 'scratch'],
      },
    ];

    pages.forEach((p) => {
      if (!q || p.title.toLowerCase().includes(q) || p.keywords.some((k) => k.includes(q))) {
        items.push({
          id: p.id,
          category: 'Pages',
          title: p.title,
          subtitle: p.subtitle,
          icon: 'page',
          onSelect: () => {
            navigate(p.path);
            setIsOpen(false);
          },
        });
      }
    });

    // 2. Live Sensors & Telemetry
    const sensorList: {
      key: string;
      name: string;
      val: string;
      status: Status | null;
      keywords: string[];
    }[] = [
      {
        key: 'vibration',
        name: 'Vibration Accelerometer',
        val: telemetry ? `${telemetry.vibration.toFixed(2)} g` : '—',
        status: telemetry ? evaluate(telemetry.vibration, LIMITS.vibration) : null,
        keywords: ['vibration', 'vib', 'accelerometer', 'g-force', 'shake'],
      },
      {
        key: 'temperature',
        name: 'Bearing Temperature',
        val: telemetry ? `${telemetry.temperature.toFixed(0)} °C` : '—',
        status: telemetry ? evaluate(telemetry.temperature, LIMITS.temperature) : null,
        keywords: ['temp', 'temperature', 'bearing', 'heat', 'celsius'],
      },
      {
        key: 'load',
        name: 'Chute Material Load',
        val: telemetry ? `${telemetry.load.toFixed(1)} kg` : '—',
        status: telemetry ? evaluate(telemetry.load, LIMITS.load) : null,
        keywords: ['load', 'weight', 'mass', 'kg', 'material', 'ore', 'chute'],
      },
      {
        key: 'rpm',
        name: 'Drive Pulley RPM',
        val: telemetry ? `${telemetry.rpm.toFixed(0)} rpm` : '—',
        status: telemetry ? evaluate(telemetry.rpm, LIMITS.rpm) : null,
        keywords: ['rpm', 'speed', 'speedometer', 'pulley', 'drive', 'velocity'],
      },
      {
        key: 'belt_health',
        name: 'Overall Belt Health Gauge',
        val: telemetry ? `${telemetry.belt_health.toFixed(0)}%` : '—',
        status: telemetry ? (telemetry.belt_health < 70 ? 'WARNING' : 'NORMAL') : null,
        keywords: ['health', 'gauge', 'condition', 'percentage', 'wear'],
      },
    ];

    sensorList.forEach((s) => {
      if (!q || s.name.toLowerCase().includes(q) || s.keywords.some((k) => k.includes(q))) {
        items.push({
          id: `sensor-${s.key}`,
          category: 'Sensors',
          title: s.name,
          subtitle: `Current Reading: ${s.val}`,
          badge: {
            text: s.status ?? 'ONLINE',
            variant: statusVariant(s.status),
          },
          icon: 'sensor',
          onSelect: () => {
            scrollToSensor(s.key);
            setIsOpen(false);
          },
        });
      }
    });

    // 3. Alerts & Incidents
    const matchingAlerts = alerts.filter(
      (a) =>
        !q ||
        a.detection.toLowerCase().includes(q) ||
        a.source.toLowerCase().includes(q) ||
        a.severity.toLowerCase().includes(q),
    );

    matchingAlerts.slice(0, 4).forEach((a) => {
      items.push({
        id: `alert-${a.id}`,
        category: 'Alerts',
        title: a.detection,
        subtitle: `${a.source} · ${clockTime(a.time)}`,
        badge: {
          text: a.severity,
          variant: a.severity === 'Critical' ? 'red' : 'amber',
        },
        icon: 'alert',
        onSelect: () => {
          navigate(`/alerts?search=${encodeURIComponent(a.detection)}`);
          setIsOpen(false);
        },
      });
    });

    // 4. Equipment & Assets
    const equipment = [
      {
        id: 'eq-plant-cv04',
        name: 'CV-04 Overland Conveyor (Plant-01)',
        desc: 'Main overland iron ore transfer conveying line',
        keywords: ['cv-04', 'cv04', 'overland', 'line', 'iron ore', 'plant', 'conveyor'],
      },
      {
        id: 'eq-cam1',
        name: 'Top Camera 1 (Line Scan)',
        desc: 'High-speed optical belt inspection sensor',
        keywords: ['camera 1', 'top 1', 'feed 1', 'cam1', 'optical'],
      },
      {
        id: 'eq-cam2',
        name: 'Top Camera 2 (Surface Analysis)',
        desc: 'Secondary 4K angle camera with edge detection',
        keywords: ['camera 2', 'top 2', 'feed 2', 'cam2', 'surface'],
      },
      {
        id: 'eq-motor',
        name: 'Drive Motor M-01 & Head Pulley',
        desc: '450 kW variable frequency drive assembly',
        keywords: ['motor', 'm-01', 'm01', 'head pulley', 'gearbox'],
      },
    ];

    equipment.forEach((eq) => {
      if (!q || eq.name.toLowerCase().includes(q) || eq.keywords.some((k) => k.includes(q))) {
        items.push({
          id: eq.id,
          category: 'Equipment',
          title: eq.name,
          subtitle: eq.desc,
          badge: { text: 'ASSET', variant: 'slate' },
          icon: 'tool',
          onSelect: () => {
            navigate('/inspection');
            setIsOpen(false);
          },
        });
      }
    });

    // 5. Actions
    const actions = [
      {
        id: 'act-normal',
        title: 'Switch Scenario to Normal',
        subtitle: 'Reset sensor simulations to healthy operating parameters',
        keywords: ['normal', 'reset', 'healthy', 'clear', 'scenario'],
        action: () => setScenario('normal'),
      },
      {
        id: 'act-warning',
        title: 'Simulate Warning Scenario',
        subtitle: 'Trigger bearing temperature & vibration warning thresholds',
        keywords: ['warning', 'simulate warning', 'amber', 'scenario'],
        action: () => setScenario('warning'),
      },
      {
        id: 'act-critical',
        title: 'Simulate Critical Alert Scenario',
        subtitle: 'Trigger urgent emergency stop & defect alert simulation',
        keywords: ['critical', 'danger', 'simulate critical', 'red', 'scenario'],
        action: () => setScenario('critical'),
      },
      {
        id: 'act-filter-alerts',
        title: `Search All Alerts for "${query || '...'}"`,
        subtitle: 'Navigate to full alert records with this filter query',
        keywords: ['filter', 'search', 'query', 'find', 'all alerts'],
        action: () => navigate(`/alerts?search=${encodeURIComponent(query.trim())}`),
      },
    ];

    actions.forEach((act) => {
      if (
        (q && (act.title.toLowerCase().includes(q) || act.keywords.some((k) => k.includes(q)))) ||
        (q && act.id === 'act-filter-alerts')
      ) {
        items.push({
          id: act.id,
          category: 'Actions',
          title: act.title,
          subtitle: act.subtitle,
          badge: { text: 'ACTION', variant: 'purple' },
          icon: 'action',
          onSelect: () => {
            act.action();
            setIsOpen(false);
          },
        });
      }
    });

    return items;
  }, [query, telemetry, alerts, location.pathname, navigate, setScenario]);

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen && (e.key === 'ArrowDown' || e.key === 'Enter')) {
      setIsOpen(true);
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (results.length ? (prev + 1) % results.length : 0));
      scrollActiveItemIntoView();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (results.length ? (prev - 1 + results.length) % results.length : 0));
      scrollActiveItemIntoView();
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (results[selectedIndex]) {
        results[selectedIndex].onSelect();
      } else if (query.trim()) {
        navigate(`/alerts?search=${encodeURIComponent(query.trim())}`);
        setIsOpen(false);
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
      inputRef.current?.blur();
    }
  };

  const scrollActiveItemIntoView = () => {
    setTimeout(() => {
      const activeEl = resultsRef.current?.querySelector('[data-active="true"]');
      if (activeEl) {
        activeEl.scrollIntoView({ block: 'nearest' });
      }
    }, 10);
  };

  // Group results by category
  const groupedResults = useMemo(() => {
    const groups: { category: string; items: { item: SearchResultItem; flatIndex: number }[] }[] = [];
    const catMap = new Map<string, { item: SearchResultItem; flatIndex: number }[]>();

    results.forEach((item, flatIndex) => {
      if (!catMap.has(item.category)) {
        catMap.set(item.category, []);
      }
      catMap.get(item.category)!.push({ item, flatIndex });
    });

    catMap.forEach((items, category) => {
      groups.push({ category, items });
    });

    return groups;
  }, [results]);

  const badgeClasses = (variant: 'blue' | 'emerald' | 'amber' | 'red' | 'purple' | 'slate') => {
    switch (variant) {
      case 'red':
        return 'bg-red-500/20 text-red-700 border-red-300';
      case 'amber':
        return 'bg-amber-500/20 text-amber-800 border-amber-300';
      case 'emerald':
        return 'bg-emerald-500/20 text-emerald-700 border-emerald-300';
      case 'purple':
        return 'bg-purple-500/20 text-purple-700 border-purple-300';
      case 'blue':
        return 'bg-blue-500/20 text-blue-700 border-blue-300';
      case 'slate':
      default:
        return 'bg-slate-100 text-slate-600 border-slate-200';
    }
  };

  const renderIcon = (type: SearchResultItem['icon']) => {
    switch (type) {
      case 'sensor':
        return (
          <svg className="w-4 h-4 text-sky-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        );
      case 'alert':
        return (
          <svg className="w-4 h-4 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        );
      case 'tool':
        return (
          <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          </svg>
        );
      case 'action':
        return (
          <svg className="w-4 h-4 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'page':
      default:
        return (
          <svg className="w-4 h-4 text-[#0b4ea2]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        );
    }
  };

  return (
    <div ref={containerRef} className="relative w-full">
      {/* Search Input Box */}
      <div className="relative flex items-center">
        <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-white/70">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </span>
        <input
          ref={inputRef}
          type="text"
          value={query}
          onFocus={() => setIsOpen(true)}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onKeyDown={handleKeyDown}
          placeholder="Search Orbit"
          className="w-full rounded-md bg-[#083c7d] py-1.5 pl-9 pr-14 text-sm text-white placeholder-white/60 focus:bg-[#073269] focus:outline-none focus:ring-1 focus:ring-white/40 border border-[#165bb5] transition-colors"
          aria-label="Search Orbit"
          aria-expanded={isOpen}
          role="combobox"
          aria-controls="orbit-search-dropdown"
        />

        {/* Right input accessories: Clear button & Ctrl+K indicator */}
        <div className="absolute inset-y-0 right-0 flex items-center pr-2 gap-1">
          {query ? (
            <button
              type="button"
              onClick={() => {
                setQuery('');
                inputRef.current?.focus();
              }}
              className="p-1 text-white/60 hover:text-white rounded-full hover:bg-white/10 transition-colors"
              title="Clear search"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          ) : (
            <kbd className="hidden sm:inline-flex items-center px-1.5 py-0.5 text-[10px] font-mono text-white/60 bg-white/10 rounded border border-white/20 select-none pointer-events-none">
              Ctrl K
            </kbd>
          )}
        </div>
      </div>

      {/* Floating Dropdown Results Menu */}
      {isOpen && (
        <div
          id="orbit-search-dropdown"
          ref={resultsRef}
          className="absolute left-0 right-0 top-full mt-1.5 z-50 rounded-xl bg-white text-slate-800 shadow-2xl border border-slate-200 overflow-hidden backdrop-blur-lg animate-in fade-in slide-in-from-top-2 duration-150"
        >
          {results.length > 0 ? (
            <div className="max-h-[380px] overflow-y-auto divide-y divide-slate-100 p-1.5">
              {groupedResults.map((group) => (
                <div key={group.category} className="py-1 first:pt-0 last:pb-0">
                  <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    {group.category}
                  </div>
                  <div className="space-y-0.5">
                    {group.items.map(({ item, flatIndex }) => {
                      const isActive = flatIndex === selectedIndex;
                      return (
                        <div
                          key={item.id}
                          data-active={isActive}
                          onMouseEnter={() => setSelectedIndex(flatIndex)}
                          onClick={item.onSelect}
                          className={`flex items-center justify-between gap-3 px-3 py-2 rounded-lg cursor-pointer transition-all ${
                            isActive
                              ? 'bg-blue-50/90 text-[#0b4ea2] shadow-sm'
                              : 'hover:bg-slate-50 text-slate-700'
                          }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <span
                              className={`p-1.5 rounded-md flex-shrink-0 ${
                                isActive ? 'bg-white shadow-xs' : 'bg-slate-100'
                              }`}
                            >
                              {renderIcon(item.icon)}
                            </span>
                            <div className="min-w-0">
                              <div className="text-xs font-bold truncate leading-snug">
                                {item.title}
                              </div>
                              {item.subtitle && (
                                <div className="text-[11px] text-slate-500 truncate leading-snug">
                                  {item.subtitle}
                                </div>
                              )}
                            </div>
                          </div>

                          {item.badge && (
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold border flex-shrink-0 ${badgeClasses(
                                item.badge.variant,
                              )}`}
                            >
                              {item.badge.text}
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-6 text-center">
              <svg
                className="w-8 h-8 mx-auto text-slate-300 mb-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              <div className="text-xs font-semibold text-slate-700">No results found for "{query}"</div>
              <div className="text-[11px] text-slate-400 mt-1">
                Try searching for <span className="font-semibold text-[#0b4ea2]">vibration</span>,{' '}
                <span className="font-semibold text-[#0b4ea2]">temperature</span>,{' '}
                <span className="font-semibold text-[#0b4ea2]">crack</span>, or{' '}
                <span className="font-semibold text-[#0b4ea2]">inspection</span>
              </div>
            </div>
          )}

          {/* Footer Bar with shortcuts guidance */}
          <div className="bg-slate-50 px-3 py-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <div className="flex items-center gap-2">
              <span>Navigate <kbd className="font-mono bg-white px-1 py-0.5 rounded border border-slate-200 shadow-2xs">↑</kbd><kbd className="font-mono bg-white px-1 py-0.5 rounded border border-slate-200 shadow-2xs">↓</kbd></span>
              <span>Select <kbd className="font-mono bg-white px-1 py-0.5 rounded border border-slate-200 shadow-2xs">↵</kbd></span>
              <span>Close <kbd className="font-mono bg-white px-1 py-0.5 rounded border border-slate-200 shadow-2xs">Esc</kbd></span>
            </div>
            {query && (
              <button
                type="button"
                onClick={() => {
                  navigate(`/alerts?search=${encodeURIComponent(query.trim())}`);
                  setIsOpen(false);
                }}
                className="text-[#0b4ea2] hover:underline font-bold"
              >
                Search all in Alerts &rarr;
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
