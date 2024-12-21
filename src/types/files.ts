type FileType = {
  type: "file";
  name: string;
  meta: string;
};

type Folder = {
  type: "folder";
  name: string;
  data: (Folder | FileType)[];
};

type FileSystemType = Folder;
