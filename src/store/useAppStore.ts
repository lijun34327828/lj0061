import { create } from 'zustand';
import type { Estate, Alert, Staff, WSMessage } from '@/types';
import { connectWS } from '@/api';

interface AppState {
  currentEstate: Estate | null;
  currentEstateId: string | null;
  setCurrentEstate: (estate: Estate | null) => void;
  setCurrentEstateId: (id: string | null) => void;

  alerts: Alert[];
  setAlerts: (alerts: Alert[]) => void;
  addAlert: (alert: Alert) => void;
  updateAlert: (id: string, data: Partial<Alert>) => void;
  removeAlert: (id: string) => void;

  staffList: Staff[];
  setStaffList: (staff: Staff[]) => void;

  wsConnected: boolean;
  wsInstance: WebSocket | null;
  connectWebSocket: () => void;
  disconnectWebSocket: () => void;

  sidebarExpanded: boolean;
  toggleSidebar: () => void;
  setSidebarExpanded: (expanded: boolean) => void;
}

export const useAppStore = create<AppState>((set, get) => ({
  currentEstate: null,
  currentEstateId: null,
  setCurrentEstate: (estate) => set({ currentEstate: estate, currentEstateId: estate?.id || null }),
  setCurrentEstateId: (id) => set({ currentEstateId: id }),

  alerts: [],
  setAlerts: (alerts) => set({ alerts }),
  addAlert: (alert) => set((state) => ({ alerts: [alert, ...state.alerts] })),
  updateAlert: (id, data) => set((state) => ({
    alerts: state.alerts.map((a) => (a.id === id ? { ...a, ...data } : a)),
  })),
  removeAlert: (id) => set((state) => ({
    alerts: state.alerts.filter((a) => a.id !== id),
  })),

  staffList: [],
  setStaffList: (staff) => set({ staffList: staff }),

  wsConnected: false,
  wsInstance: null,
  connectWebSocket: () => {
    if (get().wsInstance && get().wsInstance.readyState === WebSocket.OPEN) {
      return;
    }
    const ws = connectWS();
    set({ wsInstance: ws });

    ws.addEventListener('open', () => {
      set({ wsConnected: true });
    });

    ws.addEventListener('close', () => {
      set({ wsConnected: false });
    });

    ws.addEventListener('error', () => {
      set({ wsConnected: false });
    });

    ws.addEventListener('message', (event) => {
      try {
        const message: WSMessage = JSON.parse(event.data);
        if (message.type === 'alert') {
          const alert = message.data as Alert;
          get().addAlert(alert);
        }
      } catch {
        // parse error
      }
    });
  },
  disconnectWebSocket: () => {
    const { wsInstance } = get();
    if (wsInstance) {
      wsInstance.close();
    }
    set({ wsInstance: null, wsConnected: false });
  },

  sidebarExpanded: false,
  toggleSidebar: () => set((state) => ({ sidebarExpanded: !state.sidebarExpanded })),
  setSidebarExpanded: (expanded) => set({ sidebarExpanded: expanded }),
}));
