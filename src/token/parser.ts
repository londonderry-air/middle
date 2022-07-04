import { Attribute } from 'element/models/element';
import { Token, TokenizeSource } from 'token/models/token'
import { genTextToken, genParagraphToken } from 'token/generator';
import { isBlockquoteMatch, isListMatch, isPreMatch } from './lexer';
import { BLOCKQUOTE_ELM_REGXP, PARAGRAPH_NOT_COVERED_ELM_REGXPS, TEXT_ELM_REGXPS } from 'shared/variables';
import { getRandomStr } from 'shared/string';

const rootToken: Token = {
  id: getRandomStr(),
  elmType: 'root',
  content: '',
  parent: {} as Token,
};

export const parse = (mdRow: string) => {
    if (isListMatch(mdRow)) {
        return tokenizeList(mdRow)
    }
    if (isPreMatch(mdRow)) {
        return tokenizePre(mdRow)
    }
    if (isBlockquoteMatch(mdRow)) {
        return tokenizeBlockquote(mdRow)
    }
    return tokenizeText(mdRow)
}

// マークダウンに合わない場合、この関数を使用してトークン化する
const tokenizeWithNoPrefix = (parent: Token, text: string): Token[] => {
    const elements = []
    if (parent.elmType === 'li') {
        const paragraphToken = genParagraphToken(getRandomStr(), '', parent)
        elements.push(paragraphToken)
    } 
    const onlyTextToken = genTextToken(getRandomStr(), text, parent)
    elements.push(onlyTextToken)

    return elements
}

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
    initialRoot: Token = rootToken
) => {
    let elements: Token[] = [];
    let parent: Token = initialRoot;

    const isParagraphCoverdLine = PARAGRAPH_NOT_COVERED_ELM_REGXPS
        .map(item => ({
            element: item.element,
            matchList: textElement.match(item.regexp) as RegExpMatchArray
        }))
        .filter(item => item.matchList)
        .length === 0 // pタグで囲まない要素がある場合は、ループ処理内でそれぞれ pタグ の判定をつける
        && parent.elmType !== 'li' // liの中は pタグで囲まないため、子要素の内容にかかわらず囲まないようにする
        && parent.elmType !== 'pre' // preの中は pタグで囲まないため、子要素の内容にかかわらず囲まないようにする
        && parent.elmType !== 'component'

    if (isParagraphCoverdLine) {
        const rootParagraphToken = {
            id: getRandomStr(),
            elmType: 'paragraph',
            content: '',
            parent, // initialRoot
        } as Token;

        parent = rootParagraphToken
        elements.push(rootParagraphToken)
    }
  
    const _tokenize = (originalText: string, p: Token) => {
        let analysingText = originalText;
        let paragraphToken = p
        parent = p

        // その行が空文字になるまで処理を繰り返す
        while (isContinueTokenize(analysingText)) {
            const matchList: TokenizeSource[] = TEXT_ELM_REGXPS
                .map(item => ({
                    element: item.element,
                    matchList: analysingText.match(item.regexp) as RegExpMatchArray
                }))
                .filter(item => item.matchList)
            const isNoPrefixFound = matchList.length === 0

            // most short text
            if (isNoPrefixFound) {
                const tokens = tokenizeWithNoPrefix(paragraphToken, analysingText)
                elements.push(...tokens)

                // 解析中のテキストを空にして、処理を終了させる
                analysingText = ''
            } else {
                const mostOuterToken = getMostOuterTokenizeSource(matchList)
                const isSetParagraphParentToken = mostOuterToken.element !== 'h1' &&
                    mostOuterToken.element !== 'h2' &&
                    mostOuterToken.element !== 'h3' &&
                    mostOuterToken.element !== 'h4' &&
                    mostOuterToken.element !== 'h5' &&
                    mostOuterToken.element !== 'component' &&
                    parent.elmType !== 'h1' &&
                    parent.elmType !== 'h2' &&
                    parent.elmType !== 'h3' &&
                    parent.elmType !== 'h4' &&
                    parent.elmType !== 'h5' &&
                    parent.elmType !== 'ul' &&
                    parent.elmType !== 'li' &&
                    parent.elmType !== 'ol' &&
                    parent.elmType !== 'link' &&
                    parent.elmType !== 'code' &&
                    parent.elmType !== 'component' &&
                    !isParagraphCoverdLine

                // Prefix が先頭でない場所に見つかった場合
                const isTextExistBeforePrefix = (mostOuterToken.matchList.index ?? -1) > 0

                if (isSetParagraphParentToken) {
                    paragraphToken = {
                        id: getRandomStr(),
                        elmType: 'paragraph',
                        content: '',
                        parent,
                    } as Token;
                    parent = paragraphToken
                    elements.push(parent)
                }

                if (isTextExistBeforePrefix) {
                    const text = analysingText.substring(0, mostOuterToken.matchList.index)
                    const token = genTextToken(
                        getRandomStr(),
                        text,
                        parent
                    )
                    elements.push(token)

                    // remove tokenised text
                    analysingText = analysingText.replace(text, '')
                }

                if (parent.elmType === 'code') {
                    const token = genTextToken(getRandomStr(), mostOuterToken.matchList[0], parent)
                    elements.push(token)

                    analysingText = analysingText.replace(mostOuterToken.matchList[0], '')
                } else {
                    const attributes: Attribute[] = []
                    const props: string[] = []
                    const isImgToken = mostOuterToken.element === 'img'
                    const isLinkToken = mostOuterToken.element === 'link'
                    const isComponentToken = mostOuterToken.element === 'component'

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

                    if (isComponentToken) {
                        mostOuterToken.matchList[2]
                            .split(',')
                            .forEach(p => {
                                if (p[p.length - 1] === ' ') p.slice(0, -1)
                                if (p[0] === ' ') p.slice(0, -1)
                                props.push(p)
                            })
                    }

                    const token: Token = {
                        id: getRandomStr(),
                        elmType: mostOuterToken.element,
                        content: mostOuterToken.matchList[1],
                        parent: parent,
                        attributes: attributes,
                        props: props
                    }

                    parent = token
                    elements.push(token)

                    // remove tokenised text
                    analysingText = analysingText.replace(mostOuterToken.matchList[0], '')

                    // 再起的に呼び出す
                    _tokenize(mostOuterToken.matchList[1], parent)
                }
                parent = p
            }
        }
    }

    _tokenize(textElement, parent);
    return elements;
}

