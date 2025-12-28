/// <reference types="astro/client" />

// Shader file declarations for Vite raw imports
declare module '*.vert?raw' {
  const content: string;
  export default content;
}

declare module '*.frag?raw' {
  const content: string;
  export default content;
}

declare module '*.glsl?raw' {
  const content: string;
  export default content;
}
