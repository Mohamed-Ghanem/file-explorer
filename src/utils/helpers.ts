export const getItemKey = (item: FileType | Folder) =>
  `${item.type}-${item.name}`;

export const findParentFolder = (
  parent: Folder,
  item: FileType | Folder
): Folder | null => {
  if (parent.data.includes(item)) {
    return parent;
  }
  for (const subItem of parent.data) {
    if (subItem.type === "folder") {
      const found = findParentFolder(subItem, item);
      if (found) {
        return found;
      }
    }
  }
  return null;
};
