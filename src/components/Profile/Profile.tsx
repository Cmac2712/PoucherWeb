import { useAuth0 } from "@auth0/auth0-react";

export const Profile = () => {
  const { user, isAuthenticated, isLoading } = useAuth0();

  if (isLoading) {
    return <div>Loading ...</div>;
  }

  if (isAuthenticated) {
    return (
      <div className="profile">
        <div className="avatar">
          <div className="w-12 mask mask-squircle ring ring-primary ring-offset-base-100 ring-offset-2">
            <img src={user.picture} alt={user.name} referrerpolicy="no-referrer" />
          </div>
        </div>
        <div className="text-sm">
          <h2>{user.name}</h2>
          <p className="text-gray-100/25">{user.email}</p>
        </div>
      </div>
    )
  }

  return <></>
};