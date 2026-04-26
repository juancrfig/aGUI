/**
 * aGUI Plugin — Atom-inspired floating cluster interface
 * Single IIFE bundle. Uses window.__HERMES_PLUGIN_SDK__ (React, hooks, components)
 */
(function () {
  'use strict';

  // ---------------------------------------------------------------------------
  // SDK Access
  // ---------------------------------------------------------------------------
  const SDK = window.__HERMES_PLUGIN_SDK__;
  if (!SDK) {
    console.error('[aGUI] Hermes Plugin SDK not found');
    return;
  }

  const { React } = SDK;
  const { useState, useEffect, useCallback, useRef, useMemo } = SDK.hooks;
  const { Button, Input, Badge } = SDK.components;
  const { cn } = SDK.utils;
  const { fetchJSON } = SDK;

  // ---------------------------------------------------------------------------
  // Constants
  // ---------------------------------------------------------------------------
  const MAX_ELECTRONS = 7;
  const NUCLEUS_SIZE = 56;
  const ELECTRON_SIZE = 44;
  const RING_1_RADIUS = 70;
  const RING_2_RADIUS = 110;

  // Pre-defined seed electrons (dashboard tabs)
  const SEED_ELECTRONS = [
    { id: 'seed-sessions', label: 'Sessions', icon: 'MessageSquare', target: '/sessions', count: 0 },
    { id: 'seed-cron', label: 'Cron', icon: 'Clock', target: '/cron', count: 0 },
    { id: 'seed-skills', label: 'Skills', icon: 'Wrench', target: '/skills', count: 0 },
    { id: 'seed-config', label: 'Config', icon: 'Settings', target: '/config', count: 0 },
    { id: 'seed-logs', label: 'Logs', icon: 'ScrollText', target: '/logs', count: 0 },
    { id: 'seed-analytics', label: 'Analytics', icon: 'BarChart3', target: '/analytics', count: 0 },
  ];

  // ---------------------------------------------------------------------------
  // Utility: Compute electron positions in concentric rings
  // ---------------------------------------------------------------------------
  function computeRingPositions(count, ring1Max) {
    const positions = [];
    const ring1Count = Math.min(count, ring1Max);
    for (let i = 0; i < ring1Count; i++) {
      const angle = (2 * Math.PI * i) / ring1Count - Math.PI / 2;
      positions.push({
        x: Math.cos(angle) * RING_1_RADIUS,
        y: Math.sin(angle) * RING_1_RADIUS,
        ring: 1,
      });
    }
    const ring2Count = count - ring1Count;
    for (let i = 0; i < ring2Count; i++) {
      const angle = (2 * Math.PI * i) / Math.max(ring2Count, 1) - Math.PI / 2 + Math.PI / ring1Max;
      positions.push({
        x: Math.cos(angle) * RING_2_RADIUS,
        y: Math.sin(angle) * RING_2_RADIUS,
        ring: 2,
      });
    }
    return positions;
  }

  // ---------------------------------------------------------------------------
  // Icon renderer (simple SVG for Lucide icons)
  // ---------------------------------------------------------------------------
  function Icon({ name, size = 20, className }) {
    // Minimal SVG map for the icons we use
    const icons = {
      Zap: `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>`,
      MessageSquare: `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>`,
      Clock: `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>`,
      Wrench: `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>`,
      Settings: `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>`,
      ScrollText: `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 21h12a2 2 0 0 0 2-2v-2H10v2a2 2 0 1 1-4 0V5a2 2 0 1 0-4 0v14a2 2 0 0 0 2 2z"/><path d="M10 17V5h12v12a2 2 0 0 1-2 2H10z"/><path d="M10 9h8"/><path d="M10 13h8"/></svg>`,
      BarChart3: `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 3v18h18"/><path d="M18 17V9"/><path d="M13 17V5"/><path d="M8 17v-3"/></svg>`,
      X: `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`,
      Plus: `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>`,
      Trash2: `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>`,
      Bell: `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></svg>`,
      CheckCircle: `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>`,
      AlertCircle: `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>`,
    };

    const svg = icons[name] || icons['Zap'];
    return React.createElement('span', {
      className: cn('agui-icon', className),
      dangerouslySetInnerHTML: { __html: svg },
    });
  }

  // ---------------------------------------------------------------------------
  // Nucleus Component
  // ---------------------------------------------------------------------------
  function Nucleus({ isOpen, onClick, pendingCount }) {
    return React.createElement('button', {
      className: cn(
        'agui-nucleus',
        isOpen && 'agui-nucleus--open'
      ),
      onClick,
      style: {
        width: NUCLEUS_SIZE,
        height: NUCLEUS_SIZE,
        borderRadius: '50%',
      },
      'aria-label': isOpen ? 'Close cluster' : 'Open cluster',
    }, [
      React.createElement(Icon, { key: 'icon', name: isOpen ? 'X' : 'Zap', size: 24 }),
      pendingCount > 0 && React.createElement('span', {
        key: 'badge',
        className: 'agui-nucleus-badge',
      }, pendingCount),
    ]);
  }

  // ---------------------------------------------------------------------------
  // Electron Component
  // ---------------------------------------------------------------------------
  function Electron({ data, position, index, onClick, onRemove, isNew }) {
    const [showRemove, setShowRemove] = useState(false);
    const size = ELECTRON_SIZE;

    return React.createElement('div', {
      className: cn(
        'agui-electron',
        isNew && 'agui-electron--new'
      ),
      style: {
        width: size,
        height: size,
        transform: `translate(${position.x}px, ${position.y}px)`,
        transitionDelay: `${index * 40}ms`,
      },
      onMouseEnter: () => setShowRemove(true),
      onMouseLeave: () => setShowRemove(false),
    }, [
      React.createElement('button', {
        key: 'btn',
        className: 'agui-electron__btn',
        onClick: () => onClick(data),
        title: data.label,
      }, [
        React.createElement(Icon, { key: 'icon', name: data.icon || 'Zap', size: 18 }),
        React.createElement('span', { key: 'label', className: 'agui-electron__label' }, data.label),
      ]),
      showRemove && React.createElement('button', {
        key: 'remove',
        className: 'agui-electron__remove',
        onClick: (e) => { e.stopPropagation(); onRemove(data.id); },
        title: 'Remove',
      }, React.createElement(Icon, { name: 'X', size: 12 })),
    ]);
  }

  // ---------------------------------------------------------------------------
  // Satellite Component (overflow electron)
  // ---------------------------------------------------------------------------
  function Satellite({ data, position, onClick, onRemove, onDragEnd }) {
    const [isDragging, setIsDragging] = useState(false);
    const [pos, setPos] = useState(position);
    const dragStart = useRef({ x: 0, y: 0 });

    const handleMouseDown = useCallback((e) => {
      setIsDragging(true);
      dragStart.current = { x: e.clientX - pos.x, y: e.clientY - pos.y };
    }, [pos]);

    useEffect(() => {
      if (!isDragging) return;
      const handleMouseMove = (e) => {
        setPos({ x: e.clientX - dragStart.current.x, y: e.clientY - dragStart.current.y });
      };
      const handleMouseUp = () => {
        setIsDragging(false);
        onDragEnd(data.id, pos);
      };
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }, [isDragging, pos, data.id, onDragEnd]);

    return React.createElement('div', {
      className: cn('agui-satellite', isDragging && 'agui-satellite--dragging'),
      style: {
        width: ELECTRON_SIZE,
        height: ELECTRON_SIZE,
        left: pos.x,
        top: pos.y,
      },
      onMouseDown: handleMouseDown,
    }, [
      React.createElement('button', {
        key: 'btn',
        className: 'agui-satellite__btn',
        onClick: () => !isDragging && onClick(data),
        title: data.label,
      }, [
        React.createElement(Icon, { key: 'icon', name: data.icon || 'Zap', size: 16 }),
      ]),
      React.createElement('button', {
        key: 'remove',
        className: 'agui-satellite__remove',
        onClick: (e) => { e.stopPropagation(); onRemove(data.id); },
      }, React.createElement(Icon, { name: 'X', size: 10 })),
    ]);
  }

  // ---------------------------------------------------------------------------
  // Chat Input Component ("+" button expanded)
  // ---------------------------------------------------------------------------
  function ChatInput({ onSubmit, onClose }) {
    const [value, setValue] = useState('');
    const inputRef = useRef(null);

    useEffect(() => {
      inputRef.current?.focus();
    }, []);

    const handleSubmit = useCallback((e) => {
      e.preventDefault();
      if (value.trim()) {
        onSubmit(value.trim());
        setValue('');
      }
    }, [value, onSubmit]);

    return React.createElement('form', {
      className: 'agui-chat',
      onSubmit: handleSubmit,
    }, [
      React.createElement(Input, {
        key: 'input',
        ref: inputRef,
        value,
        onChange: (e) => setValue(e.target.value),
        placeholder: 'What do you want to do?',
        className: 'agui-chat__input',
      }),
      React.createElement(Button, {
        key: 'send',
        type: 'submit',
        size: 'sm',
        className: 'agui-chat__send',
      }, React.createElement(Icon, { name: 'Zap', size: 16 })),
    ]);
  }

  // ---------------------------------------------------------------------------
  // Notification Trail (Dynamic Island)
  // ---------------------------------------------------------------------------
  function NotificationTrail({ notifications, onDismiss }) {
    if (!notifications.length) return null;

    const latest = notifications[notifications.length - 1];

    return React.createElement('div', {
      className: cn(
        'agui-notification',
        `agui-notification--${latest.type}`,
        notifications.length > 1 && 'agui-notification--stacked'
      ),
      onClick: () => onDismiss(latest.id),
    }, [
      React.createElement(Icon, {
        key: 'icon',
        name: latest.type === 'error' ? 'AlertCircle' : 'CheckCircle',
        size: 16,
        className: 'agui-notification__icon',
      }),
      React.createElement('span', {
        key: 'text',
        className: 'agui-notification__text',
      }, latest.message),
      notifications.length > 1 && React.createElement(Badge, {
        key: 'count',
        variant: 'secondary',
        className: 'agui-notification__count',
      }, `+${notifications.length - 1}`),
    ]);
  }

  // ---------------------------------------------------------------------------
  // Trash Zone (drop to delete)
  // ---------------------------------------------------------------------------
  function TrashZone({ visible, onDrop }) {
    if (!visible) return null;
    return React.createElement('div', {
      className: 'agui-trash',
      onDragOver: (e) => e.preventDefault(),
      onDrop: (e) => {
        e.preventDefault();
        const id = e.dataTransfer?.getData('text/plain');
        if (id) onDrop(id);
      },
    }, [
      React.createElement(Icon, { key: 'icon', name: 'Trash2', size: 24 }),
      React.createElement('span', { key: 'label' }, 'Drop here to remove'),
    ]);
  }

  // ---------------------------------------------------------------------------
  // Main Cluster Component
  // ---------------------------------------------------------------------------
  function AtomCluster() {
    const [isOpen, setIsOpen] = useState(false);
    const [showChat, setShowChat] = useState(false);
    const [electrons, setElectrons] = useState(SEED_ELECTRONS);
    const [satellites, setSatellites] = useState([]);
    const [notifications, setNotifications] = useState([]);
    const [trashVisible, setTrashVisible] = useState(false);
    const [newElectronId, setNewElectronId] = useState(null);
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const clusterRef = useRef(null);

    // Load saved state from localStorage
    useEffect(() => {
      try {
        const saved = localStorage.getItem('agui-state');
        if (saved) {
          const state = JSON.parse(saved);
          if (state.electrons) setElectrons(state.electrons);
          if (state.satellites) setSatellites(state.satellites);
          if (state.position) setPosition(state.position);
        }
      } catch (e) {
        console.warn('[aGUI] Failed to load state', e);
      }
    }, []);

    // Persist state
    useEffect(() => {
      const state = { electrons, satellites, position };
      localStorage.setItem('agui-state', JSON.stringify(state));
    }, [electrons, satellites, position]);

    // Position cluster at bottom-right by default
    useEffect(() => {
      if (!position.x && !position.y) {
        const margin = 24;
        setPosition({
          x: window.innerWidth - NUCLEUS_SIZE - margin,
          y: window.innerHeight - NUCLEUS_SIZE - margin,
        });
      }
    }, [position]);

    // SSE: Connect to notification stream
    useEffect(() => {
      let es = null;
      try {
        es = new EventSource('/api/plugins/agui/notifications');
        es.onmessage = (ev) => {
          if (ev.data.startsWith(':')) return; // heartbeat
          try {
            const data = JSON.parse(ev.data);
            setNotifications((prev) => {
              const next = [...prev, { ...data, id: Date.now() + Math.random() }];
              return next.slice(-10); // keep last 10
            });
          } catch (e) {
            console.warn('[aGUI] Bad SSE data', e);
          }
        };
        es.onerror = () => {
          // Auto-reconnect handled by browser
        };
      } catch (e) {
        console.warn('[aGUI] SSE not available', e);
      }
      return () => { es?.close(); };
    }, []);

    // Compute ring positions for electrons (sorted by usage count desc)
    const sortedElectrons = useMemo(() => {
      return [...electrons].sort((a, b) => (b.count || 0) - (a.count || 0));
    }, [electrons]);

    const ringPositions = useMemo(() => {
      const visible = sortedElectrons.slice(0, MAX_ELECTRONS);
      return computeRingPositions(visible.length, 4);
    }, [sortedElectrons]);

    const visibleElectrons = sortedElectrons.slice(0, MAX_ELECTRONS);
    const overflowElectrons = sortedElectrons.slice(MAX_ELECTRONS);

    // Handlers
    const toggleOpen = useCallback(() => {
      setIsOpen((prev) => !prev);
      setShowChat(false);
    }, []);

    const handleElectronClick = useCallback((data) => {
      // Increment usage count
      setElectrons((prev) =>
        prev.map((e) => (e.id === data.id ? { ...e, count: (e.count || 0) + 1 } : e))
      );
      // Navigate
      if (data.target && window.__HERMES_DASHBOARD__) {
        window.__HERMES_DASHBOARD__.navigate(data.target);
      } else {
        window.location.hash = data.target;
      }
    }, []);

    const handleRemoveElectron = useCallback((id) => {
      setElectrons((prev) => prev.filter((e) => e.id !== id));
      setSatellites((prev) => prev.filter((s) => s.id !== id));
    }, []);

    const handleSatelliteDragEnd = useCallback((id, pos) => {
      // Check if dropped near nucleus (demote to electron)
      const nucleusX = position.x + NUCLEUS_SIZE / 2;
      const nucleusY = position.y + NUCLEUS_SIZE / 2;
      const dist = Math.hypot(pos.x - nucleusX, pos.y - nucleusY);
      if (dist < RING_2_RADIUS + 40) {
        // Demote: move back to electrons
        const sat = satellites.find((s) => s.id === id);
        if (sat) {
          setSatellites((prev) => prev.filter((s) => s.id !== id));
          setElectrons((prev) => [...prev, { ...sat, count: sat.count || 0 }]);
        }
      }
    }, [position, satellites]);

    const handleChatSubmit = useCallback(async (message) => {
      setShowChat(false);
      try {
        const res = await fetchJSON('/api/plugins/agui/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message }),
        });

        if (res.action === 'navigate') {
          // Add as new electron
          const newElectron = {
            id: res.electron_id || `electron-${Date.now()}`,
            label: res.label,
            icon: res.icon || 'Zap',
            target: res.target,
            count: 1,
          };
          setElectrons((prev) => [...prev, newElectron]);
          setNewElectronId(newElectron.id);
          setTimeout(() => setNewElectronId(null), 2000);

          // If overflow, promote least-used to satellite
          const all = [...electrons, newElectron];
          if (all.length > MAX_ELECTRONS) {
            const sorted = [...all].sort((a, b) => (a.count || 0) - (b.count || 0));
            const toPromote = sorted[0];
            setElectrons((prev) => prev.filter((e) => e.id !== toPromote.id));
            setSatellites((prev) => [
              ...prev,
              { ...toPromote, x: position.x + 140, y: position.y - 40 },
            ]);
          }

          // Navigate
          if (window.__HERMES_DASHBOARD__) {
            window.__HERMES_DASHBOARD__.navigate(res.target);
          } else {
            window.location.hash = res.target;
          }
        } else if (res.action === 'github_issue') {
          const draftRes = await fetchJSON('/api/plugins/agui/github-draft', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              title: res.title,
              body: res.body,
              labels: res.labels,
            }),
          });
          if (draftRes.issue_url) {
            window.open(draftRes.issue_url, '_blank');
          }
        } else if (res.action === 'info') {
          setNotifications((prev) => [
            ...prev,
            { id: Date.now(), type: 'info', message: res.message },
          ]);
        }
      } catch (err) {
        console.error('[aGUI] Chat error', err);
        setNotifications((prev) => [
          ...prev,
          { id: Date.now(), type: 'error', message: 'Failed to process request' },
        ]);
      }
    }, [electrons, position]);

    const handleDismissNotification = useCallback((id) => {
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    }, []);

    // Drag the entire cluster
    const handleClusterMouseDown = useCallback((e) => {
      if (e.target.closest('.agui-electron') || e.target.closest('.agui-satellite')) return;
      const startX = e.clientX - position.x;
      const startY = e.clientY - position.y;
      setTrashVisible(true);

      const handleMouseMove = (ev) => {
        setPosition({ x: ev.clientX - startX, y: ev.clientY - startY });
      };
      const handleMouseUp = () => {
        setTrashVisible(false);
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }, [position]);

    return React.createElement('div', {
      className: 'agui-root',
    }, [
      // Notification trail
      React.createElement(NotificationTrail, {
        key: 'notifications',
        notifications,
        onDismiss: handleDismissNotification,
      }),

      // Trash zone
      React.createElement(TrashZone, {
        key: 'trash',
        visible: trashVisible,
        onDrop: handleRemoveElectron,
      }),

      // Main cluster
      React.createElement('div', {
        key: 'cluster',
        ref: clusterRef,
        className: cn('agui-cluster', isOpen && 'agui-cluster--open'),
        style: {
          left: position.x,
          top: position.y,
        },
        onMouseDown: handleClusterMouseDown,
      }, [
        // Electrons (ring)
        isOpen && visibleElectrons.map((electron, i) =>
          React.createElement(Electron, {
            key: electron.id,
            data: electron,
            position: ringPositions[i] || { x: 0, y: 0 },
            index: i,
            onClick: handleElectronClick,
            onRemove: handleRemoveElectron,
            isNew: electron.id === newElectronId,
          })
        ),

        // Nucleus
        React.createElement(Nucleus, {
          key: 'nucleus',
          isOpen,
          onClick: toggleOpen,
          pendingCount: notifications.length,
        }),
      ]),

      // Chat input (appears when "+" is active)
      isOpen && React.createElement('div', {
        key: 'chat-wrap',
        className: 'agui-chat-wrap',
        style: {
          left: position.x,
          top: position.y - 60,
        },
      }, [
        showChat
          ? React.createElement(ChatInput, {
              key: 'chat',
              onSubmit: handleChatSubmit,
              onClose: () => setShowChat(false),
            })
          : React.createElement(Button, {
              key: 'plus',
              className: 'agui-plus-btn',
              onClick: () => setShowChat(true),
              size: 'sm',
            }, React.createElement(Icon, { name: 'Plus', size: 18 })),
      ]),

      // Satellites (overflow)
      satellites.map((sat) =>
        React.createElement(Satellite, {
          key: sat.id,
          data: sat,
          position: { x: sat.x, y: sat.y },
          onClick: handleElectronClick,
          onRemove: handleRemoveElectron,
          onDragEnd: handleSatelliteDragEnd,
        })
      ),
    ]);
  }

  // ---------------------------------------------------------------------------
  // Plugin Registration
  // ---------------------------------------------------------------------------
  window.__HERMES_PLUGIN_SDK__.register({
    name: 'agui',
    render: (props) => {
      return React.createElement(AtomCluster, props);
    },
  });

  console.log('[aGUI] Plugin registered successfully');
})();
