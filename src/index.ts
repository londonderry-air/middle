import { generate } from 'element/generator';
import { analize } from 'token/lexer';
import { parse } from 'token/parser'
import { COMPONENT_REGXP } from 'shared/variables';

const gen = (markdown: string): HTMLToken[] => {
  const mdArray = analize(markdown);
  const asts = mdArray.map(md => parse(md));
  const htmlStrings = generate(asts)

  return htmlStrings.map((html) => {
    const cmpMatch = html.match(COMPONENT_REGXP) as RegExpExecArray
    return {
      isHTML: cmpMatch === null,
      content: cmpMatch !== null 
        ? {
          component:  cmpMatch[1], 
          props: cmpMatch[2].split(',')
            .map(p => {
              if (p[p.length - 1] === ' ') p.slice(0, -1)
              if (p[0] === ' ') p.slice(0, -1)
              return p
            })
        } 
        : html
    }
  })
}

console.log(gen(`
# Hello,World!
> Hello
>>> GoodNight1
>> Nest2
>>> GoodNight2
>> Nest22
## Hello,SubWorld!
@cmp[title](CalmingClassic)`))

console.log(gen(`@cmp[title](CalmingClassic)`))

export { gen, HTMLToken }

type HTMLToken = {
  isHTML: boolean
  content: {
    component: string
    props: string[]
  } | string
}