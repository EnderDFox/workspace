//======
//======原生扩展 js代码位于Common.js
//------Array扩展
interface Array<T> {
    findIndex(predicateFn: (item: T, index?: number, arr?: T[]) => boolean, thisArg?: any): number
    IndexOfAttr(key: string, value: any): number
    FindOfAttr<T>(key: string, value: any): T
    RemoveByAttr(key: string, value: any): number
}
//------Date扩展
interface Date {
    /**
     * 
     * @param format yyyy-MM-dd h:m:s
     */
    format(): string
    format(format: string): string
}

//======JQuery扩展 必须和 JQueryExtend.ts一致
interface JQueryStatic {
    md5(val: string): string
}
interface JQuery<TElement extends Node = HTMLElement> extends Iterable<TElement> {
    x(): number
    x(vx: number): this
    y(): number
    y(vy: number): this
    xy(): IXY
    xy(vx: number, vy: number): this
    isShow(): boolean
    adjust(offsetY: number): this
    freezeTop(winUnbind: boolean)
    freezeLeft(winUnbind: boolean)
}

//======完善其他 d.ts 或为其增加扩展方法  
//------仅仅是type定义  没有js代码
declare type CombinedVueInstance1<Data> = Vue & Data;


//======echarts
declare var echarts: {
    init: (el: HTMLElement) => any
}



