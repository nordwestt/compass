import { Readability } from "@mozilla/readability";
import { getProxyUrl } from "./proxy";


export async function fetchSiteText(url:string): Promise<string>{
    const html = await fetch(await getProxyUrl(url)).then(res => res.text());
    const doc = new DOMParser().parseFromString(html, 'text/html');
    const reader = new Readability(doc);
    const article = reader.parse();
    
    if (!article?.textContent) {
        return "";
    }
    // Trim and clean up the content
    const cleanContent = article.textContent
        .trim()
        .replace(/\s+/g, ' ')
        .slice(0, 2000); // Limit content length
    
    return cleanContent;
}