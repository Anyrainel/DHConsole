import React, { useEffect } from 'react';
import { Button, Select, MenuItem, Typography, Box } from '@mui/material';
import { ThemeSwitcher } from '@toolpad/core/DashboardLayout';
import { useTranslation } from 'react-i18next';
import MuipService, { USE_SSL_STORAGE_KEY } from '../api/MuipService';
import CommandService from '../api/CommandService';
import { usePlayerContext } from '../store/playerContext';
import { useSnackbar } from '../store/SnackbarContext';
import ConfigSelectionDialog from './ConfigSelectionDialog';

// Add type declaration for File System Access API
declare global {
  interface Window {
    showOpenFilePicker(options?: {
      types?: Array<{
        description: string;
        accept: Record<string, string[]>;
      }>;
    }): Promise<FileSystemFileHandle[]>;
  }
}

interface ServerState {
  players: { uid: number; name: string }[];
  serverTime: string;
  serverMemory: string;
}

const ADMIN_KEY_STORAGE_KEY = 'muip-admin-key';
const PORT_STORAGE_KEY = 'muip-port';

const ServerToolbarActions = () => {
  const { t } = useTranslation();
  const { playerUid, setPlayerUid, isConnected, setIsConnected } = usePlayerContext();
  const [state, setState] = React.useState<ServerState>({
    players: [],
    serverTime: '',
    serverMemory: '',
  });
  const { showSnackbar } = useSnackbar();
  const [configDialogOpen, setConfigDialogOpen] = React.useState(false);

  const updatePlayerUid = (uid: number) => {
    CommandService.setPlayerUid(uid);
    setPlayerUid(uid);
  }

  const fetchServerInfo = async () => {
    try {
      const serverInfo = await MuipService.getServerInformation();
      setState((prevState) => ({
        players: serverInfo.onlinePlayers,
        serverTime: new Date(serverInfo.serverTime * 1000).toLocaleString([], { hour: '2-digit', minute: '2-digit' }),
        serverMemory: `${(serverInfo.programUsedMemory).toFixed(2)} MB`,
      }));

      if (serverInfo.onlinePlayers.length > 0) {
        updatePlayerUid(serverInfo.onlinePlayers[0].uid);
      }
      setIsConnected(true);
    } catch (error) {
      showSnackbar(t('server.messages.fetchError'), 'error');
      setIsConnected(false);
    }
  };

  const handleConnect = () => {
    setConfigDialogOpen(true);
  };

  const handleSelectFile = async () => {
    try {
      const fileHandle = await window.showOpenFilePicker({
        types: [
          {
            description: 'JSON Config File',
            accept: {
              'application/json': ['.json']
            }
          }
        ]
      });

      const file = await fileHandle[0].getFile();
      const content = await file.text();
      const config = JSON.parse(content);

      const adminKey = config?.MuipServer?.AdminKey;
      if (!adminKey) {
        throw new Error('Invalid config file: AdminKey not found');
      }

      localStorage.setItem(ADMIN_KEY_STORAGE_KEY, adminKey);
      MuipService.setAdminKey(adminKey);

      // Set SSL flag from config
      const useSSL = config?.HttpServer?.UseSSL;
      if (useSSL != null) {
        localStorage.setItem(USE_SSL_STORAGE_KEY, useSSL.toString());
        MuipService.setUseSSL(useSSL);
      }

      // Set port if specified in config
      const port = config?.HttpServer?.Port;
      if (port != null && port >= 1 && port <= 65535) {
        localStorage.setItem(PORT_STORAGE_KEY, port.toString());
        MuipService.setPort(port);
      } else {
        localStorage.setItem(PORT_STORAGE_KEY, '443');
        MuipService.setPort(443);
      }

      setConfigDialogOpen(false);
      fetchServerInfo();
    } catch (error) {
      showSnackbar(t('server.messages.configError'), 'error');
    }
  };

  const handleUseRecent = () => {
    const adminKey = localStorage.getItem(ADMIN_KEY_STORAGE_KEY);
    const port = parseInt(localStorage.getItem(PORT_STORAGE_KEY) || '443', 10);
    const useSSL = localStorage.getItem(USE_SSL_STORAGE_KEY);

    if (adminKey) {
      MuipService.setAdminKey(adminKey);
      MuipService.setPort(port);
      if (useSSL !== null) {
        MuipService.setUseSSL(useSSL === 'true');
      }
      setConfigDialogOpen(false);
      fetchServerInfo();
    }
  };

  const handleSaveManualKey = (adminKey: string, port: number) => {
    if (!adminKey.trim()) {
      showSnackbar(t('server.messages.emptyKey'), 'error');
      return;
    }

    if (port < 1 || port > 65535 || isNaN(port)) {
      showSnackbar(t('server.messages.invalidPort'), 'error');
      return;
    }

    localStorage.setItem(ADMIN_KEY_STORAGE_KEY, adminKey);
    localStorage.setItem(PORT_STORAGE_KEY, port.toString());
    MuipService.setAdminKey(adminKey);
    MuipService.setPort(port);
    setConfigDialogOpen(false);
    fetchServerInfo();
  };

  useEffect(() => {
    const adminKey = localStorage.getItem(ADMIN_KEY_STORAGE_KEY);
    if (adminKey && !isConnected) {
      handleUseRecent();
    }
  }, []);

  useEffect(() => {
    let interval: number;

    if (isConnected) {
      interval = window.setInterval(fetchServerInfo, 5000);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isConnected]);

  return (
    <>
      <Box display="flex" alignItems="center" gap={2}>
        <Select
          value={playerUid || ''}
          onChange={(e) => updatePlayerUid(Number(e.target.value))}
          disabled={!isConnected}
          displayEmpty
          sx={{ height: '45px', padding: '0 14px', boxSizing: 'border-box' }}
        >
          <MenuItem value="" disabled>
            {isConnected ? t('server.selectPlayer') : t('server.disconnected')}
          </MenuItem>
          {state.players.map((player) => (
            <MenuItem key={player.uid} value={player.uid}>
              {player.name} ({player.uid})
            </MenuItem>
          ))}
        </Select>

        <Button
          variant="contained"
          color="primary"
          onClick={handleConnect}
          disabled={isConnected}
        >
          {isConnected ? t('server.connected') : t('server.connect')}
        </Button>

        <Box display="flex" flexDirection="column">
          <Typography variant="body2">
            {t('server.serverTime')}: {isConnected && state.serverTime ? state.serverTime : '--'}
          </Typography>
          <Typography variant="body2">
            {t('server.memoryUsed')}: {isConnected && state.serverMemory ? state.serverMemory : '--'}
          </Typography>
        </Box>

        <Box marginLeft="auto">
          <ThemeSwitcher />
        </Box>
      </Box>

      <ConfigSelectionDialog
        open={configDialogOpen}
        onClose={() => setConfigDialogOpen(false)}
        onSelectFile={handleSelectFile}
        onUseRecent={handleUseRecent}
        onSaveManualKey={handleSaveManualKey}
        hasRecentConfig={Boolean(localStorage.getItem(ADMIN_KEY_STORAGE_KEY))}
      />
    </>
  );
};

export default ServerToolbarActions;
