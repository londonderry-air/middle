import { AnalysisState } from 'src/element/models/element';
import { LIST_ELM_REGXP, PRE_ELM_REGXP } from 'shared/variables';
  
export const isListMatch = (md: string) => md.match(LIST_ELM_REGXP)
export const isPreMatch = (md: string) => md.match(PRE_ELM_REGXP)

const getAnalysisState = (md: string): AnalysisState => {
  if (isListMatch(md)) {
    return 'list'
  }
  if (isPreMatch(md)) {
    return 'pre'
  }
  return 'neutral'
}

const mdArray: Array<string> = []
let state: AnalysisState = 'neutral'
let listStr = ''
let preStr = ''

const analyseList = (
  md: string, 
  prevState: AnalysisState,
  isLastRow: boolean
): boolean => {
  const currentState = getAnalysisState(md)

  if (currentState === 'list') {
    state = 'list'
    listStr += `${md}\n`

    if (isLastRow) {
      mdArray.push(listStr)
    }

    return true
  }

  // リストが終了した場合（直前までリスト、処理中の行はリストでない）
  if (prevState === 'list') {
    state = 'neutral'
    mdArray.push(listStr)

    listStr = '' // reset list
  }

  return false
}

const analysePre = (
  md: string,
  prevState: AnalysisState,
  isLastRow: boolean
): boolean => {
  const currentState = getAnalysisState(md)
  const isPrevPreState = prevState === 'pre'
  const isCurrentPreState = currentState === 'pre'

  // preモード継続
  if (isPrevPreState && !isCurrentPreState) {
    preStr += md.replace(/&/g, '&amp;')
      .replace(/>/g, '&gt;')
      .replace(/</g, '&lt;')
      .replace(/"/g, '&quot;');
    return true
  }

  // preモード終了
  if (isPrevPreState && isCurrentPreState) {
    preStr += md.replace(/&/g, '&amp;')
      .replace(/>/g, '&gt;')
      .replace(/</g, '&lt;')
      .replace(/"/g, '&quot;');
    mdArray.push(preStr)

    return true
  }

  // preモード開始
  if (!isPrevPreState && isCurrentPreState) {
    state = 'pre'
    preStr += md.replace(/&/g, '&amp;')
      .replace(/>/g, '&gt;')
      .replace(/</g, '&lt;')
      .replace(/"/g, '&quot;');

    return true
  }

  return false
}

const analize = (markdown: string) => {
    const rawMdArray = markdown.split(/\r\n|\r|\n/);
  
    rawMdArray.forEach((md, index) => {
      const isLastRow = index === rawMdArray.length - 1
      const isListMatch = analyseList(md, state, isLastRow)
      const isPreMatch = analysePre(md, state, isLastRow)
      
      if (!isListMatch && !isPreMatch) {
        mdArray.push(md);
      }
    });
    //console.log(rawMdArray)
    console.log(mdArray)
  
    return mdArray;
  };

export { analize }