export const tokenizeList = (listString: string) => {
    const rootUlToken: Token = {
      id: getRandomStr(),
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
            const listToken: Token = {
                id: getRandomStr(),
                elmType: 'li',
                content: '', // Indent level
                parent: rootUlToken,
            };
            tokens.push(listToken);
            const listText: Token[] = tokenizeText(match[3], listToken);
            tokens.push(...listText);
        });
    return tokens;
}

export const tokenizePre = (md: string) => {
    let id = 1
    const rootPreToken: Token = {
        id: getRandomStr(),
        elmType: 'pre',
        content: '',
        parent: rootToken
    }
    let tokens: Token[] = [rootPreToken]
    const PRE_INSIDE_TEXT_REGXP = /```(.*?)```/
    const match = md.match(PRE_INSIDE_TEXT_REGXP) as RegExpMatchArray

    const codeToken: Token = {
        id: getRandomStr(),
        elmType: 'code',
        content: '',
        parent: rootPreToken
    }
    const textToken: Token = {
        id: getRandomStr(),
        elmType: 'text',
        content: match[1],
        parent: codeToken
    }
    tokens.push(codeToken)
    tokens.push(textToken)

    return tokens
}

export const tokenizeBlockquote = (md: string) => {
    let rootBqToken: Token = {
        id: getRandomStr(),
        elmType: 'blockquote',
        content: '',
        parent: rootToken
    }
    let tokens: Token[] = []
    let bqTokens: Token[] = [] // ネストの深さを配列の長さで管理する
    let prevNestLevel = 0 // １つ前の行におけるネストの深さ

    // ネストの深さを取得
    // ネストは先頭から連続する場合のみ取得するので、 > の間に文字がある場合は無効
    const getQuoteNestLevel = (mdRow: string) => {
        let copyMdRow = mdRow
        let level = 0
        while(copyMdRow.indexOf('>') !== -1) {
            if (copyMdRow.indexOf('>') === 0) {
                level += 1
                copyMdRow = copyMdRow.substring(1)
            } else {
                break
            }
        }
        return level
    }
    md.split('\n')
        .filter(mdRow => mdRow.length !== 0)
        .forEach(mdRow => {
        const match = mdRow.match(BLOCKQUOTE_ELM_REGXP) as RegExpMatchArray;
        const currentNestLevel = getQuoteNestLevel(mdRow)
        const isInitial = prevNestLevel === 0
        const isMoreNested = currentNestLevel > prevNestLevel
        if (isMoreNested || isInitial) {
            [...Array(currentNestLevel - prevNestLevel)].forEach(() => {
                const nestLevel = prevNestLevel + 1
                const bqToken: Token = {
                    id: getRandomStr(),
                    elmType: 'blockquote',
                    content: '',
                    parent: bqTokens.length === 0 ? rootToken : bqTokens[prevNestLevel]
                }
                const textTokens = tokenizeText(match[2], bqToken)

                // ネスト管理用の配列を更新
                bqTokens[nestLevel] = bqToken

                // 作成されたトークンを格納
                tokens.push(bqToken, ...textTokens)

                // ネストの深さを反映
                prevNestLevel += 1
            })
        } else {
            // 階層が深くならない場合は、現在のネストレベルに合わせて親トークンを設定する
            const textTokens = tokenizeText(match[2], bqTokens[currentNestLevel])
            tokens.push(...textTokens)

            prevNestLevel = currentNestLevel
        }
    })

    return tokens
}

const _createBreakToken = (): Token[] => {
    return [
      {
        id: getRandomStr(),
        elmType: 'break',
        content: '',
        parent: rootToken,
      },
    ] as Token[];
}
  
