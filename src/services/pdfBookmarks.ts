import { PDFDocument, PDFDict, PDFName, PDFArray, PDFRef, PDFNumber, PDFHexString, PDFString } from 'pdf-lib';

export interface BookmarkItem {
  title: string;
  pageIndex: number;
  children: BookmarkItem[];
}

export async function extractBookmarks(pdfDoc: PDFDocument): Promise<BookmarkItem[]> {
  const catalog = pdfDoc.catalog;
  const outlinesRef = catalog.get(PDFName.of('Outlines'));
  
  if (!outlinesRef) {
    return [];
  }
  
  const outlines = catalog.lookup(PDFName.of('Outlines'), PDFDict);
  if (!outlines) {
    return [];
  }
  
  const firstRef = outlines.get(PDFName.of('First'));
  if (!firstRef) {
    return [];
  }
  
  const pages = pdfDoc.getPages();
  const pageRefs = pages.map((_, idx) => pdfDoc.getPage(idx).ref);
  
  return parseOutlineItems(pdfDoc, firstRef as PDFRef, pageRefs);
}

function parseOutlineItems(
  pdfDoc: PDFDocument,
  firstRef: PDFRef,
  pageRefs: PDFRef[]
): BookmarkItem[] {
  const items: BookmarkItem[] = [];
  let currentRef: PDFRef | undefined = firstRef;
  
  while (currentRef) {
    const itemDict: PDFDict | undefined = pdfDoc.context.lookup(currentRef, PDFDict);
    if (!itemDict) break;
    
    const titleObj = itemDict.get(PDFName.of('Title'));
    let title = '';
    if (titleObj instanceof PDFHexString) {
      title = titleObj.decodeText();
    } else if (titleObj instanceof PDFString) {
      title = titleObj.decodeText();
    }
    
    let pageIndex = 0;
    
    const destObj = itemDict.get(PDFName.of('Dest'));
    if (destObj) {
      const dest = itemDict.lookup(PDFName.of('Dest'));
      if (dest instanceof PDFArray && dest.size() > 0) {
        const pageRef = dest.get(0);
        if (pageRef instanceof PDFRef) {
          const foundIndex = pageRefs.findIndex(ref => ref.toString() === pageRef.toString());
          if (foundIndex >= 0) {
            pageIndex = foundIndex;
          }
        }
      }
    } else {
      const actionObj = itemDict.get(PDFName.of('A'));
      if (actionObj) {
        const action = itemDict.lookup(PDFName.of('A'), PDFDict);
        if (action) {
          const actionDest = action.lookup(PDFName.of('D'));
          if (actionDest instanceof PDFArray && actionDest.size() > 0) {
            const pageRef = actionDest.get(0);
            if (pageRef instanceof PDFRef) {
              const foundIndex = pageRefs.findIndex(ref => ref.toString() === pageRef.toString());
              if (foundIndex >= 0) {
                pageIndex = foundIndex;
              }
            }
          }
        }
      }
    }
    
    const children: BookmarkItem[] = [];
    const firstChildRef = itemDict.get(PDFName.of('First'));
    if (firstChildRef instanceof PDFRef) {
      children.push(...parseOutlineItems(pdfDoc, firstChildRef, pageRefs));
    }
    
    items.push({ title, pageIndex, children });
    
    const nextRefObj = itemDict.get(PDFName.of('Next'));
    currentRef = nextRefObj instanceof PDFRef ? nextRefObj : undefined;
  }
  
  return items;
}

export function filterBookmarksForPages(
  bookmarks: BookmarkItem[],
  selectedPageIndices: number[]
): BookmarkItem[] {
  const minPage = Math.min(...selectedPageIndices);
  const maxPage = Math.max(...selectedPageIndices);
  const result: BookmarkItem[] = [];
  
  for (const bookmark of bookmarks) {
    const isInRange = bookmark.pageIndex >= minPage && bookmark.pageIndex <= maxPage;
    
    // 递归过滤子书签
    const filteredChildren = filterBookmarksForPages(bookmark.children, selectedPageIndices);
    
    // 两种情况保留书签：
    // 1. 书签本身在范围内
    // 2. 书签不在范围内，但有子书签在范围内（此时父书签指向新文件的第0页）
    if (isInRange || filteredChildren.length > 0) {
      let newPageIndex = 0;
      
      if (isInRange) {
        const mappedIndex = selectedPageIndices.indexOf(bookmark.pageIndex);
        if (mappedIndex >= 0) {
          newPageIndex = mappedIndex;
        }
      }
      // 如果不在范围内但保留了（因为有子书签），默认指向第0页
      
      result.push({
        title: bookmark.title,
        pageIndex: newPageIndex,
        children: filteredChildren
      });
    }
  }
  
  return result;
}

