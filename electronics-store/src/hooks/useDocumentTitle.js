import { useEffect } from 'react'
import { STORE_CONFIG } from '../config/store'

// Sets the browser tab title: "Page name | Store name".
// With no title (or an empty one) the tab just shows the store name.
export function useDocumentTitle(title) {
  useEffect(() => {
    document.title = title ? `${title} | ${STORE_CONFIG.name}` : STORE_CONFIG.name
  }, [title])
}