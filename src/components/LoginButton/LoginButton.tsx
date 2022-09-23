import { useAuth0 } from "@auth0/auth0-react";

export const LoginButton = () => {
  const { loginWithRedirect } = useAuth0();

  return (
    <>
      <button
        className="btn btn-outline mr-2 normal-case"
        onClick={() => loginWithRedirect()}>
        Sign Up
      </button>
      <button
        className="btn btn-primary normal-case"
        onClick={() => loginWithRedirect()}>
        Log In
      </button>
    </>
  )

};
