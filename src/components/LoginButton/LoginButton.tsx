import { useAuth0 } from "@auth0/auth0-react";
import { Button } from '../ui/button'

export const LoginButton = () => {
  const { loginWithRedirect } = useAuth0();

  return (
    <>
      <Button
        variant="outline"
        className="mr-2 normal-case"
        onClick={() => loginWithRedirect()}>
        Sign Up
      </Button>
      <Button
        variant="default"
        className="normal-case"
        onClick={() => loginWithRedirect()}>
        Log In
      </Button>
    </>
  )

};
