const dangerousTagRegex =
  /<\/?(script|iframe|object|embed|style|link|meta|base)[^>]*>/gi;
const javascriptProtocolRegex = /\]\(\s*javascript:[^)]+\)/gi;
const dataHtmlProtocolRegex = /\]\(\s*data:text\/html[^)]+\)/gi;
const controlCharRegex = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g;
const eventHandlerRegex = /\son[a-z]+\s*=\s*(['"]).*?\1/gi;

export function sanitizePlainText(input: string) {
  return input
    .replace(controlCharRegex, '')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

export function sanitizeMarkdownInput(input: string) {
  return input
    .replace(controlCharRegex, '')
    .replace(dangerousTagRegex, '')
    .replace(eventHandlerRegex, '')
    .replace(javascriptProtocolRegex, '](#)')
    .replace(dataHtmlProtocolRegex, '](#)')
    .trim();
}
