import Button from "react-bootstrap/Button";
import Card from "react-bootstrap/Card";
import CreateClassDialogComponent from "./createClassDialogComponent.tsx";
import { useState } from "react";
function ClassCardComponent({ cls }) {
    const [classDialogOpen, setClassDialogOpen] = useState(false);
    const openDialog = () => {
        setClassDialogOpen(true);
    };
    //const closeDialog = () => setClassDialogOpen(false)};
    return (<>
      <Card className="text-center" style={{ width: "18rem" }}>
        <Card.Header>{cls.className}</Card.Header>
        <Card.Body>
          <Button variant="primary" onClick={openDialog}>
            Klasse erzeugen
          </Button>
        </Card.Body>
        <Card.Footer className="text-muted">
          From File: {cls.tsFile.name}
        </Card.Footer>
      </Card>
      {classDialogOpen && (<CreateClassDialogComponent cls={cls}></CreateClassDialogComponent>)}
    </>);
}
export default ClassCardComponent;
//# sourceMappingURL=classCardComponent.js.map