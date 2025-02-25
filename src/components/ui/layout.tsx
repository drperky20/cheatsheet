import { themeConfig } from "@/app/theme-config"

export function PageLayout({ children }) {
  return (
    <div className={themeConfig.spacing.page}>
      <div className={themeConfig.spacing.section}>
        {children}
      </div>
    </div>
  )
}

export function SectionHeader({ title, description, action }) {
  return (
    <div className="flex items-center justify-between gap-4 mb-6">
      <div className="space-y-1">
        <h2 className="text-2xl font-semibold tracking-tight">{title}</h2>
        {description && (
          <p className="text-muted-foreground">{description}</p>
        )}
      </div>
      {action}
    </div>
  )
}

export function ContentGrid({ children, columns = 1 }) {
  return (
    <div className={`grid gap-6 ${
      columns === 2 ? 'md:grid-cols-2' : 
      columns === 3 ? 'md:grid-cols-2 lg:grid-cols-3' :
      columns === 4 ? 'md:grid-cols-2 lg:grid-cols-4' : ''
    }`}>
      {children}
    </div>
  )
}
