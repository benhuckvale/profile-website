/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_GISCUS_REPO?: string;
  readonly VITE_GISCUS_REPO_ID?: string;
  readonly VITE_GISCUS_CATEGORY?: string;
  readonly VITE_GISCUS_CATEGORY_ID?: string;
  readonly VITE_GISCUS_MAPPING?: string;
  readonly VITE_GISCUS_TERM?: string;
  readonly VITE_GISCUS_REACTIONS?: string;
  readonly VITE_GISCUS_EMIT_METADATA?: string;
  readonly VITE_GISCUS_INPUT_POSITION?: string;
  readonly VITE_GISCUS_THEME?: string;
  readonly VITE_GISCUS_FRAMEWORK?: string;
  readonly VITE_GISCUS_STRICT?: string;
  readonly VITE_GISCUS_LANG?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
