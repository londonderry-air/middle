import { generate } from 'element/generator';
import { analize } from 'token/lexer';
import { parse } from 'token/parser'

const gen = (markdown: string) => {
  const mdArray = analize(markdown);
  const asts = mdArray.map(md => parse(md));
  const htmlString = generate(asts)
  return htmlString
}

export { gen }