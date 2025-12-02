import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Chip,
  List,
  ListItem,
  ListItemText,
  IconButton,
  MenuItem,
  TextField,
  Switch,
  Button,
  Divider,
  FormControlLabel,
} from "@mui/material";
import {
  Refresh as RefreshIcon,
  Edit as EditIcon,
  Save as SaveIcon,
  Undo as UndoIcon,
} from "@mui/icons-material";
import CommandService from "../api/CommandService";
import { Prop } from "../api/PropInfo";
import { useTranslation } from "react-i18next";
import { usePlayerContext } from "../store/playerContext";
import { useSnackbar } from "../store/SnackbarContext";

interface PropStateChange {
  prop: Prop;
  originalState: string;
  originalStateId: number;
  newState: string;
  timestamp: number;
}

const Scene = () => {
  const { t } = useTranslation();
  const { isConnected } = usePlayerContext();
  const { showSnackbar } = useSnackbar();
  const [props, setProps] = useState<Prop[]>([]);
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [editingPropId, setEditingPropId] = useState<[number, number] | null>(
    null
  );
  const [selectedState, setSelectedState] = useState<number | null>(null);
  const [recentChanges, setRecentChanges] = useState<PropStateChange[]>([]);
  const [waiting, setWaiting] = useState(false);
  const [showUnlockedProps, setShowUnlockedProps] = useState(false);
  const [distance, setDistance] = useState(5);
  const [mpCount, setMpCount] = useState(5);
  const [autoRefresh, setAutoRefresh] = useState(false);

  const fetchProps = async () => {
    if (!isConnected) return;
    const nearbyProps = await CommandService.getPropsNearMe();
    setProps(nearbyProps.sort((a, b) => a.distance - b.distance));
    setSelectedState(null);
    setEditingPropId(null);
  };

  const handleForward = async () => {
    setWaiting(true);
    try {
      await CommandService.sceneForward(distance);
      showSnackbar(t("scene.messages.forwardSuccess"), "success");
    } catch (error) {
      showSnackbar(t("scene.messages.forwardError"), "error");
    } finally {
      setWaiting(false);
    }
  };

  const handleUnstuck = async () => {
    setWaiting(true);
    try {
      await CommandService.sceneUnstuck();
      showSnackbar(t("scene.messages.unstuckSuccess"), "success");
    } catch (error) {
      showSnackbar(t("scene.messages.unstuckError"), "error");
    } finally {
      setWaiting(false);
    }
  };

  const handleSetMp = async () => {
    setWaiting(true);
    try {
      await CommandService.setLineupMp(mpCount);
      showSnackbar(t("scene.messages.setMpSuccess"), "success");
    } catch (error) {
      showSnackbar(t("scene.messages.setMpError"), "error");
    } finally {
      setWaiting(false);
    }
  };

  const handleHeal = async () => {
    setWaiting(true);
    try {
      await CommandService.healLineup();
      showSnackbar(t("scene.messages.healSuccess"), "success");
    } catch (error) {
      showSnackbar(t("scene.messages.healError"), "error");
    } finally {
      setWaiting(false);
    }
  };

  useEffect(() => {
    fetchProps();
  }, [isConnected]);

  useEffect(() => {
    let intervalId: number | null = null;
    if (autoRefresh && isConnected) {
      intervalId = setInterval(() => {
        fetchProps();
      }, 5000); // Refresh every 5 seconds for scene props as they change more often
    }
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [autoRefresh, isConnected]);

  const propTypes = [...new Set(props.map((prop) => prop.type))];

  const handleTypeToggle = (type: string) => {
    setSelectedTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
  };

  const handleEditClick = (prop: Prop) => {
    setEditingPropId([prop.groupId, prop.entityId]);
    setSelectedState(prop.stateId);
  };

  const handleSaveClick = async (prop: Prop) => {
    setWaiting(true);
    try {
      if (selectedState === null) {
        showSnackbar(t("scene.messages.noStateSelected"), "error");
        return;
      }
      if (selectedState === prop.stateId) {
        return;
      }
      const propChange: PropStateChange = {
        prop,
        originalState: prop.state,
        originalStateId: prop.stateId,
        newState:
          Object.entries(prop.validStates).find(
            ([_, id]) => id === selectedState
          )?.[0] || "",
        timestamp: Date.now(),
      };
      await CommandService.changePropState(prop, selectedState);
      setRecentChanges((prev) => [propChange, ...prev]);
      await fetchProps();
      showSnackbar(t("scene.messages.saveSuccess"), "success");
    } catch (error) {
      showSnackbar(t("scene.messages.saveError"), "error");
    } finally {
      setWaiting(false);
      setEditingPropId(null);
    }
  };

  const handleUndoClick = async (change: PropStateChange) => {
    setWaiting(true);
    try {
      await CommandService.changePropState(change.prop, change.originalStateId);
      setRecentChanges((prev) => prev.filter((c) => c !== change));
      await fetchProps();
      showSnackbar(t("scene.messages.undoSuccess"), "success");
    } catch (error) {
      showSnackbar(t("scene.messages.undoError"), "error");
    } finally {
      setWaiting(false);
    }
  };

  const filteredProps = props.filter((prop) => {
    const shouldShowPerLockState =
      showUnlockedProps ||
      [
        "Locked",
        "CheckPointDisable",
        "TriggerDisable",
        "ChestLocked",
        "Hidden",
      ].includes(prop.state) ||
      (prop.type === "door" && prop.state === "Closed");
    return (
      shouldShowPerLockState &&
      (selectedTypes.length === 0 || selectedTypes.includes(prop.type))
    );
  });

  return (
    <Box display="flex" height="100%">
      {/* Left side - Props near me */}
      <Box flex={1} paddingRight={2} borderRight="1px solid #ccc">
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={1}>
          <Box display="flex" alignItems="center">
            <Typography variant="h6">
              {t("scene.sections.propsNearMe")}
            </Typography>
            <IconButton
              color="primary"
              onClick={fetchProps}
              style={{ marginLeft: 2 }}
              disabled={waiting}
            >
              <RefreshIcon />
            </IconButton>
          </Box>
          <FormControlLabel
            control={<Switch checked={autoRefresh} onChange={(e) => setAutoRefresh(e.target.checked)} size="small" />}
            label={t('scene.labels.autoRefresh')}
          />
        </Box>

        <Box display="flex" flexWrap="wrap" marginBottom={2}>
          {propTypes.map((type) => (
            <Chip
              key={type}
              label={`${type} (${props.filter((p) => p.type === type).length})`}
              onClick={() => handleTypeToggle(type)}
              color={selectedTypes.includes(type) ? "primary" : "default"}
              style={{ margin: 4 }}
            />
          ))}
        </Box>

        <Box display="flex" alignItems="center" marginBottom={2}>
          <Typography variant="body2">
            {t("scene.labels.showUnlockedProps")}
          </Typography>
          <Switch
            checked={showUnlockedProps}
            onChange={(e) => setShowUnlockedProps(e.target.checked)}
            inputProps={{ "aria-label": "show unlocked props" }}
          />
        </Box>

        <List>
          {filteredProps.map((prop) => {
            const isEditing =
              editingPropId?.[0] === prop.groupId &&
              editingPropId?.[1] === prop.entityId;

            return (
              <ListItem
                key={`${prop.groupId}-${prop.entityId}`}
                secondaryAction={
                  isEditing ? (
                    <Box
                      display="flex"
                      alignItems="center"
                      justifyContent="end"
                    >
                      <TextField
                        select
                        size="small"
                        value={selectedState ?? ""}
                        onChange={(e) =>
                          setSelectedState(Number(e.target.value))
                        }
                        sx={{ minWidth: 120 }}
                      >
                        {Object.entries(prop.validStates).map(([desc, id]) => (
                          <MenuItem key={id} value={id}>
                            {desc}
                          </MenuItem>
                        ))}
                      </TextField>

                      <IconButton
                        edge="end"
                        onClick={() => handleSaveClick(prop)}
                        disabled={waiting || selectedState === null}
                        sx={{ marginLeft: 2 }}
                      >
                        <SaveIcon />
                      </IconButton>
                    </Box>
                  ) : (
                    <Box
                      display="flex"
                      alignItems="center"
                      justifyContent="end"
                    >
                      <Typography variant="body2" color="textSecondary">
                        {`${t("scene.labels.state")}: ${prop.state}`}
                      </Typography>
                      <IconButton
                        edge="end"
                        onClick={() => handleEditClick(prop)}
                        disabled={waiting}
                        sx={{ marginLeft: 2 }}
                      >
                        <EditIcon />
                      </IconButton>
                    </Box>
                  )
                }
              >
                <ListItemText
                  primary={`${prop.type} (${prop.distance / 1000}m)`}
                  secondary={`[${prop.groupId}] ID:${prop.entityId}`}
                  slotProps={{ primary: { variant: "body1" } }}
                />
              </ListItem>
            );
          })}
        </List>
      </Box>

      {/* Right side - Recent changes */}
      <Box flex={1} paddingLeft={2}>
        <Typography variant="h6">{t("scene.sections.navigation")}</Typography>
        <Box display="flex" alignItems="center" gap={2} my={2}>
          <Button
            variant="contained"
            color="secondary"
            onClick={handleUnstuck}
            disabled={waiting}
            sx={{ mr: 3 }}
          >
            {t("scene.actions.unstuck")}
          </Button>
          <TextField
            label={t("scene.labels.distance")}
            type="number"
            size="small"
            value={distance}
            onChange={(e) => setDistance(Number(e.target.value))}
            sx={{ width: 70 }}
          />
          <Button
            variant="contained"
            color="secondary"
            onClick={handleForward}
            disabled={waiting}
          >
            {t("scene.actions.forward")}
          </Button>
        </Box>

        <Divider sx={{ my: 2 }} />

        <Typography variant="h6">{t("scene.sections.lineup")}</Typography>
        <Box display="flex" alignItems="center" gap={2} my={2}>
          <Button
            variant="contained"
            color="secondary"
            onClick={handleHeal}
            sx={{ mr: 3 }}
          >
            {t("scene.actions.heal")}
          </Button>
          <TextField
            label={t("scene.labels.mp")}
            type="number"
            size="small"
            value={mpCount}
            onChange={(e) => setMpCount(Number(e.target.value))}
            sx={{ width: 70 }}
          />
          <Button
            variant="contained"
            color="secondary"
            onClick={handleSetMp}
            disabled={waiting}
          >
            {t("scene.actions.setMp")}
          </Button>
        </Box>

        <Divider sx={{ my: 2 }} />

        <Typography variant="h6">
          {t("scene.sections.recentChanges")}
        </Typography>
        <List>
          {recentChanges.slice(0, 10).map((change, index) => (
            <ListItem
              key={index}
              secondaryAction={
                <Box display="flex" alignItems="center" justifyContent="end">
                  <Typography variant="body2">
                    {`${t("scene.labels.state")}: ${change.originalState} -> ${change.newState}`}
                  </Typography>
                  <IconButton
                    edge="end"
                    onClick={() => handleUndoClick(change)}
                    disabled={waiting}
                  >
                    <UndoIcon />
                  </IconButton>
                </Box>
              }
            >
              <ListItemText
                primary={`${change.prop.type} (${change.prop.distance / 1000}m)`}
                secondary={`[${change.prop.groupId}] ID:${change.prop.entityId}`}
              />
            </ListItem>
          ))}
        </List>
      </Box>
    </Box>
  );
};

export default Scene;