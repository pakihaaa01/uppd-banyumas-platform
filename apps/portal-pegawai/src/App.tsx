
import { SamsatProvider } from './context/SamsatContext';
import { AdminGate } from './components/admin/AdminGate';

export default function App() {
  return (
    <SamsatProvider>
      <AdminGate />
    </SamsatProvider>
  );
}