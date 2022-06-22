import { generate } from 'element/generator';
import { analize } from 'token/lexer';
import { parse } from 'token/parser'

const gen = (markdown: string) => {
  const mdArray = analize(markdown);
  const asts = mdArray.map(md => parse(md));
  const htmlString = generate(asts)
  return htmlString
}

//console.log(gen(`# h1
//## h2
//### h3
//#### h4
//この記事では、[asmsuechan.com](https://asmsuechan.com)を**参考**に解説したいと思います。
//ff**bold**ff`))

export { gen }