import { CognitoAuthUser } from '../../contexts/auth-context'

interface Props {
  user: CognitoAuthUser
}

export const Profile = ({ user: { name, email, picture } }: Props) => {
  return (
    <div className="profile bg-base-300 p-4 flex items-center">
      <div className="avatar mr-4">
        <div className="w-12 mask mask-squircle ring ring-primary ring-offset-base-100 ring-offset-2">
          {picture ? (
            <img
              src={picture}
              alt={name}
              referrerPolicy="no-referrer"
              data-testid="profile-picture"
            />
          ) : (
            <div
              className="w-12 h-12 bg-primary flex items-center justify-center text-primary-content text-xl font-bold"
              data-testid="profile-picture"
            >
              {name?.charAt(0).toUpperCase() || 'U'}
            </div>
          )}
        </div>
      </div>
      <div className="text-sm">
        <h2 data-testid="given_name">{name}</h2>
        <p data-testid="email" className="opacity-40">
          {email}
        </p>
      </div>
    </div>
  )
}
