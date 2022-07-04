import { generate } from 'element/generator';
import { analize } from 'token/lexer';
import { parse } from 'token/parser'

const gen = (markdown: string) => {
  const mdArray = analize(markdown);
  const asts = mdArray.map(md => parse(md));
  const htmlString = generate(asts)
  return htmlString
}

console.log(gen(`
# Hello,World!
> Hello
>>> GoodNight1
>> Nest2
>>> GoodNight2
>> Nest22
@cmp[title](CalmingClassic)
`))
console.log('--------------------')
console.log(gen(`@cmp[title](CalmingClassic)`))

export { gen }