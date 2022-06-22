import { ElementType } from "element/models/element"

export const H1_ELM_REGXP = /^# (.+)$/
export const H2_ELM_REGXP = /^## (.+)$/
export const H3_ELM_REGXP = /^### (.+)$/
export const H4_ELM_REGXP = /^#### (.+)$/
export const H5_ELM_REGXP = /^##### (.+)$/
export const STRONG_ELM_REGXP = /\*\*(.*?)\*\*/
export const ITARIC_ELM_REGXP = /__(.+)__/
export const SI_ELM_REGXP = /~~(.+)~~/
export const IMG_ELM_REGXP = /\!\[(.*)\]\((.+)\)/
export const CODE_ELM_REGXP = /`(.+?)`/
export const PRE_ELM_REGXP = /```[^`]*$/
export const LINK_ELM_REGXP = /\[(.*)\]\((.*)\)/
export const LIST_ELM_REGXP = /^( *)([-\*\+] (.+))$/m


export const TEXT_ELM_REGXPS: {
    element: ElementType, 
    regexp: RegExp
}[] = [
    {element: 'h1', regexp: H1_ELM_REGXP},
    {element: 'h2', regexp: H2_ELM_REGXP},
    {element: 'h3', regexp: H3_ELM_REGXP},
    {element: 'h4', regexp: H4_ELM_REGXP},
    {element: 'h5', regexp: H5_ELM_REGXP},
    {element: 'strong', regexp: STRONG_ELM_REGXP},
    {element: 'itaric', regexp: ITARIC_ELM_REGXP},
    {element: 'si', regexp: SI_ELM_REGXP},
    {element: 'code', regexp: CODE_ELM_REGXP},
    {element: 'list', regexp: LIST_ELM_REGXP},
    {element: 'link', regexp: LINK_ELM_REGXP},
    {element: 'img', regexp: IMG_ELM_REGXP},
    {element: 'pre', regexp: PRE_ELM_REGXP}
]

export const PARAGRAPH_NOT_COVERED_ELM_REGXPS: {
    element: ElementType, 
    regexp: RegExp
}[] = [
    {element: 'h1', regexp: H1_ELM_REGXP},
    {element: 'h2', regexp: H2_ELM_REGXP},
    {element: 'h3', regexp: H3_ELM_REGXP},
    {element: 'h4', regexp: H4_ELM_REGXP},
    {element: 'h5', regexp: H5_ELM_REGXP},
    {element: 'code', regexp: CODE_ELM_REGXP},
    {element: 'list', regexp: LIST_ELM_REGXP},
]