// ─── START: Dashboard ─────────────────────────────────────────────────────────
// File   : components/Dashboard.jsx
// Role   : Orchestrator — assembles Header, FileTabs, UploadZone, FileView, CompareView
// Props  : files[], active, onSetActive, onAddFiles, onRemoveFile
// Logic  : active === -1 → CompareView | active >= 0 → FileView | no files → UploadZone
// ─────────────────────────────────────────────────────────────────────────────

import Header      from './Header'
import FileTabs    from './FileTabs'
import UploadZone  from './UploadZone'
import FileView    from './FileView'
import CompareView from './CompareView'

// ── Dashboard ─────────────────────────────────────────────────────────────
// fn    : Dashboard({ files, active, onSetActive, onAddFiles, onRemoveFile })
// does  : conditional rendering based on files.length and active index
//         all state lives in App.jsx — Dashboard is purely presentational
export default function Dashboard({
  files,
  active,
  onSetActive,
  onAddFiles,
  onRemoveFile,
}) {

  // currently selected file object (undefined when compare view or no files)
  const currentFile = files[active]

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <>
      {/* ── Sticky top nav bar ── */}
      <Header onAddFiles={onAddFiles} />

      {/* ── Empty state: no files loaded yet ── */}
      {files.length === 0 && (
        <div className="flex-1 flex items-center justify-center p-10">
          <UploadZone onFiles={onAddFiles} />
        </div>
      )}

      {/* ── Content area: shown once at least one file is loaded ── */}
      {files.length > 0 && (
        <div className="flex-1 flex flex-col min-h-0">

          {/* File tab bar — scrollable, includes Compare All when 2+ files */}
          <FileTabs
            files={files}
            active={active}
            onSetActive={onSetActive}
            onRemoveFile={onRemoveFile}
          />

          {/* Scrollable main content panel */}
          <div className="flex-1 overflow-y-auto scrollbar-visible">

            {/* Compare view — rendered when active === -1 */}
            {active === -1 && (
              <CompareView files={files} onSetActive={onSetActive} />
            )}

            {/* Single file view — rendered when a valid tab is selected */}
            {active >= 0 && currentFile && (
              <FileView file={currentFile} />
            )}

          </div>
        </div>
      )}
    </>
  )
}

// ─── END: Dashboard ───────────────────────────────────────────────────────────
