import * as React from 'react';
import { useState, useEffect } from 'react';
import { TextField, Button, Typography, Card, CardContent, IconButton, List, ListItem, ListItemText, Box, Divider, Dialog, DialogTitle, DialogActions, DialogContent } from '@mui/material';
import Grid from '@mui/material/Grid2';
import CommandService from '../api/CommandService';
import GameData from '../store/gameData';
import SearchIcon from '@mui/icons-material/Search';
import DeleteIcon from '@mui/icons-material/Delete';
import { useLanguageContext } from '../store/languageContext';
import { usePlayerContext } from '../store/playerContext';
import { useDialogs, DialogProps } from '@toolpad/core/useDialogs';
import { useTranslation } from 'react-i18next';

export default function Inventory() {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<Record<number, string>>({});
  const [sendItemCounts, setSendItemCounts] = useState<Record<number, number>>({});
  const [items, setItems] = useState<Record<number, number>>({});
  const [loading, setLoading] = useState(false);
  const { language } = useLanguageContext();
  const { playerUid, isConnected } = usePlayerContext();
  const dialogs = useDialogs();
  const { t } = useTranslation();
  var allItems: Record<number, string> = {};

  useEffect(() => {
    const fetchItems = async () => {
      setLoading(true);
      await GameData.loadItem(language);
      setLoading(false);
    };
    if (!isConnected) {
      return;
    }
    fetchItems();
  }, [language, isConnected]);

  const fetchItems = async () => {
    if (!isConnected) {
      return;
    }
    const inventory = await CommandService.getInventory();
    setItems(inventory);
  };

  useEffect(() => {
    fetchItems();
  }, [playerUid, isConnected]);

  const handleSearch = () => {
    if (searchTerm === '') {
      setSearchResults({});
      return;
    }
    var allItems = GameData.getAllItems(language);
    const searchResults = Object.entries(allItems).filter(([, name]) =>
      name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setSearchResults(Object.fromEntries(searchResults));
    setSendItemCounts(Object.fromEntries(searchResults.map(([id,]) => [id, 1])));
  };

  const handleSendItem = async (itemId: number, count: number) => {
    await CommandService.giveItem(itemId, count);
  };

  function confirmRemoval({ payload, open, onClose }: DialogProps<string, boolean>) {
    return <Dialog open={open} onClose={() => onClose(false)}>
      <DialogTitle>{t('inventory.dialog.removeConfirm.title', { type: payload })}</DialogTitle>
      <DialogContent>{t('inventory.dialog.removeConfirm.content', { type: payload })}</DialogContent>
      <DialogActions>
        <Button onClick={() => onClose(false)}>{t('inventory.dialog.removeConfirm.cancel')}</Button>
        <Button onClick={() => onClose(true)}>{t('inventory.dialog.removeConfirm.confirm')}</Button>
      </DialogActions>
    </Dialog>
  }

  const handleRemoveEquipment = async () => {
    const confirmed = await dialogs.open(confirmRemoval, t('character.lightCone.title'));
    if (confirmed) {
      await CommandService.removeUnusedEquipment();
    }
  };

  const handleRemoveRelics = async () => {
    const confirmed = await dialogs.open(confirmRemoval, t('character.relic.title'));
    if (confirmed) {
      await CommandService.removeUnusedRelics();
    }
  };

  return (
    <Box>
      <Box style={{ display: 'flex', justifyContent: 'end', gap: '20px', alignItems: 'center' }}>
        <Button
          variant="contained"
          color="secondary"
          onClick={handleRemoveRelics}
          startIcon={<DeleteIcon />}
          sx={{ textTransform: 'none' }}>
          {t('inventory.actions.removeUnusedRelics')}
        </Button>
        <Button
          variant="contained"
          color="secondary"
          onClick={handleRemoveEquipment}
          startIcon={<DeleteIcon />}
          sx={{ textTransform: 'none' }}>
          {t('inventory.actions.removeUnusedEquipment')}
        </Button>
      </Box>
      <Typography variant="h6">{t('inventory.sections.sendItems')}</Typography>
      <Box style={{ display: 'flex', alignItems: 'center', marginBottom: '20px', maxWidth: '60%' }}>
        <TextField
          fullWidth
          label={t('inventory.search.label')}
          variant="outlined"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <IconButton onClick={handleSearch}>
          <SearchIcon />
        </IconButton>
      </Box>
      <List dense={true} sx={{ minHeight: '100px', maxWidth: '650px' }}>
        {Object.entries(searchResults).map(([id, name]) => (
          <ListItem key={id} secondaryAction={
            <Box sx={{ display: 'flex', alignItems: 'center', maxHeight: '80%' }}>
              <TextField
                type="number"
                label={t('inventory.search.count')}
                value={sendItemCounts[Number(id)]}
                onChange={(e) => setSendItemCounts({ ...sendItemCounts, [Number(id)]: Number(e.target.value) })}
                margin="dense"
                sx={{ maxWidth: '80px' }}
              />
              <Button
                variant="contained"
                color="secondary"
                onClick={() => handleSendItem(Number(id), sendItemCounts[Number(id)])}
                sx={{ marginLeft: '10px', textTransform: 'none' }}
                disabled={loading}>
                {t('inventory.actions.send')}
              </Button>
            </Box>
          }>
            <ListItemText primary={name} secondary={id} slotProps={{ primary: { variant: 'body1' } }} />
          </ListItem>
        ))}
      </List>

      <Divider style={{ margin: '16px 0' }} />
      <Typography variant="h6">{t('inventory.sections.inventory')}</Typography>
      <Grid container spacing={2}>
        {Object.entries(items).map(([id, count]) => (
          <Grid key={id} size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
            <Card>
              <CardContent sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'stretch', height: '100%' }}>
                <Box sx={{ flex: 1, overflow: 'break-all' }}>
                  <Typography variant="body1">{GameData.get(Number(id), language)}</Typography>
                  <Typography variant="body2" color="text.secondary">{id}</Typography>
                </Box>
                <Box sx={{ flex: 0.25, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', borderLeft: '1px solid #e0e0e0', paddingLeft: '5px' }}>
                  <Typography variant="body1">x{count}</Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}