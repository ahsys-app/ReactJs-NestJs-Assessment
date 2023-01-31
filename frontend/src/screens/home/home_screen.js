import {Button, Container, FormControl, MenuItem, TextField, Select} from "@mui/material";
import {Col, Row} from "react-bootstrap";
import {useEffect, useState} from "react";
import axios from "axios";
import CustomSelect from '../../components/custom-select'
import { EXCHANGE_TYPES } from "../../enums/exchange_types";
import CustomTable from "../../components/custom-table";
import {io} from "socket.io-client";
import CustomAlert from "../../components/custom-alert";
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterMoment } from '@mui/x-date-pickers/AdapterMoment';
import {DesktopDatePicker} from "@mui/x-date-pickers";
import moment from "moment";
import {FILTER_TYPES} from "../../enums/filter_types";
const Backend = require('../../resources/backend');

const socket = io(process.env.REACT_APP_BASE_URL, {
    withCredentials: false,
});

export default function HomeScreen() {

    // init
    const [coinFromData, setCoinFromData] = useState([]); //  value like : [{ value: 'BTC', label: 'BTC',}]
    const [coinFrom, setCoinFrom] = useState({});
    const [coinToData, setCoinToData] = useState([]);
    const [coinTo, setCoinTo] = useState({});

    //Alert
    const [showAlert, setShowAlert] = useState(false);

    //Exchange History Data
    const [exchangeData, setExchangeData] = useState([]);

    // Exchange Form
    const [fromAmount, setFromAmount] = useState('');
    const [toAmount, setToAmount] = useState('');
    const [exchangeType, setExchangeType] = useState(EXCHANGE_TYPES.FROM_CRYPTO);

    //Socket
    const [isConnected, setIsConnected] = useState(socket.connected);

    //Filtration
    const [filterDateFrom, setFilterDateFrom] = useState(null);
    const [filterDateTo, setFilterDateTo] = useState(null);
    const [filterType, setFilterType] = useState('');

    /**
     * Get form Currencies
     */
    useEffect(() => {
        const getCurrenciesRequest = async () => {
            try {
                const response = await axios.get(Backend.currency);
                //Crypto currencies
                let cryptoArray = []
                response.data.crypto.map((item, index) => {
                    const obj = {value: item, label: item}
                    if( index === 0 ) setCoinFrom(obj)
                    cryptoArray.push(obj);
                });
                setCoinFromData(cryptoArray)
                //currencies
                let currenciesArray = []
                response.data.currency.map((item, index) => {
                    const obj = {value: item, label: item}
                    if( index === 0 ) setCoinTo(obj)
                    currenciesArray.push({value: item, label: item});
                });
                setCoinToData(currenciesArray)
            } catch (error) {
                console.error(error);
            }
        }
        getCurrenciesRequest().catch(console.error);
    }, [])

    /**
     * Get Exchanges History Data
     */
    const getExchangeHistory = async () => {
        try {
            const response = await axios.get(Backend.getExchangeHistory, {
                params: {
                    type: filterType,
                    from: filterDateFrom ? moment(filterDateFrom).format("YYYY-MM-DD") : '',
                    to: filterDateTo ? moment(filterDateTo).format("YYYY-MM-DD") : '',
                }
            });
            setExchangeData(response.data);
        } catch (error) {
            console.error(error);
        }
    }
    useEffect(() => {
        getExchangeHistory().catch(console.error);
    }, [])

    /**
     * Exchange Functionality
     */
    const handleAmountChange = (e, callback, exchangeType) => {
        callback(e.target.value);
        setExchangeType(exchangeType);
    }
    useEffect(() => {
        const timer = setTimeout(() => {
            if( fromAmount !== '' || toAmount !== ''){
                if( exchangeType === EXCHANGE_TYPES.FROM_CRYPTO ){
                    getExchangeRate(fromAmount, coinFrom.value, coinTo.value, exchangeType).catch(console.error);
                }else{
                    getExchangeRate(toAmount, coinTo.value, coinFrom.value, exchangeType).catch(console.error);
                }
            }
        }, 500)
        return () => clearTimeout(timer)
    }, [fromAmount, toAmount])
    const getExchangeRate = async (amount, from, to, exchangeType) => {
        try {
            const response = await axios.post(Backend.getExchangeRates, {amount, from, to});
            if( exchangeType === EXCHANGE_TYPES.FROM_CRYPTO ){
                setToAmount(response.data)
            }else{
                setFromAmount(response.data)
            }
        } catch (error) {
            console.error(error);
        }
    }

    /**
     * Add Exchange Rate from User
     */
    const addExchangeByUser = async () => {
        try {
            const amount = exchangeType === EXCHANGE_TYPES.FROM_CRYPTO ? fromAmount.toString() : toAmount.toString();
            const amount_to = exchangeType === EXCHANGE_TYPES.FROM_CRYPTO ? toAmount.toString() : fromAmount.toString();
            const from = exchangeType === EXCHANGE_TYPES.FROM_CRYPTO ? coinFrom.value : coinTo.value;
            const to = exchangeType === EXCHANGE_TYPES.FROM_CRYPTO ? coinTo.value : coinFrom.value;
            const response = await axios.post(Backend.addExchangeByUser, {amount, amount_to, from, to});
            setFromAmount('');
            setToAmount('');
            setShowAlert(true);
            setExchangeData([response.data, ...exchangeData]);
            setTimeout( () => setShowAlert(false), 3000);
        } catch (error) {
            console.error(error);
        }
    }

    /**
     *  Socket Functionality
     */
    useEffect(() => {
        socket.on('connect', () => {
            setIsConnected(true);
        });
        socket.on('disconnect', () => {
            setIsConnected(false);
        });

        socket.on('sendData', (data) => {
            /**
             * if you use: `setExchangeData([data, ...exchangeData])` the data `exchangeData` will be empty.
             * so you have to change the way to this: setExchangeData(exchangeData => [data, ...exchangeData])
             * This way the function passed to setExchangeData will receive the current state and will use it correctly.
             */
            setExchangeData(exchangeData => [data, ...exchangeData])
        });

        return () => {
            /**
             * Important for not duplicated the data after received
             * by cleanup the event listener when the component unmounts
             */
            socket.off('sendData');
            socket.off('connect');
            socket.off('disconnect');
        };
    }, []);

    return (
        <Container>
            <Row className={'home-row'}>
                <Col><h3 className={'form-title'}>Exchange</h3></Col>

                { showAlert && <CustomAlert active={showAlert} text={'Exchange submitted.'} /> }

                <Row className={'exchangeFormRow'}>
                    <Col lg={2} sm={12}>
                        <p>Currency from</p>
                        <CustomSelect options={coinFromData} defaultValue={coinFrom} onChange={(e) => setCoinFrom(e)} />
                    </Col>
                    <Col lg={2} sm={12}>
                        <p>Amount</p>
                        <TextField type="number" fullWidth size="small" variant="outlined"
                                   value={fromAmount}
                                   onChange={(e) => handleAmountChange(e, setFromAmount, EXCHANGE_TYPES.FROM_CRYPTO)}
                             />
                    </Col>
                    <Col lg={1} className="equalCol d-sm-none d-lg-block"></Col>
                    <Col lg={2} sm={12}>
                        <p>Currency to</p>
                        <CustomSelect options={coinToData} defaultValue={coinTo} onChange={(e) => setCoinTo(e)} />
                    </Col>
                    <Col lg={2} sm={12}>
                        <p>Amount</p>
                        <TextField type="number" fullWidth size="small" variant="outlined"
                                   value={toAmount}
                                   onChange={(e) => handleAmountChange(e, setToAmount, EXCHANGE_TYPES.TO_CRYPTO)} />
                    </Col>
                    <Col lg={3} sm={12}>
                        <p>&nbsp;</p>
                        <Button fullWidth variant="contained" color="success" onClick={addExchangeByUser}>Exchange</Button>
                    </Col>
                </Row>

                <Row className={'history-section'}>
                    <Col><h3 className={'form-title'}>History</h3></Col>
                    <Col lg={12}>
                        <Row className={'search-toolbar'}>
                            <Col lg={3} sm={4}>
                                <p className={'pTitle'}>From date</p>
                                <LocalizationProvider dateAdapter={AdapterMoment}>
                                    <DesktopDatePicker
                                        size="small"
                                        value={filterDateFrom}
                                        onChange={(newValue) => {
                                            setFilterDateFrom(newValue)
                                        }}
                                        renderInput={(params) =>
                                            <TextField
                                                id="date"
                                                type="date"
                                                defaultValue={filterDateFrom}
                                                sx={{ width: 220 }}
                                                InputLabelProps={{
                                                    shrink: true,
                                                }}
                                                {...params}
                                            />}
                                    />
                                </LocalizationProvider>
                            </Col>
                            <Col lg={3} sm={4}>
                                <p className={'pTitle'}>From date</p>
                                <LocalizationProvider dateAdapter={AdapterMoment}>
                                    <DesktopDatePicker
                                        size="small"
                                        value={filterDateTo}
                                        onChange={(newValue) => {
                                            setFilterDateTo(newValue)
                                        }}
                                        renderInput={(params) =>
                                            <TextField
                                                id="date"
                                                type="date"
                                                defaultValue={filterDateTo}
                                                sx={{ width: 220 }}
                                                InputLabelProps={{
                                                    shrink: true,
                                                }}
                                                {...params}
                                            />}
                                    />
                                </LocalizationProvider>
                            </Col>
                            <Col lg={2} sm={4}>
                                <p className={'pTitle'}>Type</p>
                                <FormControl className={'m-0'} sx={{ m: 1, minWidth: 120 }} size="small">
                                    <Select
                                        value={filterType}
                                        displayEmpty
                                        onChange={(e) => setFilterType(e.target.value)}>
                                        <MenuItem value="">All</MenuItem>
                                        <MenuItem value={FILTER_TYPES.EXCHANGED}>Exchanged</MenuItem>
                                        <MenuItem value={FILTER_TYPES.LIVE}>Live price</MenuItem>
                                    </Select>
                                </FormControl>
                            </Col>
                            <Col lg={2} sm={4}>
                                <p className={'pTitle'}>&nbsp;</p>
                                <Button className={'filter-btn'} variant="outlined" onClick={() => getExchangeHistory()}>Filter</Button>
                            </Col>

                        </Row>
                        <CustomTable rows={exchangeData} rowsPerPage={10} />
                    </Col>
                </Row>

            </Row>
        </Container>
    )
}