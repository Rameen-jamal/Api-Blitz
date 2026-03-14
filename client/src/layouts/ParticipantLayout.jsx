import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar';

const ParticipantLayout = () => {
  return (
    <div className="min-h-screen animated-bg flex flex-col">
      <Navbar />
      <main className="flex-1 flex flex-col">
        <Outlet />
      </main>
    </div>
  );
};

export default ParticipantLayout;
