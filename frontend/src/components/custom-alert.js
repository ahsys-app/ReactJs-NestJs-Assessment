import Select from "react-select";
import {Col, Row} from "react-bootstrap";
import {Alert} from "@mui/material";

const CustomAlert = ({ active, text }) => {
    return (
        <>
            { active &&
            <Row>
                <Col>
                    <Alert className={'alert-custom'} icon={false} variant="filled">{text}</Alert>
                </Col>
            </Row> }
        </>
    );
}

export default CustomAlert;