import { useUser } from '@clerk/clerk-react'
import { useNavigate } from 'react-router-dom'
import { useEffect } from 'react'
import LoadingSpinner from './common/LoadingSpinner'

export function ProtectedRoute({ children }) {
  const { isSignedIn, isLoaded } = useUser()
  const navigate = useNavigate()

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      navigate('/')
    }
  }, [isSignedIn, isLoaded, navigate])

  if (!isLoaded) {
    return <LoadingSpinner text="Loading..." />
  }

  return isSignedIn ? children : null
}
