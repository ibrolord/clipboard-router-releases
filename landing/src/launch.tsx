import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { LaunchScene, type LaunchLayout } from './LaunchScene'
import './launch.css'

const params = new URLSearchParams(window.location.search)
const requestedLayout = params.get('layout') ?? params.get('scene') ?? 'wide'
const layouts = new Set<LaunchLayout>(['compact', 'social', 'wide'])
if (!layouts.has(requestedLayout as LaunchLayout)) {
  throw new Error(`Unknown launch layout: ${requestedLayout}`)
}
const layout = requestedLayout as LaunchLayout
const still = params.has('still')

document.documentElement.dataset.launchScene = layout
document.documentElement.dataset.launchStill = String(still)

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <LaunchScene layout={layout} />
  </StrictMode>,
)
