import { Attribute } from 'element/models/element';
import { Token, TokenizeSource } from 'token/models/token'
import { genTextToken, genParagraphToken } from 'element/generator';
import { isListMatch, isPreMatch } from './lexer';
import { TEXT_ELM_REGXPS } from 'shared/variables';

const rootToken: Token = {
  id: 0,
  elmType: 'root',
  content: '',
  parent: {} as Token,
};

export const parse = (markdownRow: string) => {
    if (isListMatch(markdownRow)) {
        return tokenizeList(markdownRow)
    }
    if (isPreMatch(markdownRow)) {
        return tokenizePre(markdownRow)
    }
    return tokenizeText(markdownRow)
}

// マークダウンに合わない場合、この関数を使用してトークン化する
const tokenizeWithNoPrefix = (parent: Token, id: number, text: string): Token[] => {
    const elements = []
    if (parent.elmType === 'li') {
        const paragraphToken = genParagraphToken(id++, '', parent)
        elements.push(paragraphToken)
    } 
    const onlyTextToken = genTextToken(id++, text, parent)
    elements.push(onlyTextToken)

    return elements
}

// 解析中のテキストを空にして、処理を終了させる
const finishTokenize = (text: string) => text = ''

// 解析中の文字が残っている場合は、トークン化の処理を続ける
const isContinueTokenize = (text: string) => text.length !== 0

// 一番外にある要素を検索して返却
const getMostOuterTokenizeSource = (sources: TokenizeSource[]) => {
    return sources.reduce((current, prev) => {
        return (current.matchList.index ?? -1) < (prev.matchList.index ?? -1)
            ? current
            : prev
    })
}
  
const tokenizeText = (
    textElement: string,
    initialId: number = 0,
    initialRoot: Token = rootToken
) => {
    let elements: Token[] = [];
    let parent: Token = initialRoot;
  
    let id = initialId;
  
    const _tokenize = (originalText: string, p: Token) => {
        let analysingText = originalText;
        parent = p;
        // その行が空文字になるまで処理を繰り返す
        while (isContinueTokenize(analysingText)) {
            const matchList: TokenizeSource[] = TEXT_ELM_REGXPS
                .map(item => ({
                    element: item.element,
                    matchList: analysingText.match(item.regexp) as RegExpMatchArray
                }))
                .filter(item => !!item.matchList)
            const isNoPrefixFound = matchList.length === 0

            // most short text
            if (isNoPrefixFound) {
                const tokens = tokenizeWithNoPrefix(parent, id, analysingText)
                elements.push(...tokens)

                finishTokenize(analysingText)
            } else {
                const mostOuterToken = getMostOuterTokenizeSource(matchList)
                const isSetParagraphParentToken = mostOuterToken.element !== 'h1' &&
                    mostOuterToken.element !== 'h2' &&
                    mostOuterToken.element !== 'h3' &&
                    mostOuterToken.element !== 'h4' &&
                    mostOuterToken.element !== 'h5' &&
                    parent.elmType !== 'h1' &&
                    parent.elmType !== 'h2' &&
                    parent.elmType !== 'h3' &&
                    parent.elmType !== 'h4' &&
                    parent.elmType !== 'h5' &&
                    parent.elmType !== 'ul' &&
                    parent.elmType !== 'ol' &&
                    parent.elmType !== 'link' &&
                    parent.elmType !== 'code'
                // Prefix が先頭でない場所に見つかった場合
                const isTextExistBeforePrefix = (mostOuterToken.matchList.index ?? -1) > 0

                if (isSetParagraphParentToken) {
                    const token = {
                        id,
                        elmType: 'paragraph',
                        content: '',
                        parent,
                    } as Token;
                    elements.push(token)

                    parent = token
                }

                if (isTextExistBeforePrefix) {
                    const text = analysingText.substring(0, mostOuterToken.matchList.index)
                    const token = genTextToken(
                        id++,
                        text,
                        parent
                    )
                    elements.push(token)

                    // remove tokenised text
                    analysingText = analysingText.replace(text, '')
                }

                if (parent.elmType === 'code') {
                    const token = genTextToken(id++, mostOuterToken.matchList[0], parent)
                    elements.push(token)

                    analysingText = analysingText.replace(mostOuterToken.matchList[0], '')
                } else {
                    const attributes: Attribute[] = []
                    const isImgToken = mostOuterToken.element === 'img'
                    const isLinkToken = mostOuterToken.element === 'link'

                    if (isImgToken) {
                        attributes.push({
                            attrName: 'src',
                            attrValue: mostOuterToken.matchList[2]
                        })
                    }

                    if (isLinkToken) {
                        attributes.push({
                            attrName: 'href',
                            attrValue: mostOuterToken.matchList[2]
                        })
                    }

                    const token: Token = {
                        id: id++,
                        elmType: mostOuterToken.element,
                        content: mostOuterToken.matchList[1],
                        parent: parent,
                        attributes: attributes
                    }
                    elements.push(token)
                    
                    parent = token

                    // remove tokenised text
                    analysingText = analysingText.replace(mostOuterToken.matchList[0], '')

                    // 再起的に呼び出す
                    _tokenize(mostOuterToken.matchList[1], parent)
                }
            }
        }
    }

    _tokenize(textElement, parent);
    return elements;
}

export const tokenizeList = (listString: string) => {
  
    let id = 1;
    const rootUlToken: Token = {
      id,
      elmType: 'ul',
      content: '',
      parent: rootToken,
    };
    let tokens: Token[] = [rootUlToken];
    listString
        .split(/\r\n|\r|\n/)
        .filter(Boolean)
        .forEach((l) => {
            const match = isListMatch(l) as RegExpMatchArray
    
            id += 1;
            const listToken: Token = {
                id,
                elmType: 'li',
                content: '', // Indent level
                parent: rootUlToken,
            };
            tokens.push(listToken);
            const listText: Token[] = tokenizeText(match[3], id, listToken);
            id += listText.length;
            tokens.push(...listText);
        });
    return tokens;
}

export const tokenizePre = (md: string) => {
    let id = 1
    const rootPreToken: Token = {
        id,
        elmType: 'pre',
        content: '',
        parent: rootToken
    }
    let tokens: Token[] = [rootPreToken]
    const PRE_INSIDE_TEXT_REGXP = /```(.*?)```/
    const match = md.match(PRE_INSIDE_TEXT_REGXP) as RegExpMatchArray

    const codeToken: Token = {
        id,
        elmType: 'code',
        content: '',
        parent: rootPreToken
    }
    const textToken: Token = {
        id,
        elmType: 'text',
        content: match[1],
        parent: codeToken
    }
    tokens.push(codeToken)
    tokens.push(textToken)

    return tokens
}

const _createBreakToken = (): Token[] => {
    return [
      {
        id: 1,
        elmType: 'break',
        content: '',
        parent: rootToken,
      },
    ] as Token[];
}
  
