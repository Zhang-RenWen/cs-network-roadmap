import { useEffect } from 'react'
import { AppHeader } from './components/AppHeader'
import { JourneyView } from './components/journey/JourneyView'
import { RoadMapView } from './components/map/RoadMapView'
import { defaultScenario } from './data/scenarios'
import { useFitPreference } from './hooks/useFitPreference'
import { useHashRoute } from './hooks/useHashRoute'
import { useTheme } from './hooks/useTheme'

export default function App() {
  const [route, navigate] = useHashRoute()
  const theme = useTheme()
  const fit = useFitPreference()
  const fitPage = route.view === 'journey' && fit.enabled

  // 切換頁面時回到頂端
  useEffect(() => {
    window.scrollTo({ top: 0 })
  }, [route.view])

  return (
    <div className={`app${fitPage ? ' app--fit' : ''}`}>
      <AppHeader view={route.view} theme={theme} fit={fit} />
      <main className="app-main">
        {route.view === 'journey' ? (
          <JourneyView scenario={defaultScenario} stepParam={route.step} navigate={navigate} fit={fit.enabled} />
        ) : (
          <RoadMapView topicId={route.topicId} navigate={navigate} />
        )}
      </main>
      <footer className="app-footer">
        內容整理自同名的個人筆記。路徑中的設定（SSL 模式、內網明文等）為典型設定，實際依環境而定。
      </footer>
    </div>
  )
}
