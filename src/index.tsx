import { generate } from 'element/generator';
import { analize } from 'token/lexer';
import { parse } from 'token/parser'
import { COMPONENT_REGXP } from 'shared/variables';
import React from 'react';

const genDynamicElement = (
  dynamic: any, // add next-dynamic
  tokens: HTMLToken[]
) => {
  const componentPath = process.env.MIDDLE_COMPONENT_PATH 
    ?? process.env.NEXT_PUBLIC_MIDDLE_COMPONENT_PATH
    ?? ''
  const elements = tokens.map(t => {
      if (t.isHTML) {
          return <div dangerouslySetInnerHTML={{__html: t.content as string}} />
      } else {
          const content = t.content as {component: string, props: string[]}
          const Component = dynamic(() => import(componentPath + content.component))
          return Component ? <Component /> : <></>
      }
  })
  return <>{elements.map(e => e)}</>
}

const gen = (
  markdown: string,
  dynamic: any // add next/dynamic
): JSX.Element => {
  const mdArray = analize(markdown);
  const asts = mdArray.map(md => parse(md));
  const htmlStrings = generate(asts)

  const tokens: HTMLToken[] =  htmlStrings.map((html) => {
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

  return genDynamicElement(dynamic, tokens)
}

//console.log(gen(`
//# Hello,World!
//> Hello
//>>> GoodNight1
//>> Nest2
//>>> GoodNight2
//>> Nest22
//## Hello,SubWorld!
//@cmp[title](CalmingClassic)`))

//console.log(gen(`@cmp[title](CalmingClassic)`))

export { gen, HTMLToken }

type HTMLToken = {
  isHTML: boolean
  content: {
    component: string
    props: string[]
  } | string
}