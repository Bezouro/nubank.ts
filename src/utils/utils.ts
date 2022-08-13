export function camelize(str: string) {
  return str.toLowerCase().replace(/[^a-zA-Z0-9]+(.)/g, (m, chr) => chr.toUpperCase());
}
  
export function parseWwwAuthHeader<T>(header: string): T {
  const chunks = header.split(',');
  const parsed: { [key:string]: string } = {};
  for (const chunk of chunks) {
    let [key, value] = chunk.split('=');
    key = key.trim().split(' ').join('_');
    value = value.split('"').join('');
    parsed[camelize(key)] = value;
  }

  return parsed as unknown as T;
}