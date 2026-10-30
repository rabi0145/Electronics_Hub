import NotFoundMessage from '../components/common/NotFoundMessage'
import { useDocumentTitle } from '../hooks/useDocumentTitle'

function NotFound() {
  useDocumentTitle('Page not found')
  return <NotFoundMessage />
}

export default NotFound