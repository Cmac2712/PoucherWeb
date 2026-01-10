import { CognitoAuthUser } from '../../contexts/auth-context'

interface Props {
  user: CognitoAuthUser
}

export const Profile = ({ user: { name, email, picture } }: Props) => {
  return (
    <div className="p-6 border-b border-gray-200">
      <div className="flex items-center gap-4">
        {/* Avatar */}
        <div className="shrink-0">
          {picture ? (
            <img
              src={picture}
              alt={name}
              referrerPolicy="no-referrer"
              className="w-12 h-12 rounded-full object-cover ring-2 ring-forest-500"
              data-testid="profile-picture"
            />
          ) : (
            <div
              className="w-12 h-12 rounded-full bg-forest-100 flex items-center justify-center text-forest-700 text-lg font-bold"
              data-testid="profile-picture"
            >
              {name?.charAt(0).toUpperCase() || 'U'}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="min-w-0">
          <h2 data-testid="given_name" className="font-semibold text-foreground truncate">
            {name}
          </h2>
          <p data-testid="email" className="text-sm text-foreground-muted truncate">
            {email}
          </p>
        </div>
      </div>
    </div>
  )
}
