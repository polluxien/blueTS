import { Typescript } from "react-bootstrap-icons";
import type { DirectoryRespondeType } from "../ressources/response/directoryResponde";

type DirectorySettingsComponentType = {
  currentDirectoryRes?: DirectoryRespondeType;
};

function HeaderComponent({
  currentDirectoryRes,
}: DirectorySettingsComponentType) {
  return (
    <header
      className="w-100 mb-3 pb-2 d-flex justify-content-between align-items-end"
      style={{
        borderBottom: `2px solid`,
      }}
    >
      <div>
        <h3 className="fw-bold mb-0" style={{ fontSize: "1.4rem" }}>
          blueTS View
        </h3>
        <small>{currentDirectoryRes?.fileCount ?? 0} files</small>
      </div>
      <Typescript size={45} color={"#304674"} />
    </header>
  );
}

export default HeaderComponent;
