'use client'

interface CategoryTabsProps {
  activeCategory: string
  onCategoryChange: (category: string) => void
}

export default function CategoryTabs({ activeCategory, onCategoryChange }: CategoryTabsProps) {
  const categories = [
    { id: 'djs', name: 'DJs', count: 10 },
    { id: 'photographers', name: 'Photographers', count: 10 },
    { id: 'videographers', name: 'Videographers', count: 10 }
  ]

  return (
    <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
      {categories.map((category) => (
        <button
          key={category.id}
          onClick={() => onCategoryChange(category.id)}
          className={`flex-1 py-3 px-4 rounded-md font-semibold transition-all duration-200 ${
            activeCategory === category.id
              ? 'bg-yellow-400 text-black shadow-md'
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200'
          }`}
        >
          {category.name}
          <span className="ml-2 text-sm opacity-75">
            ({category.count})
          </span>
        </button>
      ))}
    </div>
  )
}
