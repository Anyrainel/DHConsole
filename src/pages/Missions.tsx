import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, Chip, List, ListItem, ListItemText, Divider, TextField, IconButton, ListItemButton, ListItemIcon, ListItemSecondaryAction, Switch } from '@mui/material';
import { Search as SearchIcon, Refresh as RefreshIcon, Assignment as AssignmentIcon } from '@mui/icons-material';
import CommandService from '../api/CommandService';
import GameData from '../store/gameData';
import { useLanguageContext } from '../store/languageContext';
import { usePlayerContext } from '../store/playerContext';

const missionCategories = [
  { label: 'Main Story', prefix: '1', icon: 'Book' },
  { label: 'Side Story', prefix: '2|5|6|7', icon: 'LocalLibrary' },
  { label: 'World', prefix: '4', icon: 'Map' },
  { label: 'Daily', prefix: '3', icon: 'Event' },
  { label: 'Event', prefix: '8', icon: 'Star' },
];

const Missions = () => {
  const [currentMissions, setCurrentMissions] = useState<Record<number, number[]>>({});
  const [completedMainMissions, setCompletedMainMissions] = useState<number[]>([]);
  const [completedSubMissions, setCompletedSubMissions] = useState<number[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<Record<number, string>>({});
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [waiting, setWaiting] = useState(false);
  const [showUnnamedMissions, setShowUnnamedMissions] = useState(false);
  const { language } = useLanguageContext();
  const { playerUid, isConnected } = usePlayerContext();

  useEffect(() => {
    const loadMissions = async () => {
      setLoading(true);
      await Promise.all([
        GameData.loadMainMission(language),
        GameData.loadSubMission(language),
      ]);
      setLoading(false);
    };
    if (!isConnected) {
      return;
    }
    loadMissions();
  }, [language, isConnected]);

  const fetchMissions = async () => {
    if (!isConnected) {
      return;
    }
    const missions = await CommandService.getCurrentMissions();
    setCurrentMissions(missions);
    const mainMissionIds = Object.keys(missions).map(Number);
    setCompletedMainMissions((prev) => prev.filter(id => !mainMissionIds.includes(id)));
    const subMissionIds = Object.values(missions).flat();
    setCompletedSubMissions((prev) => prev.filter(id => !subMissionIds.includes(id)));
  };

  useEffect(() => {
    fetchMissions();
  }, [playerUid, isConnected]);

  const handleSkipSubMission = (subMissionId: number) => {
    setWaiting(true);
    CommandService.finishSubMission(subMissionId);
    setCompletedSubMissions((prev) => [...prev, subMissionId]);
    fetchMissions();
    setWaiting(false);
  };

  const handleSkipMainMission = (mainMissionId: number) => {
    setWaiting(true);
    CommandService.finishMainMission(mainMissionId);
    setCompletedMainMissions((prev) => [...prev, mainMissionId]);
    fetchMissions();
    setWaiting(false);
  };
  

  const handleAcceptMission = (missionId: number) => {
    setWaiting(true);
    CommandService.acceptMainMission(missionId);
    fetchMissions();
    setWaiting(false);
  };

  const handleSearch = () => {
    if (searchTerm === '') {
      setSearchResults({});
      return;
    }
    const results = GameData.getAllMainMissions(language);
    const filteredResults = Object.entries(results).filter(([, value]) =>
      value.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setSearchResults(Object.fromEntries(filteredResults));
  };

  const toggleCategory = (category: string) => {
    setSelectedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category]
    );
  };

  const isNamedMission = (id: number) => {
    return showUnnamedMissions || GameData.get(id, language) !== '[371857150]';
  };

  const filteredMissions = Object.entries(currentMissions).filter(([mainId, subIds]) =>
    (selectedCategories.length === 0 || selectedCategories.some((category) => category.includes(mainId[0])))
    && isNamedMission(Number(mainId))
  );

  const missionCounts = missionCategories.map(category => ({
    label: category.label,
    count: Object.keys(currentMissions).filter(([id]) => category.prefix.includes(id[0])).length,
  }));

  return (
    <Box display="flex" height="100%">
      <Box flex={1} paddingRight={2} borderRight="1px solid #ccc">
        <Box display="flex" alignItems="center">
          <Typography variant="h6">Current Missions</Typography>
          <IconButton color="primary" onClick={fetchMissions} style={{ marginLeft: 2 }} disabled={waiting}>
            <RefreshIcon />
          </IconButton>
        </Box>
        <Box display="flex" flexWrap="wrap">
          {missionCategories.map((category) => (
            <Chip
              key={category.label}
              label={`${category.label} (${missionCounts.find(count => count.label === category.label)?.count || 0})`}
              onClick={() => toggleCategory(category.prefix)}
              color={selectedCategories.includes(category.prefix) ? 'primary' : 'default'}
              style={{ margin: 4 }}
            />
          ))}
        </Box>
        <Box display="flex" alignItems="center" marginBottom={2}>
          <Typography variant="body2">
            Show unnamed missions
          </Typography>
          <Switch
            checked={showUnnamedMissions}
            onChange={(e) => setShowUnnamedMissions(e.target.checked)}
            inputProps={{ 'aria-label': 'primary checkbox' }}
          />
        </Box>
        <List dense={true}>
          {filteredMissions.map(([mainMissionId, subMissions]) => (
            <React.Fragment key={mainMissionId}>
              <ListItem secondaryAction={
                <Button
                  variant="contained"
                  color="secondary"
                  onClick={() => handleSkipMainMission(Number(mainMissionId))}
                  disabled={waiting}
                  sx={{ textTransform: 'none' }}>
                  Skip All
                </Button>
              } >
                <ListItemText
                  primary={`${GameData.get(Number(mainMissionId), language)}`}
                  secondary={`${mainMissionId} (main)`}
                  slotProps={{ primary: { variant: 'body1' } }}
                />
              </ListItem>
              {subMissions.filter(subMissionId => isNamedMission(subMissionId)).map((subMissionId) => (
                <ListItem key={subMissionId} secondaryAction={
                  <Button
                    variant="contained"
                    color="secondary"
                    onClick={() => handleSkipSubMission(subMissionId)}
                    disabled={waiting}
                    sx={{ textTransform: 'none' }}>
                    Skip
                  </Button>
                } >
                  <ListItemText
                    primary={`${GameData.get(Number(subMissionId), language)}`}
                    secondary={`${subMissionId} (sub)`}
                    slotProps={{ primary: { variant: 'body1' } }}
                    sx={{ marginLeft: '24px' }}
                  />
                </ListItem>
              ))}
            </React.Fragment>
          ))}
        </List>
      </Box>

      <Box flex={1} paddingLeft={2}>
        <Typography variant="h6">Recent Skip History</Typography>
        <List>
          {completedMainMissions.slice(-5).map((id) => (
            <ListItem key={id} secondaryAction={
              <Button
                variant="contained"
                color="secondary"
                onClick={() => handleAcceptMission(Number(id))}
                disabled={waiting}
                sx={{ textTransform: 'none' }}>
                Reaccept
              </Button>
            } >
              <ListItemText primary={`${GameData.get(Number(id), language)}`} secondary={`${id} (main)`} />
            </ListItem>
          ))}
        </List>
        <List>
          {completedSubMissions.slice(-5).map((id) => (
            <ListItem key={id}>
              <ListItemText primary={`${GameData.get(Number(id), language)}`} secondary={`${id} (sub)`} />
            </ListItem>
          ))}
        </List>
        <Divider style={{ margin: '16px 0' }} />
        <Typography variant="h6">Accept New Missions</Typography>
        <Box display="flex" alignItems="center" marginBottom={2}>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Search missions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <IconButton onClick={handleSearch}>
            <SearchIcon />
          </IconButton>
        </Box>
        <List>
          {Object.entries(searchResults).map(([id, name]) => (
            <ListItem key={id} secondaryAction={
              <Button
                variant="contained"
                color="secondary"
                onClick={() => handleAcceptMission(Number(id))}
                disabled={waiting}
                sx={{ textTransform: 'none' }}>
                Accept
              </Button>
            } >
              <ListItemText primary={name} secondary={`${id} (main)`} />
            </ListItem>
          ))}
        </List>
      </Box>
    </Box>
  );
};

export default Missions;