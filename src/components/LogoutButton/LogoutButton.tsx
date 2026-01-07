import { useCognitoAuth } from '../../contexts/auth-context'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faArrowRightFromBracket } from '@fortawesome/free-solid-svg-icons'

export const LogoutButton = () => {
  const { logout } = useCognitoAuth()

  return (
    <button onClick={() => logout()}>
      <span className="mr-2">Log Out</span>
      <FontAwesomeIcon icon={faArrowRightFromBracket} />
    </button>
  )
}
