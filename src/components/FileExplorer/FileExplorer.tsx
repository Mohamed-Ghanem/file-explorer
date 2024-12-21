import React, { useEffect, useState, useRef } from "react";

import { getFileIcon, getFolderIcon } from "utils/svgs";
import { findParentFolder, getItemKey } from "utils/helpers";

import "./FileExplorer.css";

interface FileExplorerProps {
  fileSystem: FileSystemType;
}

const FileExplorer: React.FC<FileExplorerProps> = ({ fileSystem }) => {
  const menuRef = useRef<HTMLDivElement>(null);

  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(
    new Set()
  );
  const [contextMenu, setContextMenu] = useState<{
    visible: boolean;
    x: number;
    y: number;
    item: FileType | Folder | null;
  }>({
    visible: false,
    x: 0,
    y: 0,
    item: null,
  });

  const handleClickOutside = (e: MouseEvent) => {
    if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
      setContextMenu({ ...contextMenu, visible: false });
    }
  };

  useEffect(() => {
    document.addEventListener("click", handleClickOutside);
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, [contextMenu]);

  const handleFolderToggle = (folder: Folder) => {
    setExpandedFolders((prev) => {
      const updated = new Set(prev);
      const key = getItemKey(folder);
      if (updated.has(key)) {
        updated.delete(key);
      } else {
        updated.add(key);
      }
      return updated;
    });
  };

  const handleRightClick = (e: React.MouseEvent, item: FileType | Folder) => {
    e.preventDefault();
    setContextMenu({
      visible: true,
      x: e.clientX,
      y: e.clientY,
      item,
    });
  };

  const handleRename = () => {
    if (contextMenu.item) {
      const newName = prompt("Enter new name", contextMenu.item.name);
      if (newName && newName !== contextMenu.item.name) {
        const renameItem = (item: FileType | Folder) => {
          if (item === contextMenu.item) {
            item.name = newName;
          }
          if (item.type === "folder") {
            item.data.forEach(renameItem);
          }
        };
        renameItem(fileSystem);

        setExpandedFolders((prev) => {
          const updated = new Set(prev);
          const key = getItemKey(contextMenu.item);
          updated.delete(key);
          updated.add(getItemKey({ ...contextMenu.item, name: newName }));
          return updated;
        });
      }
    }
    setContextMenu({ ...contextMenu, visible: false });
  };

  const handleCopy = () => {
    if (contextMenu.item) {
      navigator.clipboard.writeText(contextMenu.item.name);
    }
    setContextMenu({ ...contextMenu, visible: false });
  };

  const handleDelete = () => {
    if (contextMenu.item) {
      const deleteItem = (parent: Folder, item: FileType | Folder) => {
        const index = parent.data.findIndex((i) => i === item);
        if (index > -1) {
          parent.data.splice(index, 1);
        }
        if (parent.type === "folder") {
          parent.data.forEach((subItem) => {
            if (subItem.type === "folder") {
              deleteItem(subItem, item);
            }
          });
        }
      };
      if (contextMenu.item.type === "folder") {
        deleteItem(fileSystem, contextMenu.item);
      } else {
        const parentFolder = findParentFolder(fileSystem, contextMenu.item);
        if (parentFolder) {
          deleteItem(parentFolder, contextMenu.item);
        }
      }
    }
    setContextMenu({ ...contextMenu, visible: false });
  };

  const renderItem = (item: FileType | Folder) => {
    if (item.type === "file") {
      return (
        <div
          key={getItemKey(item)}
          onContextMenu={(e) => handleRightClick(e, item)}
          className="file"
        >
          <span className="icon">{getFileIcon(item.meta)}</span>
          <span style={{ marginLeft: "5px" }}>{item.name}</span>
        </div>
      );
    }

    const isExpanded = expandedFolders.has(getItemKey(item));
    return (
      <div key={getItemKey(item)}>
        <div
          onClick={() => handleFolderToggle(item)}
          onContextMenu={(e) => handleRightClick(e, item)}
          className={isExpanded ? "folder expanded" : "folder"}
        >
          <span className="icon">{getFolderIcon()}</span>
          <span style={{ marginLeft: "5px" }}>
            {isExpanded ? "[-]" : "[+]"} {item.name}
          </span>
        </div>
        {isExpanded && (
          <div style={{ marginLeft: "20px" }}>{item.data.map(renderItem)}</div>
        )}
      </div>
    );
  };

  return (
    <div>
      {fileSystem && <div>{renderItem(fileSystem)}</div>}

      {contextMenu.visible && (
        <div
          ref={menuRef}
          className="context-menu"
          style={{
            top: contextMenu.y,
            left: contextMenu.x,
          }}
        >
          <button onClick={handleCopy}>Copy</button>
          <button onClick={handleRename}>Rename</button>
          <button onClick={handleDelete}>Delete</button>
        </div>
      )}
    </div>
  );
};

export default FileExplorer;
