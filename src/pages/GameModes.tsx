import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  TextField,
  Card,
  CardContent,
  Grid,
  Stack,
  Divider,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import CommandService from '../api/CommandService';

const GameModes = () => {
  const { t } = useTranslation();

  // Rogue States
  const [rogueMoney, setRogueMoney] = useState('');
  const [rogueBuffId, setRogueBuffId] = useState('');
  const [rogueMiracleId, setRogueMiracleId] = useState('');

  // Grid States
  const [gridGold, setGridGold] = useState('');
  const [gridRoleId, setGridRoleId] = useState('');
  const [gridRoleTier, setGridRoleTier] = useState('');
  const [gridEquipId, setGridEquipId] = useState('');
  const [gridOrbId, setGridOrbId] = useState('');
  const [gridConsumableId, setGridConsumableId] = useState('');

  const handleRogueMoney = async () => {
    await CommandService.rogueMoney(parseInt(rogueMoney, 10));
  };

  const handleRogueBuff = async () => {
    await CommandService.rogueBuff(parseInt(rogueBuffId, 10));
  };

  const handleRogueMiracle = async () => {
    await CommandService.rogueMiracle(parseInt(rogueMiracleId, 10));
  };

  const handleRogueRoll = async () => {
    await CommandService.rogueRoll();
  };

  const handleRogueEnhance = async () => {
    await CommandService.rogueEnhance();
  };

  const handleGridGold = async () => {
    await CommandService.gridGold(parseInt(gridGold, 10));
  };

  const handleGridRole = async () => {
    await CommandService.gridRole(parseInt(gridRoleId, 10), parseInt(gridRoleTier, 10));
  };

  const handleGridEquip = async () => {
    await CommandService.gridEquip(parseInt(gridEquipId, 10));
  };

  const handleGridOrb = async () => {
    await CommandService.gridOrb(parseInt(gridOrbId, 10));
  };

  const handleGridConsumable = async () => {
    await CommandService.gridConsumable(parseInt(gridConsumableId, 10));
  };

  return (
    <Box p={2}>
      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>{t('gamemodes.rogue.title')}</Typography>
              <Stack spacing={2}>
                <Box display="flex" gap={1}>
                  <TextField
                    label={t('gamemodes.rogue.money')}
                    value={rogueMoney}
                    onChange={(e) => setRogueMoney(e.target.value)}
                    type="number"
                    fullWidth
                    size="small"
                  />
                  <Button variant="contained" onClick={handleRogueMoney}>{t('gamemodes.actions.set')}</Button>
                </Box>
                <Box display="flex" gap={1}>
                  <TextField
                    label={t('gamemodes.rogue.buff')}
                    value={rogueBuffId}
                    onChange={(e) => setRogueBuffId(e.target.value)}
                    type="number"
                    fullWidth
                    size="small"
                  />
                  <Button variant="contained" onClick={handleRogueBuff}>{t('gamemodes.actions.add')}</Button>
                </Box>
                <Box display="flex" gap={1}>
                  <TextField
                    label={t('gamemodes.rogue.miracle')}
                    value={rogueMiracleId}
                    onChange={(e) => setRogueMiracleId(e.target.value)}
                    type="number"
                    fullWidth
                    size="small"
                  />
                  <Button variant="contained" onClick={handleRogueMiracle}>{t('gamemodes.actions.add')}</Button>
                </Box>
                <Divider />
                <Box display="flex" gap={1}>
                  <Button variant="contained" fullWidth onClick={handleRogueRoll}>{t('gamemodes.rogue.roll')}</Button>
                  <Button variant="contained" fullWidth onClick={handleRogueEnhance}>{t('gamemodes.rogue.enhance')}</Button>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>{t('gamemodes.grid.title')}</Typography>
              <Stack spacing={2}>
                 <Box display="flex" gap={1}>
                  <TextField
                    label={t('gamemodes.grid.gold')}
                    value={gridGold}
                    onChange={(e) => setGridGold(e.target.value)}
                    type="number"
                    fullWidth
                    size="small"
                  />
                  <Button variant="contained" onClick={handleGridGold}>{t('gamemodes.actions.set')}</Button>
                </Box>
                <Box display="flex" gap={1}>
                  <TextField
                    label={t('gamemodes.grid.roleId')}
                    value={gridRoleId}
                    onChange={(e) => setGridRoleId(e.target.value)}
                    type="number"
                    fullWidth
                    size="small"
                  />
                   <TextField
                    label={t('gamemodes.grid.roleTier')}
                    value={gridRoleTier}
                    onChange={(e) => setGridRoleTier(e.target.value)}
                    type="number"
                    fullWidth
                    size="small"
                  />
                  <Button variant="contained" onClick={handleGridRole}>{t('gamemodes.actions.set')}</Button>
                </Box>
                <Box display="flex" gap={1}>
                  <TextField
                    label={t('gamemodes.grid.equip')}
                    value={gridEquipId}
                    onChange={(e) => setGridEquipId(e.target.value)}
                    type="number"
                    fullWidth
                    size="small"
                  />
                  <Button variant="contained" onClick={handleGridEquip}>{t('gamemodes.actions.add')}</Button>
                </Box>
                <Box display="flex" gap={1}>
                  <TextField
                    label={t('gamemodes.grid.orb')}
                    value={gridOrbId}
                    onChange={(e) => setGridOrbId(e.target.value)}
                    type="number"
                    fullWidth
                    size="small"
                  />
                  <Button variant="contained" onClick={handleGridOrb}>{t('gamemodes.actions.add')}</Button>
                </Box>
                <Box display="flex" gap={1}>
                  <TextField
                    label={t('gamemodes.grid.consumable')}
                    value={gridConsumableId}
                    onChange={(e) => setGridConsumableId(e.target.value)}
                    type="number"
                    fullWidth
                    size="small"
                  />
                  <Button variant="contained" onClick={handleGridConsumable}>{t('gamemodes.actions.add')}</Button>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default GameModes;
