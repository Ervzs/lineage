import { memo } from 'react'

export type TabId = 'species' | 'traits' | 'lineage' | 'mutations' | 'genome' | 'fossils'

export const Tabs = memo(function Tabs({ tabs, current, onSelect }: { tabs: TabId[]; current: TabId; onSelect: (t: TabId) => void }) {
  return (
    <nav className="tabs" role="tablist">
      {tabs.map(t => (
        <button
          key={t}
          role="tab"
          aria-selected={t === current}
          className={t === current ? 'tab tab-on' : 'tab'}
          onClick={() => onSelect(t)}
        >
          {t}
        </button>
      ))}
    </nav>
  )
})
