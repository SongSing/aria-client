export type SortFunction<T> = (a : T, b : T) => boolean;

export function mapToJson(map: Map<string, any>): { [key: string]: any }
{
    let ret: { [key: string]: any } = {};
    map.forEach((v, k) =>
    {
        ret[k] = v;
    });

    return ret;
}

export function isTauri(): boolean {
    return !!window.__TAURI__;
}

export function mapObject<T extends string, U, V>(o: Record<T, U>, mapFn: (key: T, value: U) => V): Record<T, V>
{
  let ret: Record<string, V> = {};

  Object.entries(o).forEach(([k, v]) =>
  {
    ret[k] = mapFn(k as T, v as U);
  });

  return ret;
}

export function sliceObject<T extends Record<string, any>, K extends (keyof T)[]>(o: T, keys: K): Pick<T, K[number]> {
    const ret: Record<string, any> = {};

    Object.entries(o).filter(([key, value]) => keys.includes(key)).forEach(([key, value]) => {
        ret[key] = value;
    });

    return ret as Pick<T, K[number]>;
}

export function jsonToMap(json: { [key: string]: any }): Map<string, any>
{
    let ret = new Map();
    for (let key in json)
    {
        ret.set(key, json[key]);
    }

    return ret;
}

export function isFileNotFoundError(err : NodeJS.ErrnoException) : boolean
{
    return err.code === "ENOENT";
}

export function mod(x : number, m : number) : number
{
    if (x >= 0)
    {
        return x % m;
    }
    else
    {
        return m - (-x % m);
    }
}

export function numberArray(startInclusive : number, endExclusive : number) : number[]
{
    let ret = [];

    for (let i = startInclusive; i < endExclusive; i++)
    {
        ret.push(i);
    }

    return ret;
}

export function secsToMinSecs(totalSecs : number) : string
{
    let nsecs = Math.floor(totalSecs % 60);
    let nmins = Math.floor(totalSecs / 60);
    let secs : string;
    let mins : string;

    if (isNaN(nsecs))
    {
        secs = "--";
    }
    else
    {
        secs = nsecs.toString();
    }

    if (isNaN(nmins))
    {
        mins = "--";
    }
    else
    {
        mins = nmins.toString();
    }


    if (secs.length === 1)
    {
        secs = "0" + secs;
    }
    if (mins.length === 1)
    {
        mins = "0" + mins;
    }

    return mins + ":" + secs;
}

export function createElement(type : string, className : string = "") : HTMLElement
{
    let ret = document.createElement(type);
    ret.className = className;
    return ret;
}

export function createOptionElement(text : string, value : string) : HTMLOptionElement
{
    let ret = document.createElement("option");
    ret.innerText = text;
    ret.value = value;

    return ret;
}

export function hideElement(element : HTMLElement) : void
{
    element.style.display = "none";
}

export function showElement(element : HTMLElement) : void
{
    element.style.display = "";
}

export function element_isScrolledTo(element : HTMLElement, allowPartial : boolean = false) : boolean
{
    let height = element.getBoundingClientRect().height;
    let top = element.offsetTop;
    let bottom = top + height;

    let parent = element.parentElement;

    if (parent === null)
    {
        return false;
    }

    let parentHeight = parent.getBoundingClientRect().height;
    let scrollTop = parent.scrollTop;
    
    if (allowPartial)
    {
        return !(scrollTop + parentHeight <= top || scrollTop >= bottom);
    }
    else
    {
        return !(scrollTop + parentHeight < bottom || scrollTop > top);
    }
}

export function element_scrollIntoView(element : HTMLElement, align : "top" | "center" | "bottom") : void
{
    let height = element.getBoundingClientRect().height;
    let top = element.offsetTop;
    let bottom = top + height;

    let parent = element.parentElement;

    if (parent === null)
    {
        return;
    }

    let parentHeight = parent.getBoundingClientRect().height;

    switch (align)
    {
        case "top":
            parent.scrollTop = top;
            break;
        case "center":
            parent.scrollTop = parentHeight / 2 - height / 2;
            break;
        case "bottom":
            parent.scrollTop = bottom - parentHeight;
            break;
    }
}

export function element_scrollIntoViewIfNeeded(element : HTMLElement, align : "top" | "center" | "bottom", allowPartial : boolean) : void
{
    if (!element_isScrolledTo(element, allowPartial))
    {
        element_scrollIntoView(element, align);
    }
}

export function endsWith(str : string, endsWith : string) : boolean
{
    if (endsWith.length > str.length)
    {
        return false;
    }
    
    return str.substr(str.length - endsWith.length) === endsWith;
}

// https://github.com/basarat/algorithms/blob/master/src/mergeSorted/mergeSorted.ts
export function mergeSorted<T>(array: T[], compareFn : SortFunction<T>): T[] {
    if (array.length <= 1) {
        return array;
    }
    const middle = Math.floor(array.length / 2);
    const left = array.slice(0, middle);
    const right = array.slice(middle);
    
    return merge<T>(mergeSorted(left, compareFn), mergeSorted(right, compareFn), compareFn);
}

/** Merge (conquer) step of mergeSorted */
function merge<T>(left: T[], right: T[], compareFn : SortFunction<T>): T[] {
    const array: T[] = [];
    let lIndex = 0;
    let rIndex = 0;
    while (lIndex + rIndex < left.length + right.length) {
        const lItem = left[lIndex];
        const rItem = right[rIndex];
        if (lItem == null) {
            array.push(rItem); rIndex++;
        }
        else if (rItem == null) {
            array.push(lItem); lIndex++;
        }
        else if (compareFn(lItem, rItem)) {
            array.push(lItem); lIndex++;
        }
        else {
            array.push(rItem); rIndex++;
        }
    }
    return array;
}

