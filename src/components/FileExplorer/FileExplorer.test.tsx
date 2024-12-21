import { render, fireEvent, screen } from "@testing-library/react";
import FileExplorer from "./FileExplorer";

describe("FileExplorer Folder Expansion/Collapse", () => {
  const fileSystem = {
    type: "folder",
    name: "parent",
    data: [
      {
        type: "folder",
        name: "root",
        data: [],
      },
    ],
  };
  it("should toggle folder expansion when clicked", () => {
    render(<FileExplorer fileSystem={fileSystem} />);

    const folderName = screen.getByText("[+] parent");
    expect(folderName).toBeInTheDocument();

    fireEvent.click(folderName);

    expect(screen.getByText("[-] parent")).toBeInTheDocument();
    expect(screen.getByText("[+] root")).toBeInTheDocument();

    fireEvent.click(screen.getByText("[-] parent"));

    expect(screen.getByText("[+] parent")).toBeInTheDocument();
  });
});

describe("FileExplorer Context Menu", () => {
  let fileSystem: any;

  beforeEach(() => {
    fileSystem = {
      type: "folder",
      name: "parent",
      data: [
        {
          type: "folder",
          name: "root",
          data: [{ type: "file", name: "file.js", meta: "js" }],
        },
      ],
    };
  });

  it("should show context menu and call rename", () => {
    const promptMock = jest
      .spyOn(window, "prompt")
      .mockImplementationOnce(() => "newFile.js")
      .mockImplementationOnce(() => "new root");

    const { getByText, queryByText } = render(
      <FileExplorer fileSystem={fileSystem} />
    );

    fireEvent.click(getByText("[+] parent"));
    fireEvent.click(getByText("[+] root"));

    const fileItem = getByText("file.js");

    fireEvent.contextMenu(fileItem);

    const renameButton = getByText("Rename");
    fireEvent.click(renameButton);
    fireEvent.click(renameButton);

    expect(queryByText("file.js")).toBeNull();
    expect(fileSystem.data[0].data[0].name).toBe("newFile.js");
    expect(getByText("newFile.js")).toBeInTheDocument();

    // const folderItem = getByText("[-] root");

    // fireEvent.contextMenu(folderItem);

    // fireEvent.click(renameButton);
    // fireEvent.click(renameButton);

    // expect(queryByText("[-] root")).toBeNull();
    // expect(fileSystem.data[0].data[0].name).toBe("[-] new root");
    // expect(getByText("[-] new root")).toBeInTheDocument();

    promptMock.mockRestore();
  });

  it("should delete an item", () => {
    const { getByText, queryByText } = render(
      <FileExplorer fileSystem={fileSystem} />
    );

    fireEvent.click(getByText("[+] parent"));
    fireEvent.click(getByText("[+] root"));

    const fileItem = getByText("file.js");

    fireEvent.contextMenu(fileItem);

    const deleteButton = getByText("Delete");
    fireEvent.click(deleteButton);

    expect(queryByText("file.js")).toBeNull();
  });

  it("should copy an item into clipboard", () => {
    const writeTextMock = jest.fn();
    Object.defineProperty(global, "navigator", {
      value: {
        clipboard: {
          writeText: writeTextMock,
        },
      },
      writable: true,
    });

    const { getByText } = render(<FileExplorer fileSystem={fileSystem} />);

    fireEvent.click(getByText("[+] parent"));
    fireEvent.click(getByText("[+] root"));

    const fileItem = getByText("file.js");

    fireEvent.contextMenu(fileItem);

    const copyButton = getByText("Copy");
    fireEvent.click(copyButton);

    expect(writeTextMock).toHaveBeenCalledWith("file.js");
  });

  it("should close the context menu when clicking outside", () => {
    render(<FileExplorer fileSystem={fileSystem} />);

    const parentFolder = screen.getByText("[+] parent");
    fireEvent.contextMenu(parentFolder);

    const renameButton = screen.getByText("Rename");
    expect(renameButton).toBeInTheDocument();

    fireEvent.click(document.body);

    expect(renameButton).not.toBeInTheDocument();
  });
});

describe("FileExplorer Render of Different File Types", () => {
  const fileSystem = {
    type: "folder",
    name: "parent",
    data: [
      { type: "file", name: "index.js", meta: "js" },
      { type: "file", name: "index.ts", meta: "ts" },
      { type: "file", name: "index.html", meta: "html" },
      { type: "file", name: "index.img", meta: "img" },
      { type: "file", name: "index.svg", meta: "svg" },
    ],
  };
  it("should render file with correct icon based on file type", () => {
    const { getByText } = render(<FileExplorer fileSystem={fileSystem} />);

    fireEvent.click(getByText("[+] parent"));

    expect(screen.getByTestId("folder-svg")).toBeInTheDocument();
    expect(screen.getByTestId("js-svg")).toBeInTheDocument();
    expect(getByText("index.js")).toBeInTheDocument();
    expect(screen.getByTestId("ts-svg")).toBeInTheDocument();
    expect(getByText("index.ts")).toBeInTheDocument();
    expect(screen.getByTestId("html-svg")).toBeInTheDocument();
    expect(getByText("index.html")).toBeInTheDocument();
    expect(screen.getByTestId("img-svg")).toBeInTheDocument();
    expect(getByText("index.img")).toBeInTheDocument();
    expect(screen.getByTestId("svg-svg")).toBeInTheDocument();
    expect(getByText("index.svg")).toBeInTheDocument();
  });
});

describe("FileExplorer Folder Expansion with Nested Items", () => {
  const nestedFileSystem = {
    type: "folder",
    name: "parent",
    data: [
      {
        type: "folder",
        name: "subfolder",
        data: [
          { type: "file", name: "file1.js", meta: "js" },
          { type: "file", name: "file2.ts", meta: "ts" },
        ],
      },
    ],
  };
  it("should render nested folders correctly and expand/collapse them", () => {
    const { getByText } = render(
      <FileExplorer fileSystem={nestedFileSystem} />
    );

    expect(getByText("[+] parent")).toBeInTheDocument();

    fireEvent.click(getByText("[+] parent"));
    fireEvent.click(getByText("[+] subfolder"));

    expect(getByText("file1.js")).toBeInTheDocument();
    expect(getByText("file2.ts")).toBeInTheDocument();
  });
});
