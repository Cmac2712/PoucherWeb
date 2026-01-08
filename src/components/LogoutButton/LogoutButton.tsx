import { useAuth0 } from "@auth0/auth0-react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faArrowRightFromBracket } from '@fortawesome/free-solid-svg-icons'
import { Button } from '../ui/button'

export const LogoutButton = () => {
  const { logout } = useAuth0();

  return (
    <Button
      variant="outline"
      className="w-full"
      onClick={() => logout({ returnTo: window.location.origin })}
    >
      <span className="mr-2">Log Out</span>
      <FontAwesomeIcon icon={faArrowRightFromBracket} />
    </Button>
  );
};