import { useAuth0 } from "@auth0/auth0-react";
import { useState, useEffect } from "react";

export const Profile = () => {
  const { user, isAuthenticated, isLoading, getAccessTokenSilently } = useAuth0()
  const [userMetadata, setUserMetadata] = useState(null)

  useEffect(() => {
    const getUserMetadata = async () => {
      const domain = import.meta.env.VITE_AUTH0_DOMAIN;

      try {
        const accessToken = await getAccessTokenSilently({
          audience: `https://${domain}/api/v2/`,
          scope: "read:current_user",
        });

        const userDetailsByIdUrl = `https://${domain}/api/v2/users/${user.sub}`;

        const metadataResponse = await fetch(userDetailsByIdUrl, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });

        const { user_metadata } = await metadataResponse.json();

        setUserMetadata(user_metadata);
      } catch (e) {
        console.log(e.message);
      }
    };

    getUserMetadata();
  }, [getAccessTokenSilently, user?.sub]);

  if (isLoading) {
    return <div>Loading ...</div>;
  }

  if (isAuthenticated) {
    return (
      <div className="profile">
        <div className="avatar">
          <div className="w-12 mask mask-squircle ring ring-primary ring-offset-base-100 ring-offset-2">
            <img src={user.picture} alt={user.name} referrerPolicy="no-referrer" />
          </div>
        </div>
        <div className="text-sm">
          <h2>{user.name}</h2>
          <p className="text-gray-100/25">{user.email}</p>
          <p></p>
          {userMetadata ? (
            <pre>{JSON.stringify(userMetadata, null, 2)}</pre>
          ) : (
            "No user metadata defined"
          )}
        </div>
      </div>
    )
  }

  return <></>
};