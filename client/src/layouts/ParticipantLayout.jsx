import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar';

const ParticipantLayout = () => {
  return (
    <div className="min-h-screen bg-gray-950 flex flex-col">
      <Navbar />
      <main className="flex-1 flex flex-col">
        <Outlet />
      </main>
    </div>
  );
};

export default ParticipantLayout;
