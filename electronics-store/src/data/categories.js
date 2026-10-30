import {
  Smartphone,
  Laptop,
  Headphones,
  Watch,
  Keyboard,
  Monitor,
  Speaker,
  Camera,
  Cpu,
  Plug,
} from 'lucide-react'

// Each product stores the category `id` (e.g. "smartphones").
// `name` is the label shown to customers. `icon` is used in menus and
// on the homepage category cards.
export const CATEGORIES = [
  { id: 'smartphones', name: 'Smartphones', icon: Smartphone },
  { id: 'laptops', name: 'Laptops', icon: Laptop },
  { id: 'audio', name: 'Headphones & Earphones', icon: Headphones },
  { id: 'smartwatches', name: 'Smartwatches', icon: Watch },
  { id: 'keyboards-mice', name: 'Keyboards & Mice', icon: Keyboard },
  { id: 'monitors', name: 'Monitors', icon: Monitor },
  { id: 'speakers', name: 'Speakers', icon: Speaker },
  { id: 'cameras', name: 'Cameras', icon: Camera },
  { id: 'components', name: 'Computer Components', icon: Cpu },
  { id: 'accessories', name: 'Accessories & Others', icon: Plug },
]

// Turn a category id into its display name, e.g. "audio" -> "Headphones & Earphones".
// Falls back to the raw id if the category is unknown, so the UI never breaks.
export function getCategoryName(categoryId) {
  const category = CATEGORIES.find((item) => item.id === categoryId)
  return category ? category.name : categoryId
}