export async function addBookmarks(
  pdfDoc: PDFDocument,
  bookmarks: BookmarkItem[]
): Promise<void> {
  if (bookmarks.length === 0) return;
  
  const context = pdfDoc.context;
  const catalog = pdfDoc.catalog;
  
  catalog.delete(PDFName.of('Outlines'));
  
  const outlineDict = PDFDict.withContext(context);
  outlineDict.set(PDFName.of('Type'), PDFName.of('Outlines'));
  outlineDict.set(PDFName.of('Count'), PDFNumber.of(countAllBookmarks(bookmarks)));
  const outlineRef = context.register(outlineDict);
  
  const { first, last } = buildOutlineTree(pdfDoc, bookmarks, outlineRef);
  
  if (first && last) {
    outlineDict.set(PDFName.of('First'), first);
    outlineDict.set(PDFName.of('Last'), last);
  }
  
  catalog.set(PDFName.of('Outlines'), outlineRef);
}

function countAllBookmarks(bookmarks: BookmarkItem[]): number {
  let count = 0;
  for (const bookmark of bookmarks) {
    count++;
    count += countAllBookmarks(bookmark.children);
  }
  return count;
}

function buildOutlineTree(
  pdfDoc: PDFDocument,
  bookmarks: BookmarkItem[],
  parentRef: PDFRef
): { first: PDFRef | null; last: PDFRef | null } {
  if (bookmarks.length === 0) {
    return { first: null, last: null };
  }
  
  const context = pdfDoc.context;
  const pages = pdfDoc.getPages();
  const outlineItems: { dict: PDFDict; ref: PDFRef }[] = [];
  
  for (const bookmark of bookmarks) {
    const pageIndex = Math.max(0, Math.min(bookmark.pageIndex, pages.length - 1));
    const page = pages[pageIndex];
    const pageRef = pdfDoc.getPage(pageIndex).ref;
    const { height } = page.getSize();
    
    const destArray = PDFArray.withContext(context);
    destArray.push(pageRef);
    destArray.push(PDFName.of('XYZ'));
    destArray.push(PDFNumber.of(0));
    destArray.push(PDFNumber.of(height));
    destArray.push(context.obj(null));
    
    const itemDict = PDFDict.withContext(context);
    itemDict.set(PDFName.of('Title'), PDFHexString.fromText(bookmark.title));
    itemDict.set(PDFName.of('Parent'), parentRef);
    itemDict.set(PDFName.of('Dest'), destArray);
    
    const itemRef = context.register(itemDict);
    
    if (bookmark.children.length > 0) {
      const childCount = countAllBookmarks(bookmark.children);
      itemDict.set(PDFName.of('Count'), PDFNumber.of(childCount));
      
      const { first: childFirst, last: childLast } = buildOutlineTree(
        pdfDoc,
        bookmark.children,
        itemRef
      );
      
      if (childFirst && childLast) {
        itemDict.set(PDFName.of('First'), childFirst);
        itemDict.set(PDFName.of('Last'), childLast);
      }
    }
    
    outlineItems.push({ dict: itemDict, ref: itemRef });
  }
  
  for (let i = 0; i < outlineItems.length; i++) {
    const item = outlineItems[i];
    if (i > 0) {
      item.dict.set(PDFName.of('Prev'), outlineItems[i - 1].ref);
    }
    if (i < outlineItems.length - 1) {
      item.dict.set(PDFName.of('Next'), outlineItems[i + 1].ref);
    }
  }
  
  return {
    first: outlineItems[0]?.ref || null,
    last: outlineItems[outlineItems.length - 1]?.ref || null,
  };
}
