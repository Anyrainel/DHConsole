import PeopleIcon from '@mui/icons-material/People';
import AssignmentIcon from '@mui/icons-material/Assignment';
import InventoryIcon from '@mui/icons-material/Inventory';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import TerminalIcon from '@mui/icons-material/Terminal';
import MapIcon from '@mui/icons-material/Map';
import SportsEsportsIcon from "@mui/icons-material/SportsEsports";
import { ReactRouterAppProvider } from "@toolpad/core/react-router";
import { Outlet } from "react-router";
import type { Navigation } from "@toolpad/core";
import { lightTheme, darkTheme } from "./theme";
import { useTranslation } from "react-i18next";

function App() {
  const { t } = useTranslation();

  const NAVIGATION: Navigation = [
    {
      kind: "header",
      title: t("navigation.header"),
    },
    {
      segment: "characters",
      title: t("navigation.segments.characters"),
      icon: <PeopleIcon />,
    },
    {
      segment: "missions",
      title: t("navigation.segments.missions"),
      icon: <AssignmentIcon />,
    },
    {
      segment: "scene",
      title: t("navigation.segments.scene"),
      icon: <MapIcon />,
    },
    {
      segment: "inventory",
      title: t("navigation.segments.inventory"),
      icon: <InventoryIcon />,
    },
    {
      segment: "gamemodes",
      title: t("navigation.segments.gamemodes"),
      icon: <SportsEsportsIcon />,
    },
    {
      segment: "account",
      title: t("navigation.segments.account"),
      icon: <AccountCircleIcon />,
    },
    {
      segment: "command",
      title: t("navigation.segments.command"),
      icon: <TerminalIcon />,
    },
  ];

  const BRANDING = {
    logo: (
      <img src="/DHConsole/logo.svg" alt="DHConsole" width="48" height="48" />
    ),
    title: t("navigation.title"),
  };

  return (
    <ReactRouterAppProvider
      navigation={NAVIGATION}
      branding={BRANDING}
      theme={{ light: lightTheme, dark: darkTheme }}
    >
      <Outlet />
    </ReactRouterAppProvider>
  );
}

export default App;
