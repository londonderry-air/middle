import { AnalysisState } from "./types";
import { BLOCKQUOTE_ELM_REGXP, LIST_ELM_REGXP, PRE_ELM_REGXP } from "src/regex";

export const isListMatch = (md: string) => md.match(LIST_ELM_REGXP);
export const isPreMatch = (md: string) => md.match(PRE_ELM_REGXP);
export const isBlockquoteMatch = (md: string) => md.match(BLOCKQUOTE_ELM_REGXP);

const getAnalysisState = (md: string): AnalysisState => {
  if (isPreMatch(md)) {
    return "pre";
  }
  if (isListMatch(md)) {
    return "list";
  }
  if (isBlockquoteMatch(md)) {
    return "blockquote";
  }
  return "neutral";
};

let mdArray: Array<string> = [];
let state: AnalysisState = "neutral";
let listStr = "";
let preStr = "";
let bqStr = "";

const analyseList = (
  md: string,
  prevState: AnalysisState,
  isLastRow: boolean
): boolean => {
  const currentState = getAnalysisState(md);

  if (currentState === "list") {
    state = "list";
    listStr += `${md}\n`;

    if (isLastRow) {
      mdArray.push(listStr);
    }

    return true;
  }

  // リストが終了した場合（直前までリスト、処理中の行はリストでない）
  if (prevState === "list") {
    state = "neutral";
    mdArray.push(listStr);

    listStr = ""; // reset list
  }

  return false;
};

const analysePre = (md: string, prevState: AnalysisState): boolean => {
  const currentState = getAnalysisState(md);
  const isPrevPreState = prevState === "pre";
  const isCurrentPreState = currentState === "pre";

  // preモード継続
  if (isPrevPreState && !isCurrentPreState) {
    preStr += `${md}\n`;
    return true;
  }

  // preモード終了
  if (isPrevPreState && isCurrentPreState) {
    preStr += md;
    mdArray.push(preStr);

    state = "neutral";
    preStr = "";
    return true;
  }

  // preモード開始
  if (!isPrevPreState && isCurrentPreState) {
    const [, lang] = md.split("```");
    state = "pre";
    preStr += md.replace(lang, "") + (lang !== "" ? `[[!${lang}!]]\n` : "\n");

    return true;
  }

  return false;
};

const analyseBlockquote = (
  md: string,
  prevState: AnalysisState,
  isLastRow: boolean
): boolean => {
  const currentState = getAnalysisState(md);
  const isCurrentBqState = currentState === "blockquote";

  // Quoteが始まる
  if (prevState === "neutral" && isCurrentBqState) {
    bqStr += `${md}\n`;
    state = "blockquote";
    return true;
  }

  if (prevState === "blockquote") {
    // Quote継続
    if (isCurrentBqState) {
      bqStr += `${md}\n`;
    }

    // Quote 終了
    // 処理中の行は Blockqoute として処理しない
    if (!isCurrentBqState) {
      mdArray.push(bqStr);
      bqStr = "";
      return false;
    }

    // Quote 終了（最終行のため）
    if (isLastRow) {
      mdArray.push(bqStr);
      bqStr = "";
    }

    return true;
  }

  return false;
};

const analize = (markdown: string) => {
  const rawMdArray = markdown.split(/\r\n|\r|\n/);
  mdArray = [];
  rawMdArray.forEach((md, index) => {
    const isLastRow = index === rawMdArray.length - 1;
    const isListMode = analyseList(md, state, isLastRow);
    const isBlockquote = analyseBlockquote(md, state, isLastRow);
    const isPreMode = analysePre(md, state);

    if (!isListMode && !isPreMode && !isBlockquote) {
      mdArray.push(md);
    }
  });
  // console.log(rawMdArray)
  // console.log(mdArray)

  return mdArray;
};

export { analize };
