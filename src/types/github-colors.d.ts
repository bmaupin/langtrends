// This file was generated using npx dts-gen -m github-colors

interface GitHubColor {
  ace_mode: string;
  color: string;
  extensions: string[];
  tm_scopre: string;
  type: string;
}

declare module 'github-colors' {
  export const colors: GitHubColor[];

  export const extensions: any;

  export function ext(ext: string, handleOthers: boolean): any;

  export function get(lang: string, handleOthers: boolean): GitHubColor;

  export function init(ext: boolean): GitHubColor[];
}