export function emptyFn() {}

export function array_contains<T>(array: T[], item : T) : boolean
{
    return array.indexOf(item) !== -1;
}

export function array_remove<T>(array : T[], item : T) : { item : T, index : number, existed : boolean }
{
    let index = array.indexOf(item);
    if (index !== -1)
    {
        array.splice(index, 1);
        return { item, index, existed: true };
    }

    return { item, index: -1, existed: false };
}

export function array_remove_multiple<T>(array : T[], items : T[]) : void
{
    items.forEach(item =>
    {
        let index = array.indexOf(item);
        if (index !== -1)
        {
            array.splice(index, 1);
        }
    });
}

export function array_remove_all<T>(array : T[], item : T) : { item : T, indexes : number[], existed : boolean }
{
    let indexes = [];

    let index;

    while ((index = array.indexOf(item)) !== -1)
    {
        indexes.push(index);
        array.splice(index, 1);
    }

    return { item, indexes: indexes, existed: indexes.length > 0 };
}

export function array_item_at<T>(array : T[], index : number) : T
{
    if (index >= array.length)
    {
        return array[index % array.length];
    }
    else if (index < 0)
    {
        return array[array.length - (-index % array.length)];
    }
    else
    {
        return array[index];
    }
}

export function array_remove_at<T>(array : T[], index : number) : { item : T | null, index : number, existed : boolean }
{    
    if (index !== -1)
    {
        return { item: array.splice(index, 1)[0], index, existed: true };
    }

    return { item: null, index: -1, existed: false };
}

export function array_insert<T>(array : T[], item : T, index_or_fn : number | SortFunction<T>) : { item : T, index : number }
{
    if (typeof index_or_fn === "number")
    {
        array.splice(index_or_fn, 0, item);
        return { item: item, index: index_or_fn };
    }
    else
    {
        for (let i = 0; i < array.length; i++)
        {
            if (index_or_fn(item, array[i]))
            {
                array.splice(i, 0, item);
                return { item: item, index: i };
            }
        }

        array.push(item);
        return { item: item, index: array.length - 1 };
    }

}

export function array_copy<T>(array : T[]) : T[]
{
    return array.slice();
}

export function array_shuffle<T>(array : T[]) : void
{
    let i = 0;
    let j = 0;
    let temp = null;
    
    for (i = array.length - 1; i > 0; i -= 1)
    {
        j = Math.floor(Math.random() * (i + 1));
        temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }
}

export function array_insert_random<T>(array : T[], item : T) : { index : number, item : T }
{
    let index = Math.floor(Math.random() * (array.length + 1));
    return array_insert(array, item, index);
}

export function array_last<T>(array : T[]) : T
{
    return array[array.length - 1];
}

// so like array_item_instance([5, 6, 5, 6], 2) would be 2 since that's the second instance of 5
export function array_item_instance(array: any[], index: number): number
{
    let ret = 1;

    for (let i = 0; i < index; i++)
    {
        ret += +(array[i] === array[index]);
    }

    return ret;
}

export function array_swap<T>(array : T[], a : number | T, b : number | T) : void
{
    if (typeof(a) !== "number")
    {
        a = array.indexOf(a);
    }

    if (typeof(b) !== "number")
    {
        b = array.indexOf(b);
    }

    let temp = array[a];
    array[a] = array[b];
    array[b] = temp;
}

export function array_ensureOne<T>(array : T[], item : T) : { item : T, index : number, existed: boolean }
{
    let i = array.indexOf(item);

    if (i === -1)
    {
        array.push(item);
        return { item, index: array.length - 1, existed: false };
    }
    else
    {
        return { item, index: i, existed: true };
    }
}

export function stopProp(e : MouseEvent) : void
{
    e.stopPropagation();
}

export function getRainbowColor(n : number) : string
{
    let r = ~~(255 * (n < 0.5 ? 1 : 1 - 2 * (n - 0.5)));
    let g = ~~(255 * (n < 0.5 ? 2 * n : 1));
    let b = ~~(255 * (n > 0.5 ? 2 * (n - 0.5) : 0));
    let color = "rgb(" + r + "," + g + "," + b + ")";
    return color;
}

export function getCurrentMs() : number
{
    return Date.now();
}

export function sign(n : number) : number
{
    return (n > 0 ? 1 : (n < 0 ? -1 : 0));
}

export function classList(list: (string | undefined | null | false)[]): string
{
    return list.filter(i => i).join(" ");
}

export function keysOf<T>(o: T): Array<keyof T>
{
    return Object.keys(o) as Array<keyof T>;
}

export function formatDuration(seconds: number): string
{
    let minutes = Math.floor(Math.round(seconds) / 60);

    return [
        minutes.toString().padStart(2, "0"),
        (Math.round(seconds) % 60).toString().padStart(2, "0")
    ].join(":");
}

const _MS_PER_DAY = 1000 * 60 * 60 * 24;

// a and b are javascript Date objects
export function dateDiffInDays(a: Date, b: Date) {
  // Discard the time and time-zone information.
  const utc1 = Date.UTC(a.getFullYear(), a.getMonth(), a.getDate());
  const utc2 = Date.UTC(b.getFullYear(), b.getMonth(), b.getDate());

  return Math.floor((utc2 - utc1) / _MS_PER_DAY);
}