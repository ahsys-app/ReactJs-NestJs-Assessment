import {useEffect, useMemo, useState} from "react";
import Table from "react-bootstrap/Table";
import moment from "moment";

import {Pagination, PaginationItem} from "@mui/material";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';

const useSortableData = (items, config = null) => {

    const [sortConfig, setSortConfig] = useState(config);

    const sortedItems = useMemo(() => {
        let sortableItems = [...items];
        if (sortConfig !== null) {
            sortableItems.sort((a, b) => {
                if (a[sortConfig.key] < b[sortConfig.key]) {
                    return sortConfig.direction === 'ascending' ? -1 : 1;
                }
                if (a[sortConfig.key] > b[sortConfig.key]) {
                    return sortConfig.direction === 'ascending' ? 1 : -1;
                }
                return 0;
            });
        }
        console.log(sortableItems)
        return sortableItems;
    }, [items, sortConfig]);

    const requestSort = (key) => {
        let direction = 'ascending';
        if (
            sortConfig &&
            sortConfig.key === key &&
            sortConfig.direction === 'ascending'
        ) {
            direction = 'descending';
        }
        setSortConfig({ key, direction });
    };

    return { items: sortedItems, requestSort, sortConfig };
};

const calculateRange = (data, rowsPerPage) => {
    const range = [];
    const num = Math.ceil(data.length / rowsPerPage);
    let i = 1;
    for (let i = 1; i <= num; i++) {
        range.push(i);
    }
    return range;
};

const sliceData = (data, page, rowsPerPage) => {
    return data.slice((page - 1) * rowsPerPage, page * rowsPerPage);
};

const useTable = (data, page, rowsPerPage) => {
    const [tableRange, setTableRange] = useState([]);
    const [slice, setSlice] = useState([]);

    useEffect(() => {
        const range = calculateRange(data, rowsPerPage);
        setTableRange([...range]);

        const slice = sliceData(data, page, rowsPerPage);
        setSlice([...slice]);
    }, [data, setTableRange, page, setSlice]);

    return { slice, range: tableRange };
};

const TableFooter = ({ range, setPage, page, slice }) => {
    useEffect(() => {
        if (slice.length < 1 && page !== 1) {
            setPage(page - 1);
        }
    }, [slice, page, setPage]);

    return (
        <div>
            <Pagination
                count={range.length}
                page={page}
                shape={'rounded'}
                variant={'text'}
                onChange={(e, i) => setPage(i)}
                renderItem={(item) => (
                    <PaginationItem
                        slots={{ previous: ArrowBackIcon, next: ArrowForwardIcon }}
                        {...item}
                    />
                )}
            />
        </div>
    );
};

const CustomTable = ({ rows, rowsPerPage }) => {

    const { items, requestSort, sortConfig } = useSortableData(rows);
    const [page, setPage] = useState(1);
    const { slice, range, } = useTable(items, page, rowsPerPage);

    const getClassNamesFor = (name) => {
        if (!sortConfig) {
            return;
        }
        return sortConfig.key === name ? sortConfig.direction : undefined;
    };

    const dateFormat = "L LT";

    return (
        <>
        <Table striped>
            <thead>
            <tr>
                <th>
                    <div onClick={() => requestSort('createdAt')} className={getClassNamesFor('createdAt')}>
                        Date & Time
                    </div>
                </th>
                <th>
                    <div onClick={() => requestSort('from')} className={getClassNamesFor('from')}>
                        Currency From
                    </div>
                </th>
                <th>
                    <div onClick={() => requestSort('amount')} className={getClassNamesFor('amount')}>
                        Amount 1
                    </div>
                </th>
                <th>
                    <div onClick={() => requestSort('to')} className={getClassNamesFor('to')}>
                        Currency To
                    </div>
                </th>
                <th>
                    <div onClick={() => requestSort('amount_to')} className={getClassNamesFor('amount_to')}>
                        Amount 2
                    </div>
                </th>
                <th>
                    <div>Type</div>
                </th>
            </tr>
            </thead>
            <tbody>
            {slice.map((item) => (
                <tr key={item._id}>
                    <td>{moment(item.createdAt).format(dateFormat)}</td>
                    <td>{item.from}</td>
                    <td>{item.amount}</td>
                    <td>{item.to}</td>
                    <td>{item.amount_to}</td>
                    <td>
                        <div className={'exchange-' + item.type}>
                            {item.type}
                        </div>
                    </td>
                </tr>
            ))}
            </tbody>
        </Table>
        <TableFooter page={page} setPage={setPage} range={range} slice={slice} />
        </>
    );
};

export default CustomTable;