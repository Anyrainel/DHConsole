import * as React from 'react';
import { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Button,
  Stack,
  Divider,
  MenuItem,
  Select,
  FormControl,
  SelectChangeEvent,
} from "@mui/material";
import Grid from "@mui/material/Grid2";
import { Male, Female } from "@mui/icons-material";
import CommandService from "../api/CommandService";
import { usePlayerContext } from "../store/playerContext";
import { useTranslation } from "react-i18next";
import { useSnackbar } from "../store/SnackbarContext";

export default function Account() {
  const { t } = useTranslation();
  const [playerInfo, setPlayerInfo] = useState<{
    level: number;
    gender: number;
    path: number;
  }>({ level: 1, gender: 1, path: 8001 });
  const [editLevel, setEditLevel] = useState<string>("");
  const [selectedPath, setSelectedPath] = useState<number>(8001);
  const { playerUid, isConnected } = usePlayerContext();
  const { showSnackbar } = useSnackbar();

  const pathOptions = [
    { id: 8001, labelKey: "account.paths.8001" },
    { id: 8002, labelKey: "account.paths.8002" },
    { id: 8003, labelKey: "account.paths.8003" },
    { id: 8004, labelKey: "account.paths.8004" },
    { id: 8005, labelKey: "account.paths.8005" },
    { id: 8006, labelKey: "account.paths.8006" },
    { id: 8007, labelKey: "account.paths.8007" },
    { id: 8008, labelKey: "account.paths.8008" },
  ];

  useEffect(() => {
    if (!isConnected) {
      return;
    }
    loadPlayerInfo();
  }, [playerUid, isConnected]);

  const loadPlayerInfo = async () => {
    try {
      const info = await CommandService.getPlayerInfo();
      setPlayerInfo(info);
      setEditLevel(info.level.toString());
      setSelectedPath(info.path);
    } catch (error) {
      showSnackbar(t("account.messages.loadError"), "error");
    }
  };

  const handleLevelChange = async () => {
    try {
      const newLevel = parseInt(editLevel, 10);
      if (newLevel < 1 || newLevel > 80) {
        throw new Error(t("account.messages.levelRangeError"));
      }
      await CommandService.setPlayerLevel(newLevel);
      setPlayerInfo((prev) => ({ ...prev, level: newLevel }));
      showSnackbar(t("account.messages.levelSuccess"), "success");
    } catch (error) {
      showSnackbar(t("account.messages.levelError"), "error");
    }
  };

  const handleGenderChange = async (
    _: React.MouseEvent<HTMLElement>,
    newGender: number
  ) => {
    if (newGender === null) return;
    try {
      await CommandService.setPlayerGender(newGender);
      setPlayerInfo((prev) => ({ ...prev, gender: newGender }));
      showSnackbar(t("account.messages.genderSuccess"), "success");
    } catch (error) {
      showSnackbar(t("account.messages.genderError"), "error");
    }
  };

  const handlePathChange = async () => {
    try {
      await CommandService.setPlayerPath(selectedPath);
      setPlayerInfo((prev) => ({ ...prev, path: selectedPath }));
      showSnackbar(t("account.messages.pathSuccess"), "success");
    } catch (error) {
      showSnackbar(t("account.messages.pathError"), "error");
    }
  };

  const handleUnlockAction = async (
    action: () => Promise<void>,
    successKey: string
  ) => {
    try {
      await action();
      showSnackbar(
        t(`account.messages.unlockSuccess.${successKey}`),
        "success"
      );
    } catch (error) {
      showSnackbar(t("account.messages.actionError"), "error");
    }
  };

  return (
    <Box sx={{ width: "100%", maxWidth: 800, margin: "0 auto", p: 3 }}>
      {/* Player Info Section */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h5" gutterBottom>
            {t("account.playerInfo.title")}
          </Typography>
          <Divider sx={{ mb: 3 }} />

          <Box display="flex" flexWrap="wrap" gap={3}>
            <Box>
              <Stack spacing={1}>
                <Typography variant="subtitle2" color="text.secondary">{t('account.playerInfo.level')}</Typography>
                <Stack direction="row" spacing={1}>
                  <TextField
                    size="small"
                    sx={{ width: 80 }}
                    value={editLevel}
                    onChange={(e) => setEditLevel(e.target.value)}
                    type="number"
                    inputProps={{ min: 1, max: 80 }}
                  />
                  <Button variant="contained" size="small" onClick={handleLevelChange}>
                    {t('account.playerInfo.update')}
                  </Button>
                </Stack>
              </Stack>
            </Box>

            <Box>
              <Stack spacing={1}>
                <Typography variant="subtitle2" color="text.secondary">{t('account.playerInfo.gender')}</Typography>
                <ToggleButtonGroup
                  size="small"
                  value={playerInfo.gender}
                  exclusive
                  onChange={handleGenderChange}
                  aria-label="gender"
                >
                  <ToggleButton value={1} aria-label="male">
                    <Male sx={{ mr: 1, fontSize: 20 }} /> {t('account.playerInfo.male')}
                  </ToggleButton>
                  <ToggleButton value={2} aria-label="female">
                    <Female sx={{ mr: 1, fontSize: 20 }} /> {t('account.playerInfo.female')}
                  </ToggleButton>
                </ToggleButtonGroup>
              </Stack>
            </Box>

            <Box>
              <Stack spacing={1}>
                <Typography variant="subtitle2" color="text.secondary">{t('account.playerInfo.path')}</Typography>
                <Stack direction="row" spacing={1}>
                  <FormControl size="small" sx={{ minWidth: 150 }}>
                    <Select
                      value={selectedPath}
                      onChange={(e: SelectChangeEvent<number>) => setSelectedPath(Number(e.target.value))}
                    >
                      {pathOptions.map((option) => (
                        <MenuItem key={option.id} value={option.id}>
                          {t(option.labelKey)}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  <Button variant="contained" size="small" onClick={handlePathChange}>
                    {t('account.playerInfo.update')}
                  </Button>
                </Stack>
              </Stack>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Account Controls Section */}
      <Card>
        <CardContent>
          <Typography variant="h5" gutterBottom>
            {t("account.controls.title")}
          </Typography>
          <Divider sx={{ mb: 3 }} />

          <Stack spacing={3}>
            <Box>
              <Typography
                variant="subtitle1"
                sx={{ mb: 2, fontWeight: "medium" }}
              >
                {t("account.controls.unlockAll")}
              </Typography>
              <Box display="flex" flexWrap="wrap" gap={2}>
                {["characters", "collectibles", "furniture", "pets"].map(
                  (item) => (
                    <Button
                      key={item}
                      variant="contained"
                      color="secondary"
                      onClick={() =>
                        handleUnlockAction(
                          () => CommandService.giveAll(item),
                          item
                        )
                      }
                      sx={{ textTransform: "none", px: 3 }}
                    >
                      {t(`account.controls.buttons.${item}`)}
                    </Button>
                  )
                )}
              </Box>
            </Box>

            <Box>
              <Typography
                variant="subtitle1"
                sx={{ mb: 2, fontWeight: "medium" }}
              >
                {t("account.controls.maxAll")}
              </Typography>
              <Box display="flex" flexWrap="wrap" gap={2}>
                {["characterLevel", "characterRank", "characterTalent"].map(
                  (item) => (
                    <Button
                      key={item}
                      variant="contained"
                      color="secondary"
                      onClick={() =>
                        handleUnlockAction(
                          () => CommandService.maxAll(item),
                          item
                        )
                      }
                      sx={{ textTransform: "none", px: 3 }}
                    >
                      {t(`account.controls.buttons.${item}`)}
                    </Button>
                  )
                )}
              </Box>
            </Box>

            <Box>
              <Typography
                variant="subtitle1"
                sx={{ mb: 2, fontWeight: "medium" }}
              >
                {t("account.controls.getAll")}
              </Typography>
              <Box display="flex" flexWrap="wrap" gap={2}>
                {["mission", "tutorial", "rogue", "promotionRewards"].map(
                  (item) => (
                    <Button
                      key={item}
                      variant="contained"
                      color="secondary"
                      onClick={() =>
                        handleUnlockAction(
                          () =>
                            item === "promotionRewards"
                              ? CommandService.claimPromotionRewards()
                              : CommandService.unlockAll(item),
                          item
                        )
                      }
                      sx={{ textTransform: "none", px: 3 }}
                    >
                      {t(`account.controls.buttons.${item}`)}
                    </Button>
                  )
                )}
              </Box>
            </Box>
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
}