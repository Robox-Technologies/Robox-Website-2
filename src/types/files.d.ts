declare module '*.svg' {
    const value: string;
    export default value;
}
declare module '*.svg?raw' {
    const content: string;
    export default content;
  }