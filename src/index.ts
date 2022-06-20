import { generate } from 'src/token/generator';
import { analize } from 'src/token/lexer';
import { parse } from 'src/token/parser'

const gen = (markdown: string) => {
  const mdArray = analize(markdown);
  const asts = mdArray.map(md => parse(md));
  const htmlString = generate(asts)
  return htmlString
}

export { gen }