import React, { useState, useEffect } from "react";
import CommandService from "../api/CommandService";
import {
  TextField,
  Button,
  Box,
  Paper,
  Typography,
  Divider,
  IconButton,
} from "@mui/material";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import { useTranslation } from "react-i18next";
import { useSnackbar } from "../store/SnackbarContext";

const CommandPage: React.FC = () => {
  const { t } = useTranslation();
  const [command, setCommand] = useState("");
  const [output, setOutput] = useState("");
  const [recentCommands, setRecentCommands] = useState<string[]>([]);
  const { showSnackbar } = useSnackbar();

  useEffect(() => {
    setRecentCommands(CommandService.getRecentCommands());
  }, []);

  const handleRunCommand = async () => {
    try {
      const result = await CommandService.executeCommand(command);
      setOutput(result);
      setRecentCommands(CommandService.getRecentCommands());
    } catch (error) {
      setOutput(`Error: ${error}`);
    }
  };

  const handleRecentCommandClick = (cmd: string) => {
    setCommand(cmd);
  };

  const handleCopyCommand = (cmd: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(cmd);
    showSnackbar("Copied to clipboard", "success");
  };

  return (
    <Box sx={{ padding: 2 }}>
      <Typography variant="body2" color="text.secondary">
        {t("command.tip")}
      </Typography>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          marginBottom: 2,
          maxWidth: "80%",
        }}
      >
        <TextField
          label={t("command.input")}
          variant="outlined"
          fullWidth
          sx={{ marginRight: 2 }}
          value={command}
          onChange={(e) => setCommand(e.target.value)}
          placeholder={t("command.placeholder")}
        />
        <Button
          variant="contained"
          color="primary"
          startIcon={<PlayArrowIcon />}
          sx={{ padding: "8px 16px", fontSize: "1rem", whiteSpace: "nowrap" }}
          onClick={handleRunCommand}
        >
          {t("command.run")}
        </Button>
      </Box>
      <Paper elevation={3} sx={{ padding: 2, mt: 2 }}>
        <Typography variant="h6" gutterBottom>
          {t("command.output")}
        </Typography>
        <Box sx={{ fontFamily: "monospace", whiteSpace: "pre-wrap" }}>
          {output}
        </Box>
      </Paper>

      <Divider sx={{ my: 3 }} />

      <Typography variant="h6" gutterBottom>
        {t("command.recent")}
      </Typography>
      <Box display="flex" flexDirection="column" gap={1}>
        {recentCommands.map((cmd, index) => (
          <Box
            key={index}
            sx={{
              bgcolor: "action.hover",
              borderRadius: 1,
              p: 1,
              display: "flex",
              alignItems: "center",
              maxWidth: "60%",
              justifyContent: "space-between",
            }}
            onClick={() => handleRecentCommandClick(cmd)}
          >
            <Typography
              variant="body2"
              sx={{ fontFamily: "monospace", flexGrow: 1, mr: 2 }}
            >
              {cmd}
            </Typography>
            <IconButton
              size="small"
              onClick={(e) => handleCopyCommand(cmd, e)}
              title="Copy"
            >
              <ContentCopyIcon fontSize="small" />
            </IconButton>
          </Box>
        ))}
      </Box>
    </Box>
  );
};

export default CommandPage;
