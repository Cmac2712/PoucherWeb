import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faBookmark, faTags, faSearch, faLaptop } from '@fortawesome/free-solid-svg-icons'
import type { IconDefinition } from '@fortawesome/fontawesome-svg-core'

interface Feature {
  icon: IconDefinition
  title: string
  description: string
}

const features: Feature[] = [
  {
    icon: faBookmark,
    title: 'Save Bookmarks',
    description: 'Save links with titles, descriptions, and screenshots'
  },
  {
    icon: faTags,
    title: 'Organize with Tags',
    description: 'Create custom tags to categorize your bookmarks'
  },
  {
    icon: faSearch,
    title: 'Fast Search',
    description: 'Instantly find what you\'re looking for'
  },
  {
    icon: faLaptop,
    title: 'Works Everywhere',
    description: 'Responsive design for desktop and mobile'
  }
]

export const FeatureCards = () => (
  <div className="grid grid-cols-2 gap-4 mt-8">
    {features.map((feature) => (
      <div
        key={feature.title}
        className="p-4 rounded-lg bg-background-dark border border-forest-800 hover:border-forest-600 transition-colors"
      >
        <FontAwesomeIcon
          icon={feature.icon}
          className="text-forest-400 text-2xl mb-3"
        />
        <h3 className="text-foreground font-semibold mb-1">{feature.title}</h3>
        <p className="text-foreground-muted text-sm">{feature.description}</p>
      </div>
    ))}
  </div>
)
