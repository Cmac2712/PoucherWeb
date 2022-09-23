import { Auth0User } from '../AdminScreen'

interface Props {
  user: Auth0User 
}

export const Profile = ({
  user: {
    given_name,
    email,
    picture
  }
}:Props) => {

    return (
      <div className="profile bg-base-300 p-4 flex items-center">
        <div className="avatar mr-4">
          <div className="w-12 mask mask-squircle ring ring-primary ring-offset-base-100 ring-offset-2">
            <img src={picture} alt={given_name} referrerPolicy="no-referrer" />
          </div>
        </div>
        <div className="text-sm">
          <h2>{given_name}</h2>
          <p className="opacity-40">{email}</p>
        </div>
      </div>
    )

  return <></>
};