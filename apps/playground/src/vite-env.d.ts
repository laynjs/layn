/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_LAYN_DOCS_URL?: string
  readonly VITE_LAYN_HOME_URL?: string
  readonly VITE_LAYN_REPO_URL?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
