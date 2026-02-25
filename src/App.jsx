import { useSelector } from 'react-redux';
import LandingPage from './pages/LandingPage';
import LobbyPage from './pages/LobbyPage';
import GameBoard from './pages/GameBoard';
import LeaderboardPage from './pages/LeaderboardPage';
import PlayerHistoryPage from './pages/PlayerHistoryPage';
import Toast from './components/Toast';

const SCREENS = {
  landing: LandingPage,
  lobby: LobbyPage,
  game: GameBoard,
  leaderboard: LeaderboardPage,
  history: PlayerHistoryPage,
};

function App() {
  const currentScreen = useSelector((state) => state.game.currentScreen);
  const ScreenComponent = SCREENS[currentScreen] || LandingPage;

  return (
    <>
      <ScreenComponent />
      <Toast />
    </>
  );
}

export default App;
