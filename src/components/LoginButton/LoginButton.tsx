import { useAuth0 } from "@auth0/auth0-react";

export const LoginButton = () => {
  const { loginWithRedirect } = useAuth0();

  return (
    <>
      <button
        className="btn btn-accent mr-2"
        onClick={() => loginWithRedirect()}>
        Log In
      </button>
      <button
        className="btn btn-primary"
        onClick={() => loginWithRedirect()}>
        Sign Up
      </button>
    </>
  )

};
