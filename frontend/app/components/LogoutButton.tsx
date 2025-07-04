import { useMutation } from '@apollo/client';
import { LOGOUT } from '../../graphql/mutations';

export default function LogoutButton() {
  const [logout] = useMutation(LOGOUT);

  const handleLogout = async () => {
    await logout();
    window.location.href = '/login';
  };

  return (
    <button onClick={handleLogout}>
      Logout
    </button>
  );
} 