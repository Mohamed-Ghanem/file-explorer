import React, { useEffect, useState } from "react";

import FileExplorer from "components/FileExplorer/FileExplorer";
import { getFileSystem } from "services/files";

const Homepage: React.FC = ({}) => {
  const [fileSystem, setFileSystem] = useState();

  useEffect(() => {
    const getData = async () => {
      const fileSystem = await getFileSystem();
      setFileSystem(fileSystem);
    };

    getData();
  }, []);

  return (
    <div>
      File Explorer
      <FileExplorer fileSystem={fileSystem} />
    </div>
  );
};

export default Homepage;
